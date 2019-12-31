cmake_minimum_required (VERSION 3.5)
project (ptsknife)

set (CMAKE_CXX_FLAGS "--std=gnu++11 ${CMAKE_CXX_FLAGS}")
set (CMAKE_C_FLAGS "--std=gnu99 ${CMAKE_C_FLAGS}")

file (GLOB SOURCES "src/*.c" "src/*.cpp" "src/*.cc")
list (REMOVE_ITEM SOURCES "${CMAKE_CURRENT_SOURCE_DIR}/src/main.c")

message ("libpts using sources: ${SOURCES}")

find_package (PkgConfig)
pkg_check_modules (LIBAVCODEC REQUIRED libavcodec)
pkg_check_modules (LIBAVUTIL REQUIRED libavutil)
pkg_check_modules (LIBAVFORMAT REQUIRED libavformat)
pkg_check_modules (LIBAVFILTER REQUIRED libavfilter)
pkg_check_modules (LIBSWSCALE REQUIRED libswscale)
pkg_check_modules (LIBSWRESAMPLE REQUIRED libswresample)

# Repair broken -framework flags from pkg_check_modules
if(${CMAKE_SYSTEM_NAME} MATCHES "Darwin")
  function(repair_framework_flags BAD_FLAG)
    string(REPLACE "-framework;" "-framework " GOOD_FLAG "${BAD_FLAG}")
    set(REPAIRED_FLAG "${GOOD_FLAG}" PARENT_SCOPE)
  endfunction()
  # "-framework;Security;-framework;CoreFoundation" to
  # "-framework Security;-framework CoreFoundation"
  repair_framework_flags("${LIBAVCODEC_LDFLAGS}")
  set(LIBAVCODEC_LDFLAGS "${REPAIRED_FLAG}")
  repair_framework_flags("${LIBAVFORMAT_LDFLAGS}")
  set(LIBAVFORMAT_LDFLAGS "${REPAIRED_FLAG}")
  repair_framework_flags("${LIBAVFILTER_LDFLAGS}")
  set(LIBAVFILTER_LDFLAGS "${REPAIRED_FLAG}")
endif()

link_libraries (${LIBAVCODEC_LDFLAGS})
link_libraries (${LIBAVUTIL_LDFLAGS})
link_libraries (${LIBAVFORMAT_LDFLAGS})
link_libraries (${LIBAVFILTER_LDFLAGS})
link_libraries (${LIBSWSCALE_LDFLAGS})
link_libraries (${LIBSWRESAMPLE_LDFLAGS})

include_directories (
  ${LIBAVCODEC_INCLUDE_DIRS}
  ${LIBAVUTIL_INCLUDE_DIRS}
  ${LIBAVFORMAT_INCLUDE_DIRS}
  ${LIBAVFILTER_INCLUDE_DIRS}
  ${LIBSWSCALE_INCLUDE_DIRS}
  ${LIBSWRESAMPLE_INCLUDE_DIRS}
)

# This comes at the end of all the linking commands issued above.
# add_library (libpts ${SOURCES})
# link_libraries (libpts)
add_executable (ptsknife "src/main.c")

include_directories (
  ${PROJECT_SOURCE_DIR}/src
)
