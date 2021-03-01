/*
* twitch-streamlink-extractor
* An npm library for extract m3u8 files from Twitch livestreams/VODs
*
* Coded by PANCHO7532 - P7COMunications LLC
* This project comes with a LICENSE file that you must read before doing stuff, please check it out!
*/
const fs = require('fs');
const syncRequest = require('sync-request');
const m3u8fileparser = require('m3u8-file-parser');
const m3u8reader = new m3u8fileparser();
var gqlRequest = JSON.parse(fs.readFileSync(__dirname + "/gql_request.json").toString());
var dataForReturn;
var gqlString = "";
module.exports.getToken = function(channel_name, client_id, useragent, oauth_token) {
    var response = {};
    if(!channel_name) {
        response["errorCode"] = "GT1";
        response["error"] = "No channel name specified!";
        return response;
    }
    if(!client_id) {
        response["errorCode"] = "GT2";
        response["error"] = "No client_id specified!";
        return response;
    }
    if(!useragent) {
        useragent = "Mozilla/5.0; (TwitchStreamlinkExtractor)";
    }
    if(isNaN(channel_name)) {
        gqlRequest["variables"]["isLive"] = true;
        gqlRequest["variables"]["login"] = channel_name;
        gqlString = JSON.stringify(gqlRequest);
    } else {
        gqlRequest["variables"]["isVod"] = true;
        gqlRequest["variables"]["vodID"] = channel_name;
        gqlString = JSON.stringify(gqlRequest);
    }
    if(!oauth_token) {
        dataForReturn = syncRequest("POST", "https://gql.twitch.tv/gql", {
            headers: {
                "Client-ID":client_id, 
                "User-Agent":useragent
            },
            body: gqlString
        });
    } else {
        dataForReturn = syncRequest("POST", "https://gql.twitch.tv/gql", {
            headers: {
                "Client-ID":client_id, 
                "Authorization":"OAuth " + oauth_token, 
                "User-Agent":useragent
            },
            body: gqlString
        });
    }
    switch(dataForReturn["statusCode"]) {
        case 200:
            return JSON.parse(dataForReturn["body"].toString());
        case 400:
            response["errorCode"] = "GT98";
            response["error"] = JSON.parse(dataForReturn["body"])["message"];
            return response;
        case 401:
            response["errorCode"] = "GT5";
            response["error"] = "Your OAuth token is invalid.";
            return response;
        default:
            response["errorCode"] = "GT99";
            response["error"] = "The API returned an unknown error state.";
            return response;
    }
}
module.exports.getMaster = function(token, signature, channel_name, useragent) {
    var response = {};
    if(!token) {
        response["errorCode"] = "GM1";
        response["error"] = "No token specified!";
        return response;
    }
    if(!signature) {
        response["errorCode"] = "GM2";
        response["error"] = "No signature hash specified!";
        return response;
    }
    if(!channel_name) {
        response["errorCode"] = "GM3";
        response["error"] = "No channel name specified!";
        return response;
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
        case 400:
            response["errorCode"] = "GM6";
            response["error"] = "Invalid VOD number";
            return response;
        case 403:
            response["errorCode"] = "GM4";
            response["error"] = "Malformed token/Malformed request/Unauthorized";
            return response;
        case 404:
            response["errorCode"] = "GM5";
            response["error"] = "Invalid channel/VOD inexistent/Stream offline";
            return response;
        default:
            response["errorCode"] = "GM99";
            response["error"] = "The API returned an unknown error state.";
            return response;
    }
}
module.exports.extract = function(channel_name, client_id, useragent, oauth_token) {
    var response = [];
    var tokenSig = this.getToken(channel_name, client_id, useragent, oauth_token);
    var m3u8Master = {};
    if(tokenSig["error"]) {
        return tokenSig;
    }
    if(tokenSig["data"]["streamPlaybackAccessToken"]) {
        var m3u8Master = this.getMaster(tokenSig["data"]["streamPlaybackAccessToken"]["value"], tokenSig["data"]["streamPlaybackAccessToken"]["signature"], channel_name, useragent);
    } else if(tokenSig["data"]["videoPlaybackAccessToken"]) {
        var m3u8Master = this.getMaster(tokenSig["data"]["videoPlaybackAccessToken"]["value"], tokenSig["data"]["videoPlaybackAccessToken"]["signature"], channel_name, useragent);
    } else {
        m3u8Master["errorCode"] = "GT100";
        m3u8Master["error"] = "There was an error while parsing the main m3u8 data, stream/vod may be invalid";
    }
    if(m3u8Master["error"]) {
        return m3u8Master;
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
    return response;
}