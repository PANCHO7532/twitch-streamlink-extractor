const syncRequest = require('sync-request');
const fs = require('fs');
function twitchApiRequest(channel_name, client_id, useragent) {
    if(!channel_name) {
        return "No channel_name specified!";
    }
    if(!client_id) {
        return "No client_id specified!";
    }
    if(!useragent) {
        useragent = "Mozilla/5.0 (TwitchWrapper)";
    }
    var url = "https://api.twitch.tv/api/channels/" + channel_name + "/access_token?platform=web&player_type=site&player_backend=mediaplayer";
    var dataForReturn = syncRequest("GET", url, {headers: {"Client-ID":client_id, "User-Agent":useragent}});
    if(dataForReturn["statusCode"] != 200) {
        return "No-OK";
    } else {
        return JSON.parse(dataForReturn["body"].toString());
    }
}
function twitchUsherApi(token, signature, channel_name, useragent) {
    if(!token) {
        return "No token specified!"
    }
    if(!signature) {
        return "No signature specified!"
    }
    if(!channel_name) {
        return "No channel_name specified!";
    }
    if(!useragent) {
        useragent = "Mozilla/5.0 (TwitchWrapper)";
    }
    var url = "https://usher.ttvnw.net/api/channel/hls/" + channel_name + ".m3u8?allow_source=true&fast_bread=true&p=" + Math.round(Math.random()*1000000) + "&player_backend=mediaplayer&playlist_include_framerate=true&reassignments_supported=true&sig=" + signature + "&supported_codecs=avc1&token=" + token + "&cdm=wv&player_version=1.1.1";
    var dataForReturn = syncRequest("GET", url, {headers: {"User-Agent":useragent}});
    if(dataForReturn["statusCode"] != 200) {
        return "No-OK-2";
    } else {
        return dataForReturn["body"].toString();
    }
}
module.exports.getData = function(channel_name, client_id, useragent) {
    var preData = twitchApiRequest(channel_name, client_id, useragent);
    return twitchUsherApi(preData["token"], preData["sig"], channel_name, useragent);
}
module.exports.apiStage1 = function(channel_name, client_id, useragent) {
    return twitchApiRequest(channel_name, client_id, useragent);
}
module.exports.apiStage2 = function(token, signature, channel_name, useragent) {
    return twitchUsherApi(token, signature, channel_name, useragent);
}