const axios = require('axios');
const fs = require('fs');

const baseUrl = 'https://s19.fplay.online/content/stream/films/young.sheldon.s04e01.hd720p.webrip.rus.baibako.tv_235890/hls/720/';

start(baseUrl);

function start(baseUrl) {
    const indexUrl = `${baseUrl}/index.m3u8`;
    getIndex(indexUrl);
}

async function getIndex(indexUrl) {
    try {
        const {data} = await axios.get(indexUrl);
        const segments = data.match(/segment\d+\.ts/gm);
        getSegments(segments);
    } catch (err) {
        console.error(err);
    }
}

async function getSegments(segments) {
    let progress = 0;
    let percent = 100 / segments.length;

    for (let segment of segments) {
        await getSegment(segment);
        progress += percent;
        console.log(`Progress: ${progress.toFixed(1)}%`);
    }
}

async function getSegment(segment) {
    console.log(segment);
    const url = `${baseUrl}/${segment}`;
    try {
        const response = await axios.get(url, {responseType: "stream"});
        const stream = response.data.pipe(fs.createWriteStream('video.mp4', {flags: 'a'}));
        return new Promise((resolve, reject) => {
            stream.on("finish", resolve);
            stream.on("error", reject);
        });
    } catch (err) {
        console.error(err);
    }
}