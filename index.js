/*
* twitch-streamlink-extractor
* An npm library for extract m3u8 files from Twitch livestreams/VODs
*
* Coded by PANCHO7532 - P7COMunications LLC
* This project comes with a LICENSE file that you must read before doing stuff, please check it out!
*/
const syncRequest = require('sync-request');
const m3u8fileparser = require('m3u8-file-parser');
const m3u8reader = new m3u8fileparser();
module.exports.getToken = function(channel_name, client_id, oauth_token, useragent) {
    var response = {};
    if(!channel_name) {
        response["errorCode"] = "GT1";
        response["error"] = "No channel name specified!";
        return JSON.stringify(response);
    }
    if(!client_id) {
        response["errorCode"] = "GT2";
        response["error"] = "No client_id specified!";
        return JSON.stringify(response);
    }
    if(!useragent) {
        useragent = "Mozilla/5.0; (TwitchStreamlinkExtractor)";
    }
    if(!oauth_token) {
        oauth_token = "undefined";
    }
    if(isNaN(channel_name)) {
        var url = "https://api.twitch.tv/api/channels/" + channel_name + "/access_token?oauth_token=" + oauth_token + "&platform=web&player_type=site&player_backend=mediaplayer";
    } else {
        var url = "https://api.twitch.tv/api/vods/" + channel_name + "/access_token?oauth_token=" + oauth_token + "&platform=web&player_type=site&player_backend=mediaplayer";
    }
    var dataForReturn = syncRequest("GET", url, {headers: {"Client-ID":client_id, "User-Agent":useragent}});
    switch(dataForReturn["statusCode"]) {
        case 200:
            return JSON.parse(dataForReturn["body"].toString());
        case 400:
            response["errorCode"] = "GT3";
            response["error"] = "Malformed/Bad Request";
            return JSON.stringify(response);
        case 404:
            response["errorCode"] = "GT4";
            response["error"] = "Invalid Channel/VOD Inexistent";
            return JSON.stringify(response);
        case 410:
            response["errorCode"] = "GT5";
            response["error"] = "Your client-id isn't authorized by Twitch for perform this action.";
            return JSON.stringify(response);
        default:
            response["errorCode"] = "GT99";
            response["error"] = "The API returned an unknown error state.";
            return JSON.stringify(response);
    }
}
module.exports.getMaster = function(token, signature, channel_name, useragent) {
    var response = {};
    if(!token) {
        response["errorCode"] = "GM1";
        response["error"] = "No token specified!";
        return JSON.stringify(response);
    }
    if(!signature) {
        response["errorCode"] = "GM2";
        response["error"] = "No signature hash specified!";
        return JSON.stringify(response);
    }
    if(!channel_name) {
        response["errorCode"] = "GM3";
        response["error"] = "No channel name specified!";
        return JSON.stringify(response);
    }
    if(!useragent) {
        useragent = "Mozilla/5.0; (TwitchStreamlinkExtractor)";
    }
    if(isNaN(channel_name)) {
        var url = "https://usher.ttvnw.net/api/channel/hls/" + channel_name + ".m3u8?allow_source=true&fast_bread=true&p=" + Math.round(Math.random()*1000000) + "&player_backend=mediaplayer&playlist_include_framerate=true&reassignments_supported=true&sig=" + signature + "&supported_codecs=avc1&allow_audio_only=true&type=any&token=" + token + "&cdm=wv&player_version=1.1.1";
    } else {
        var url = "https://usher.ttvnw.net/vod/" + channel_name + ".m3u8?allow_source=true&fast_bread=true&p=" + Math.round(Math.random()*1000000) + "&player_backend=mediaplayer&playlist_include_framerate=true&reassignments_supported=true&sig=" + signature + "&supported_codecs=avc1&allow_audio_only=true&type=any&token=" + token + "&cdm=wv&player_version=1.1.1";
    }
    var dataForReturn = syncRequest("GET", url, {headers: {"User-Agent":useragent}});
    switch(dataForReturn["statusCode"]) {
        case 200:
            return dataForReturn["body"].toString();
        case 403:
            response["error"] = "GM4";
            response["errorCode"] = "Malformed token/Malformed request/Unauthorized";
            return JSON.stringify(response);
        case 404:
            response["error"] = "GM5";
            response["errorCode"] = "Invalid channel/VOD inexistent/Stream offline";
            return JSON.stringify(response);
        default:
            response["error"] = "GM99";
            response["errorCode"] = "The API returned an unknown error state.";
            return JSON.stringify(response);
    }
}
module.exports.extract = function(channel_name, client_id, oauth_token, useragent) {
    var response = [];
    var tokenSig = this.getToken(channel_name, client_id, useragent, oauth_token);
    try { tokenSig = JSON.parse(tokenSig) } catch(error) {}
    if(tokenSig["error"]) {
        return JSON.stringify(tokenSig);
    }
    var m3u8Master = this.getMaster(tokenSig["token"], tokenSig["sig"], channel_name, useragent);
    try { m3u8Master = JSON.parse(m3u8Master) } catch(error) {}
    if(m3u8Master["error"]) {
        return JSON.stringify(m3u8Master);
    }
    m3u8reader.read(m3u8Master);
    m3u8Master = m3u8reader.getResult();
    for(c = 0; c < m3u8Master["segments"].length; c++) {
        var preData = {};
        if(m3u8Master["segments"][c]["streamInf"]["video"] == "chunked") {
            var chunked_array = Object.keys(m3u8Master["media"]["VIDEO"]["chunked"]);
            preData["quality"] = m3u8Master["media"]["VIDEO"]["chunked"][chunked_array[0]]["name"];
        } else {
            preData["quality"] = m3u8Master["segments"][c]["streamInf"]["video"];
        }
        preData["link"] = m3u8Master["segments"][c]["url"]
        response.push(preData);
    }
    return JSON.stringify(response);
}