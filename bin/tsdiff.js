const assert = require('assert');
const child_process = require('child_process');

async function getFirstPts(filepath) {
  const cmd = `ffprobe -loglevel quiet -show_entries frame=pkt_pts -of json ${filepath}`;
  const output = JSON.parse(child_process.execSync(cmd).toString());
  return output.frames[0].pkt_pts;
}

async function calculateDiff(firstFile, secondFile) {
  try {
    const firstFilePts = await getFirstPts(firstFile);
    const secondFilePts = await getFirstPts(secondFile);
    assert(firstFilePts > 0);
    assert(secondFilePts > 0);
    console.log(secondFilePts - firstFilePts);
  } catch (e) {
    console.error(e);
  }
}

calculateDiff(process.argv[2], process.argv[3]);
