# Build (Windows)

## Prereqs (recommended)
- Visual Studio 2022 Build Tools or Visual Studio Community
- Workload: **Desktop development with C++**
- Windows 10/11 SDK
- CMake (3.20+)

## Build (PowerShell)
From repo root:

```
cmake -S tools/dota_mem_reader -B tools/dota_mem_reader/build -G "Visual Studio 17 2022"
cmake --build tools/dota_mem_reader/build --config Release
```

Binary output:
```
tools\dota_mem_reader\build\Release\dota_mem_reader.exe
```

## Run
1) Start Dota 2
2) Run the exe from PowerShell or cmd:

```
.\tools\dota_mem_reader\build\Release\dota_mem_reader.exe
```

It will keep the console open and print diagnostics.

## Notes
- If `OpenProcess` fails, run the console as Administrator.
- This tool is **read-only** and does not inject or write to the game process.
