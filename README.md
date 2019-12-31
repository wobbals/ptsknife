# ptsknife

ptsknife "slices" pts offsets into MPEG transport streams.

Keep it simple. Keep it stupid.

This is a barely modified version of the FFMpeg example, 'remuxing'. The
original MIT license copyright holder of that file is listed as Stefano
Sabatini.
Cheers, Stefano.

Additional features include:

* pts manipulation (duh)
* stdin / stdout support. this is achieved by coercing the output format
  instead of relying on avformat's filename guessing technique. as an example,
  ptsknife can be used in a longer chain of unnamed pipes:
  `cat trans/001.ts | ptsknife /dev/fd/0 /dev/fd/1 180000 > dest/001.ts`

## Building

Prerequisites: ffmpeg, make, cmake.

```
mkdir build
cd build
cmake ..
make
```

## Usage

```
ptsknife infile outfile offset
```

* `offset` is expressed in the same timebase of the source input file.
  this can be a positive or negative number. go crazy.

## Test Data Generation / Problem Statement

Using GStreamer, we have a stream of input segments that need to go through
a post processor:

```
gst-launch-1.0 videotestsrc num_buffers=300 ! \
  video/x-raw,format=I420,framerate=30/1,width=1280,height=720 ! \
  x264enc key-int-max=60 ! \
  mpegtsmux ! \
  multifilesink next-file=max-duration max-file-duration=2000000000 location=test/%.03d.ts
```

ffmpeg is able to preserve pts values with `-copyts`, or even manipulate
timestamps as part of a transcode pipeline with `-start_at_zero` and `-ss`.
If for some reason you found yourself working with re-zeroed segments, say
from an out-of-band transcoder, ptsknife can be a handy utility to restore
those timestamps to their original values:

```
# some 'other' transcoder without granluar pts control

gst-launch-1.0 filesrc location=test/001.ts ! \
  tsdemux ! \
  h264parse ! \
  avdec_h264 ! \
  x264enc ! \
  mpegtsmux ! \
  filesink location=trans/001.ts
```

Oops! Now we've got a non-linear sequence of segments; each transcoded segment
starts the presentation timestamp back at zero. Convince yourself of this
problem by inspecting the presentation timestamps of the transcode:

```
$ ffprobe -loglevel quiet -show_entries frame=pkt_pts -of csv test/001.ts
frame,324353999
frame,324356999
frame,324360000
frame,324362999
frame,324365999
frame,324369000
$ ffprobe -loglevel quiet -show_entries frame=pkt_pts -of csv trans/001.ts
frame,324168000
frame,324171000
frame,324174001
frame,324177000
frame,324180000
frame,324183001

```

`ptsknife` solves this problem by injecting fixed pts offsets into a new
container:

```
ptsknife trans/001.ts dest/001.ts 185999
```

Like magic, the timestamps are restored:

```
$ ffprobe -loglevel quiet -show_entries frame=pkt_pts -of csv dest/001.ts
frame,324353999
frame,324356999
frame,324360000
frame,324362999
frame,324365999
frame,324369000
```

