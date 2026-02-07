#include <windows.h>
#include <tlhelp32.h>

#include <cstdint>
#include <cstdio>
#include <fstream>
#include <regex>
#include <string>
#include <vector>

static void log_line(const char* level, const std::string& msg) {
    std::printf("[%s] %s\n", level, msg.c_str());
    std::fflush(stdout);
}

static DWORD find_process_id(const wchar_t* exe_name) {
    HANDLE snapshot = CreateToolhelp32Snapshot(TH32CS_SNAPPROCESS, 0);
    if (snapshot == INVALID_HANDLE_VALUE) {
        log_line("ERR", "CreateToolhelp32Snapshot failed");
        return 0;
    }

    PROCESSENTRY32W entry{};
    entry.dwSize = sizeof(entry);

    if (!Process32FirstW(snapshot, &entry)) {
        CloseHandle(snapshot);
        log_line("ERR", "Process32FirstW failed");
        return 0;
    }

    DWORD pid = 0;
    do {
        if (_wcsicmp(entry.szExeFile, exe_name) == 0) {
            pid = entry.th32ProcessID;
            break;
        }
    } while (Process32NextW(snapshot, &entry));

    CloseHandle(snapshot);
    return pid;
}

static bool get_module_base(DWORD pid, const wchar_t* module_name, uintptr_t& base, DWORD& size, std::wstring& path_out) {
    HANDLE snapshot = CreateToolhelp32Snapshot(TH32CS_SNAPMODULE | TH32CS_SNAPMODULE32, pid);
    if (snapshot == INVALID_HANDLE_VALUE) {
        log_line("ERR", "CreateToolhelp32Snapshot(SNAPMODULE) failed");
        return false;
    }

    MODULEENTRY32W me{};
    me.dwSize = sizeof(me);

    if (!Module32FirstW(snapshot, &me)) {
        CloseHandle(snapshot);
        log_line("ERR", "Module32FirstW failed");
        return false;
    }

    bool found = false;
    do {
        if (_wcsicmp(me.szModule, module_name) == 0) {
            base = reinterpret_cast<uintptr_t>(me.modBaseAddr);
            size = me.modBaseSize;
            path_out = me.szExePath;
            found = true;
            break;
        }
    } while (Module32NextW(snapshot, &me));

    CloseHandle(snapshot);
    return found;
}

struct PatternByte {
    uint8_t value;
    bool is_wildcard;
};

static std::vector<PatternByte> parse_pattern(const std::string& pattern) {
    std::vector<PatternByte> bytes;
    for (size_t i = 0; i < pattern.size();) {
        if (pattern[i] == ' ') {
            ++i;
            continue;
        }
        if (pattern[i] == '?') {
            bytes.push_back({0, true});
            if (i + 1 < pattern.size() && pattern[i + 1] == '?') {
                i += 2;
            } else {
                i += 1;
            }
            continue;
        }
        if (i + 1 >= pattern.size()) {
            break;
        }
        char buf[3] = {pattern[i], pattern[i + 1], 0};
        uint8_t val = static_cast<uint8_t>(std::strtoul(buf, nullptr, 16));
        bytes.push_back({val, false});
        i += 2;
    }
    return bytes;
}

static uintptr_t find_pattern(HANDLE proc, uintptr_t base, size_t size, const std::string& pattern) {
    const auto bytes = parse_pattern(pattern);
    if (bytes.empty()) {
        return 0;
    }

    std::vector<uint8_t> buffer(size);
    SIZE_T read = 0;
    if (!ReadProcessMemory(proc, reinterpret_cast<LPCVOID>(base), buffer.data(), buffer.size(), &read)) {
        log_line("ERR", "ReadProcessMemory failed for module scan");
        return 0;
    }

    for (size_t i = 0; i + bytes.size() <= read; ++i) {
        bool match = true;
        for (size_t j = 0; j < bytes.size(); ++j) {
            if (!bytes[j].is_wildcard && buffer[i + j] != bytes[j].value) {
                match = false;
                break;
            }
        }
        if (match) {
            return base + i;
        }
    }

    return 0;
}

static bool read_file(const std::string& path, std::string& out) {
    std::ifstream f(path, std::ios::in | std::ios::binary);
    if (!f) return false;
    std::string content((std::istreambuf_iterator<char>(f)), std::istreambuf_iterator<char>());
    out = std::move(content);
    return true;
}

static bool extract_uint64(const std::string& json, const std::string& key, uint64_t& out) {
    std::regex re("\\\"" + key + "\\\"\\s*:\\s*([0-9]+)");
    std::smatch m;
    if (std::regex_search(json, m, re)) {
        out = std::stoull(m[1].str());
        return true;
    }
    return false;
}

static bool extract_bool(const std::string& json, const std::string& key, bool& out) {
    std::regex re("\\\"" + key + "\\\"\\s*:\\s*(true|false)");
    std::smatch m;
    if (std::regex_search(json, m, re)) {
        out = (m[1].str() == "true");
        return true;
    }
    return false;
}

static bool extract_string(const std::string& json, const std::string& key, std::string& out) {
    std::regex re("\\\"" + key + "\\\"\\s*:\\s*\\\"([^\\\"]+)\\\"");
    std::smatch m;
    if (std::regex_search(json, m, re)) {
        out = m[1].str();
        return true;
    }
    return false;
}

struct Patterns {
    std::string player_resource_pattern;
    uint64_t player_resource_offset = 0;
    bool player_resource_relative = true;
    uint64_t player_steamid_offset = 0;
    uint64_t player_steamid_stride = 8;
    uint32_t max_players = 10;
};

static bool load_patterns(const std::string& path, Patterns& out) {
    std::string json;
    if (!read_file(path, json)) {
        return false;
    }

    bool ok = true;
    ok &= extract_string(json, "pattern", out.player_resource_pattern);
    ok &= extract_uint64(json, "offset", out.player_resource_offset);
    extract_bool(json, "relative", out.player_resource_relative);
    ok &= extract_uint64(json, "player_steamid_offset", out.player_steamid_offset);
    extract_uint64(json, "player_steamid_stride", out.player_steamid_stride);
    uint64_t mp = 10;
    if (extract_uint64(json, "max_players", mp)) {
        out.max_players = static_cast<uint32_t>(mp);
    }
    return ok;
}

static bool read_u64(HANDLE proc, uintptr_t addr, uint64_t& out) {
    SIZE_T read = 0;
    if (!ReadProcessMemory(proc, reinterpret_cast<LPCVOID>(addr), &out, sizeof(out), &read)) {
        return false;
    }
    return read == sizeof(out);
}

static uintptr_t resolve_relative_address(HANDLE proc, uintptr_t instr_addr, uint64_t offset) {
    int32_t disp = 0;
    SIZE_T read = 0;
    if (!ReadProcessMemory(proc, reinterpret_cast<LPCVOID>(instr_addr + offset), &disp, sizeof(disp), &read)) {
        return 0;
    }
    if (read != sizeof(disp)) {
        return 0;
    }
    uintptr_t next = instr_addr + offset + sizeof(disp);
    return next + disp;
}

static bool ensure_dir(const std::wstring& path) {
    if (CreateDirectoryW(path.c_str(), nullptr) || GetLastError() == ERROR_ALREADY_EXISTS) {
        return true;
    }
    return false;
}

static bool copy_file_w(const std::wstring& from, const std::wstring& to) {
    return CopyFileW(from.c_str(), to.c_str(), FALSE) == TRUE;
}

static void write_text_file(const std::wstring& path, const std::string& text) {
    std::ofstream f(path, std::ios::out | std::ios::binary);
    if (!f) return;
    f.write(text.data(), static_cast<std::streamsize>(text.size()));
}

static int run_collect(const std::wstring& out_dir) {
    log_line("INFO", "Collector mode: gathering client.dll and diagnostics...");

    DWORD pid = find_process_id(L"dota2.exe");
    if (!pid) {
        log_line("ERR", "dota2.exe not found. Start Dota 2 first.");
        return 1;
    }

    uintptr_t client_base = 0;
    DWORD client_size = 0;
    std::wstring client_path;
    if (!get_module_base(pid, L"client.dll", client_base, client_size, client_path)) {
        log_line("ERR", "client.dll not found. Ensure Dota 2 is running.");
        return 1;
    }

    if (!ensure_dir(out_dir)) {
        log_line("ERR", "Failed to create output directory.");
        return 1;
    }

    std::wstring dst = out_dir + L"\\client.dll";
    if (!copy_file_w(client_path, dst)) {
        log_line("ERR", "Failed to copy client.dll. Try running as Administrator.");
        return 1;
    }

    std::string info = "pid=" + std::to_string(pid) + "\n" +
                       "client_base=0x" + std::to_string(static_cast<unsigned long long>(client_base)) + "\n" +
                       "client_size=" + std::to_string(client_size) + "\n";
    write_text_file(out_dir + L"\\info.txt", info);

    log_line("INFO", "Wrote client.dll and info.txt to output folder.");
    log_line("INFO", "Send this folder for pattern generation.");
    return 0;
}

int main(int argc, char** argv) {
    if (argc >= 2 && std::string(argv[1]) == "--collect") {
        std::wstring out_dir = L"collector_output";
        if (argc >= 4 && std::string(argv[2]) == "--out") {
            std::string out = argv[3];
            out_dir = std::wstring(out.begin(), out.end());
        }
        return run_collect(out_dir);
    }

    log_line("INFO", "Dota2 memory reader (read-only) starting...");

    DWORD pid = find_process_id(L"dota2.exe");
    if (!pid) {
        log_line("ERR", "dota2.exe not found. Start Dota 2 first.");
        return 1;
    }
    log_line("INFO", "Found dota2.exe PID: " + std::to_string(pid));

    HANDLE proc = OpenProcess(PROCESS_VM_READ | PROCESS_QUERY_INFORMATION, FALSE, pid);
    if (!proc) {
        log_line("ERR", "OpenProcess failed. Try running as Administrator.");
        return 1;
    }

    uintptr_t client_base = 0;
    DWORD client_size = 0;
    std::wstring client_path;
    if (!get_module_base(pid, L"client.dll", client_base, client_size, client_path)) {
        CloseHandle(proc);
        log_line("ERR", "client.dll not found. Ensure Dota 2 is running.");
        return 1;
    }

    log_line("INFO", "client.dll base: 0x" + std::to_string(static_cast<unsigned long long>(client_base)));

    Patterns patterns;
    if (!load_patterns("patterns.json", patterns)) {
        log_line("ERR", "patterns.json not found or missing keys. Copy patterns.example.json -> patterns.json and fill values.");
        CloseHandle(proc);
        return 1;
    }

    if (patterns.player_resource_pattern.empty() || patterns.player_steamid_offset == 0) {
        log_line("ERR", "Patterns not set. pattern and player_steamid_offset must be provided.");
        CloseHandle(proc);
        return 1;
    }

    log_line("INFO", "Scanning client.dll for PlayerResource signature...");
    uintptr_t sig_addr = find_pattern(proc, client_base, client_size, patterns.player_resource_pattern);
    if (!sig_addr) {
        log_line("ERR", "Signature not found. Update patterns.json.");
        CloseHandle(proc);
        return 1;
    }

    log_line("INFO", "Signature found at 0x" + std::to_string(static_cast<unsigned long long>(sig_addr)));

    uintptr_t player_resource_ptr_addr = 0;
    if (patterns.player_resource_relative) {
        player_resource_ptr_addr = resolve_relative_address(proc, sig_addr, patterns.player_resource_offset);
    } else {
        player_resource_ptr_addr = sig_addr + patterns.player_resource_offset;
    }

    if (!player_resource_ptr_addr) {
        log_line("ERR", "Failed to resolve PlayerResource pointer address.");
        CloseHandle(proc);
        return 1;
    }

    uint64_t player_resource = 0;
    if (!read_u64(proc, player_resource_ptr_addr, player_resource) || player_resource == 0) {
        log_line("ERR", "Failed to read PlayerResource pointer.");
        CloseHandle(proc);
        return 1;
    }

    log_line("INFO", "PlayerResource ptr: 0x" + std::to_string(static_cast<unsigned long long>(player_resource)));

    const uint64_t steam_id_base = 76561197960265728ULL;
    const uint32_t max_players = patterns.max_players;

    log_line("INFO", "Reading account IDs...");
    for (uint32_t i = 0; i < max_players; ++i) {
        uintptr_t entry_addr = static_cast<uintptr_t>(player_resource) +
            static_cast<uintptr_t>(patterns.player_steamid_offset + (patterns.player_steamid_stride * i));
        uint64_t steamid64 = 0;
        if (!read_u64(proc, entry_addr, steamid64)) {
            log_line("WARN", "Slot " + std::to_string(i) + ": read failed");
            continue;
        }
        if (steamid64 < steam_id_base) {
            log_line("WARN", "Slot " + std::to_string(i) + ": invalid steamid64");
            continue;
        }
        uint64_t account_id = steamid64 - steam_id_base;
        log_line("INFO", "Slot " + std::to_string(i) + ": steamid64=" +
            std::to_string(steamid64) + " account_id=" + std::to_string(account_id));
    }

    log_line("INFO", "Done. Press Enter to exit...");
    std::getchar();

    CloseHandle(proc);
    return 0;
}
