const twitchLib = require('./lib/twitchLib');
const m3u8fileparser = require('m3u8-file-parser');
const m3u8reader = new m3u8fileparser();
module.exports.extract = function(channel_name, client_id, useragent) {
    var m3u8data = twitchLib.getData(channel_name, client_id, useragent);
    var dataToReturn = {};
    if(m3u8data == "No-OK-2") {
        dataToReturn["error"] = "There was an error while retrieving data about this channel, it may be offline or you're not authorized to view it. Reason: " + m3u8data;
        return JSON.stringify(dataToReturn);
    }
    //if(m3u8data == "")
    m3u8reader.read(m3u8data);
    m3u8data = m3u8reader.getResult();
    for(c = 0; c < m3u8data["segments"].length; c++) {
        dataToReturn[m3u8data["segments"][c]["streamInf"]["video"]] = m3u8data["segments"][c]["url"];
    }
    return JSON.stringify(dataToReturn);
}