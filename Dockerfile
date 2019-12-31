FROM ubuntu:bionic

ENV DEBIAN_FRONTEND noninteractive

WORKDIR /usr/src/app

RUN apt-get update && apt-get install -y \
  build-essential pkg-config cmake libavfilter-dev libavdevice-dev \
  libavcodec-dev libavresample-dev libavutil-dev libswresample-dev \
  libswscale-dev

COPY src /usr/src/app/src
COPY CMakeLists.txt /usr/src/app

RUN mkdir build && cd build && cmake .. && make

FROM ubuntu:bionic
COPY --from=0 /usr/src/app/build/ptsknife /usr/local/bin
