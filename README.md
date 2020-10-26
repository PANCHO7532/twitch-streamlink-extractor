# twitch-streamlink-extractor
Extract m3u8 from livestreams/VODs/Clips on Twitch

## This repo is under code-refactoring
This is unstable code for testing, nothing stable yet, VODs and Clips aren't very well supported but hopefully in a few weeks would it be.

Visit the official npm page here: [NPM Page](https://www.npmjs.com/package/twitch-streamlink-extractor)

# Installing
```bash
npm install twitch-streamlink-extractor --save
```

(or just download a zip from [here](https://github.com/PANCHO7532/twitch-streamlink-extractor) and append it to your Node.JS project)

# Usage Examples
```js
// Example of getting an m3u8's from an actual livestream.
const twitchStream = require('twitch-streamlink-extractor');
var returnedData = twitchStream.extract("awesome_channel_name", "client_id_d389jd801dA8", "Mozilla/4.0; (UserAgent/1.0)");
console.log(returnedData)
```

Returned data should look like this:
```json
{"chunked":"https://video-weaver.ymq01.hls.ttvnw.net/v1/playlist/CpYEkMPgJASlM_Ak6jMD9PJPF...uSmtvsU.m3u8","720p60":"https://video-weaver.ymq01.hls.ttvnw.net/v1/playlist/CpQEuBTcKXwXFJMC...7zUMMhkdB.m3u8","480p30":"https://video-weaver.ymq01.hls.ttvnw.net/v1/playlist/CpQE-WPENTs5I...I9Lbdn_BoMV0mZpoori1tqd-3N.m3u8","360p30":"https://video-weaver.ymq01.hls.ttvnw.net/v1/playlist/CpQE5okrKoEQucHR6tHB...P8Yx.m3u8","160p30":"https://video-weaver.ymq01.hls.ttvnw.net/v1/playlist/CpQEROIscKLosoNi9wn...OAp8.m3u8"}
```

There are other functions in the library but i want to explain them when i finish the code refactoring of this project.
