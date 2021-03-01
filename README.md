# twitch-streamlink-extractor
Extract m3u8 from livestreams/VODs on Twitch

Visit the official npm page here: [NPM Page](https://www.npmjs.com/package/twitch-streamlink-extractor)

### (project not related to the streamlink project)

# Installing
```bash
npm install twitch-streamlink-extractor --save
```

(or just download a zip from [here](https://github.com/PANCHO7532/twitch-streamlink-extractor/archive/master.zip) and append it manually to your Node.JS project)

# Functions/API/Usage
### .extract(channel_name, client_id, useragent, oauth_token)
Description: Retrieve and parse the master m3u8 file obtained from the Usher API on Twitch.

* channel_name - [string or number]

The channel or VOD number that you want to extract.
* client_id - [string]

Twitch client id that you will use for the request.
* oauth_token - [string - optional]

OAuth token of an real Twitch account, if not provided, it will be set to "undefined"
This can be used for retrieve restricted streams that normally with an public/no-account can't be watched.
* useragent - [string - optional]

HTTP User Agent for the API requests, if not provided, it will use an default one.

### .getToken(channel_name, client_id, useragent, oauth_token)
Description: Retrieve the authorization token for the Usher API and a valid signature

* channel_name - [string or number]

The channel or VOD number that you want to extract.
* client_id - [string]

Twitch client id that you will use for the request.
* oauth_token - [string - optional]

OAuth token of an real Twitch account, if not provided, it will be set to "undefined"
This can be used for retrieve restricted streams that normally with an public/no-account can't be watched.
* useragent - [string - optional]

HTTP User Agent for the API requests, if not provided, it will use an default one.

### .getMaster(token, signature, channel_name, useragent)
Description: Retrieve the master m3u8 file from the Usher API on Twitch

* token - [json string]

The JSON token string retrieved from Twitch API
* signature - [string]

Hashed signature string retrieved from Twitch API
* channel_name - [string or number]

The channel or VOD number that you want to extract.
* useragent - [string - optional]

HTTP User Agent for the API requests, if not provided, it will use an default one.

# Usage Examples
```js
// Example of getting an m3u8's from an actual livestream using the example values.
const twitchStream = require('twitch-streamlink-extractor');
var returnedData = twitchStream.extract("awesome_channel_name", "jknof83ly4odx7cthm5nv7xji6h2ek", "Mozilla/4.0; (UserAgent/1.0", "fv34m44bdnvo1jkegobiuo9bx84");
console.log(returnedData)
```

Returned data for the requested livestream should look like this:
```json
[{"quality":"1080p","link":"https://video-weaver.jfk04.hls.ttvnw.net/v1/playlist/CqAENULH9QMi75PRzZb-VqJFT...z89g.m3u8"},{"quality":"720p60","link":"https://video-weaver.jfk04.hls.ttvnw.net/v1/playlist/Cp4EKo_punwHjm9MQcXm...wg.m3u8"},{"quality":"720p30","link":"https://video-weaver.jfk04.hls.ttvnw.net/v1/playlist/Cp4EakBjgnDikohPqD501YcaW0sQe8SiuULC0...GxA.m3u8"},{"quality":"480p30","link":"https://video-weaver.jfk04.hls.ttvnw.net/v1/playlist/Cp4ELeLn9jqhb1jgrUoa7xFfqQl...VKZ2tAZ1w.m3u8"},{"quality":"360p30","link":"https://video-weaver.jfk04.hls.ttvnw.net/v1/playlist/Cp4E_ldXeK0EeE0woAtn7...PlpNdWiQ.m3u8"},{"quality":"160p30","link":"https://video-weaver.jfk04.hls.ttvnw.net/v1/playlist/Cp4ELp4A-lcwFSCa0m...SPPyuA.m3u8"},{"quality":"audio_only","link":"https://video-weaver.jfk04.hls.ttvnw.net/v1/playlist/CroEgFSchiJalTMO...7YqCs.m3u8"}]
```

```js
// Example of getting an m3u8's from an actual VOD using the example values.
const twitchStream = require('twitch-streamlink-extractor');
var returnedData = twitchStream.extract("vod_number_id", "jknof83ly4odx7cthm5nv7xji6h2ek", "Mozilla/4.0; (UserAgent/1.0)", "fv34m44bdnvo1jkegobiuo9bx84");
console.log(returnedData)
```

Returned data for the requested VOD should look like this:
```json
[{"quality":"1080p","link":"https://d2nvs31859zcd8.cloudfront.net/c2c985c.../chunked/index-dvr.m3u8"},{"quality":"720p60","link":"https://d2nvs31859zcd8.cloudfront.net/c2c985c.../720p60/index-dvr.m3u8"},{"quality":"720p30","link":"https://d2nvs31859zcd8.cloudfront.net/c2c985c.../720p30/index-dvr.m3u8"},{"quality":"480p30","link":"https://d2nvs31859zcd8.cloudfront.net/c2c985c.../480p30/index-dvr.m3u8"},{"quality":"360p30","link":"https://d2nvs31859zcd8.cloudfront.net/c2c985c.../360p30/index-dvr.m3u8"},{"quality":"160p30","link":"https://d2nvs31859zcd8.cloudfront.net/c2c985c.../160p30/index-dvr.m3u8"},{"quality":"audio_only","link":"https://d2nvs31859zcd8.cloudfront.net/c2c985c.../audio-only/index-dvr.m3u8"}]
```

# How to obtain an Client-ID
There are many ways on obtaining it, the main one is by opening the developer tools on a twitch stream and capturing it from the headers of gql.twitch.tv requests, also you can try on registering an app on [https://dev.twitch.tv](https://dev.twitch.tv)

An example of a valid client ID for Twitch is: `jknof83ly4odx7cthm5nv7xji6h2ek`

# How to obtain my OAuth token
As you may have guessed, you can obtain it too by opening developer tools on a twitch stream and capturing it from the Authorization header of gql.twitch.tv requests, it should look like "Authorization: OAuth fv34m44bdnvo1jkegobiuo9bx84" where "fv34m44bdnvo1jkegobiuo9bx84" is the token you should use on OAuth parameters of this script.

An example of an OAuth token is: `fv34m44bdnvo1jkegobiuo9bx84`

# Future of this project - Long term releases - Disclaimer
This project may or may not be patched by me if Twitch makes changes on how it retrieves the stream/VOD information, however feel free to make a pull request with updates/bugfixes.

No copyright intended, you use this tool as you want, i'm not responsible of anything.