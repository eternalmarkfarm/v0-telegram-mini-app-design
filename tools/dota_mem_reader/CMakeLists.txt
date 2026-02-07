cmake_minimum_required(VERSION 3.20)
project(dota_mem_reader LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

add_executable(dota_mem_reader
    src/main.cpp
)

target_compile_definitions(dota_mem_reader PRIVATE UNICODE _UNICODE)

if(MSVC)
    target_compile_options(dota_mem_reader PRIVATE /W4 /permissive-)
else()
    target_compile_options(dota_mem_reader PRIVATE -Wall -Wextra -Wpedantic)
endif()

# Link common Windows libs if needed
if(WIN32)
    target_link_libraries(dota_mem_reader PRIVATE psapi)
endif()
