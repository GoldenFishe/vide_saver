const https = require('https');
const fs = require('fs');

const baseUrl = 'https://s10.fplay.online/content/stream/films/the.mandalorian.s02e01.720p.rus.lostfilm.tv_235107/hls/720';
const indexUrl = `${baseUrl}/index.m3u8`;

let segments = [];
getSegmentsFromIndex(indexUrl);

async function getSegmentsFromIndex(index_url) {
    let rawData = '';
    try {
        const request = await httpsPromise(index_url);
        request.setEncoding('utf8');
        request.on('data', chunk => {
            rawData += chunk;
            segments = [...segments, ...chunk.match(/segment(\d+)\.ts/gm)]
        })
        request.on('end', () => {
            getDataFromSegments(segments);
        })
    } catch (err) {
        console.error(err);
    }
}

async function getDataFromSegments(segments) {
    const writeStream = fs.createWriteStream('film.mov', {flags: 'as'})
    for (let i = 0; i < segments.length; i++) {
        const segmentUrl = `${baseUrl}/${segments[i]}`;
        try {
            const request = await httpsPromise(segmentUrl);
            console.log(segments[i]);
            request.on('data', chunk => {
                writeStream.write(chunk);
                console.log(`on data ${segments[i]}`);
            })
        } catch (err) {
            console.log(err);
        }
    }
}

function httpsPromise(url) {
    return new Promise(((resolve, reject) => {
        https.get(url, resolve).on('error', reject);
    }))
}