/*
 * /=======================================================\
 * | twitch-streamlink-extractor                           |
 * | Copyright (c) P7COMunications LLC                     |
 * | Author(s): Francisco Medina [pancho7532@p7com.net]    |
 * | Date: 09/Jul/2024                                     |
 * |=======================================================|
 * |-> Purpose: Application                                |
 * \=======================================================/
 */
const fs = require('fs');
const webUtils = require("./webUtils.lib");
const m3u8fileparser = require('m3u8-file-parser');
const m3u8reader = new m3u8fileparser();
var gqlRequest = JSON.parse(fs.readFileSync(__dirname + "/gql_request.json").toString());
module.exports.getToken = async function(channel_name_or_vod_id = "", client_id = "", device_id = "", oauth_token = "", useragent = "") {
    if(!channel_name_or_vod_id || channel_name_or_vod_id == "") { return { error: "No channel name or video/VOD ID specified" } }
    if(!client_id || channel_name_or_vod_id == "") { return { error: "No Client ID specified" } }
    if(!useragent || useragent == "") { useragent = "Mozilla 5.0; (TwitchStreamlinkExtractor/3.1.2)" }
    if(isNaN(channel_name_or_vod_id)) {
        // We requested a channel stream
        gqlRequest["variables"]["isLive"] = true;
        gqlRequest["variables"]["login"] = channel_name_or_vod_id;
    } else {
        // We requested a video/VOD file
        gqlRequest["variables"]["isVod"] = true;
        gqlRequest["variables"]["vodID"] = channel_name_or_vod_id;
    }
    var gqlHTTPSParameters = {
        method: "POST",
        host: "gql.twitch.tv",
        path: "/gql",
        headers: {
            "Client-ID": client_id,
            "User-Agent": useragent
        }
    };
    if(!!oauth_token || oauth_token != "") {
        // we have an OAuth token for this stream/vod so we add it to the headers
        gqlHTTPSParameters["headers"]["Authorization"] = "OAuth " + oauth_token;
    }
    if(!!device_id || device_id != "") {
        gqlHTTPSParameters["headers"]["Device-ID"] = device_id;
    }
    var gqlResponse = await webUtils.httpsRequest(gqlHTTPSParameters, JSON.stringify(gqlRequest));
    if(gqlResponse.status != 200) {
        // if by *some* reason don't get a body response, we just return the status code
        // this is also the same for the getMaster() function.
        return { error: gqlResponse.body.toString() == "" ? gqlResponse.status : gqlResponse.body }
    }
    return { response: gqlResponse.body.toString() };
}
module.exports.getMaster = async function(token = "", signature = "", channel_name_or_vod_id = "", useragent = "") {
    if(!token || token == "") { return { error: "No token has been provided" } }
    if(!signature || signature == "") { return { error: "No signature hash provided " } }
    if(!channel_name_or_vod_id || channel_name_or_vod_id == "") { return { error: "No channel name or video/VOD ID specified" } }
    if(!useragent || useragent == "") { useragent = "Mozilla 5.0; (TwitchStreamlinkExtractor/3.1.2)" }
    if(isNaN(channel_name_or_vod_id)) {
        var masterPath = "/api/channel/hls/" + channel_name_or_vod_id + ".m3u8?allow_source=true&fast_bread=true&p=" + Math.round(Math.random()*1000000) + "&player_backend=mediaplayer&playlist_include_framerate=true&reassignments_supported=true&sig=" + signature + "&supported_codecs=avc1,h264&allow_audio_only=true&type=any&token=" + token + "&cdm=wv&player_version=1.1.1";
    } else {
        var masterPath = "/vod/" + channel_name_or_vod_id + ".m3u8?allow_source=true&fast_bread=true&p=" + Math.round(Math.random()*1000000) + "&player_backend=mediaplayer&playlist_include_framerate=true&reassignments_supported=true&sig=" + signature + "&supported_codecs=avc1,h264&allow_audio_only=true&type=any&token=" + token + "&cdm=wv&player_version=1.1.1";
    }
    var masterResponse = await webUtils.httpsRequest({
        method: "GET",
        host: "usher.ttvnw.net",
        path: masterPath,
        headers: {
            "User-Agent": useragent
        }
    });
    if(masterResponse.status != 200) {
        return { error: masterResponse.body.toString() == "" ? masterResponse.status : masterResponse.body.toString() }
    }
    return { response: masterResponse.body.toString() };
}
module.exports.extract = async function(channel_name = "", client_id = "", device_id = "", oauth_token = "", useragent = "") {
    var response = [];
    var tokenSig = await this.getToken(channel_name, client_id, device_id, oauth_token, useragent);
    if(!!tokenSig["error"] || !tokenSig["response"]) {
        return { error: "TOKEN - " + tokenSig["error"] };
    }
    tokenSig = JSON.parse(tokenSig.response);
    if(!!tokenSig["data"]["streamPlaybackAccessToken"]) {
        var m3u8Master = await this.getMaster(tokenSig["data"]["streamPlaybackAccessToken"]["value"], tokenSig["data"]["streamPlaybackAccessToken"]["signature"], channel_name, useragent);
    } else if(!!tokenSig["data"]["videoPlaybackAccessToken"]) {
        var m3u8Master = await this.getMaster(tokenSig["data"]["videoPlaybackAccessToken"]["value"], tokenSig["data"]["videoPlaybackAccessToken"]["signature"], channel_name, useragent);
    } else {
        return { error: "There was an error while retrieving token data, stream/vod might be invalid" }
    }
    if(!!m3u8Master["error"]) { return { error: "MASTER - " + m3u8Master["error"] } }
    m3u8reader.read(m3u8Master.response);
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