/*
 * /=======================================================\
 * | webUtils                                              |
 * | Author(s): Francisco Medina [pancho7532@p7com.net]    |
 * | Date: 13/Apr/2022                                     |
 * |==============================================================\
 * |-> Purpose: HTTP(S) module wrapper with promises              |
 * \==============================================================/
 * Portions of this code are extracted from StackOverflow: https://stackoverflow.com/a/38543075
 * Now it should be easier to handle, "modern", with a few extra features, and hopefully won't crumble into pieces
 */
const http = require("http");
const https = require("https");
const zlib = require("zlib");
async function httpRequest(params, postData) {
    return new Promise(function(resolve, reject) {
        let req = http.request(params, function(res) {
            let body = [];
            switch(res.headers["content-encoding"]) {
                /*
                 * The following code is the product of many tears trying to over engineer all of the compression cases for hours at 4AM.
                 * It "should" work on all servers considering that the server actually follows MDN specifications
                 * Basically we check when the decompression ends to send the final object, and, progressively push decompressed chunks.
                 */
                case "gzip":
                    gunzipInstance.on("data", function(chunk) {
                        body.push(chunk);
                    });
                    gunzipInstance.on("end", function() {
                        resolve({ status: res.statusCode, headers: res.headers, body: Buffer.concat(body) });
                    });
                    res.pipe(gunzipInstance);
                    break;
                case "deflate":
                    deflateInstance.on("data", function(chunk) {
                        body.push(chunk);
                    });
                    deflateInstance.on("end", function() {
                        resolve({ status: res.statusCode, headers: res.headers, body: Buffer.concat(body) });
                    });
                    res.pipe(deflateInstance);
                    break;
                case "br":
                    // this is the brotli compression algorithm
                    brotliInstance.on("data", function(chunk) {
                        body.push(chunk);
                    });
                    brotliInstance.on("end", function() {
                        resolve({ status: res.statusCode, headers: res.headers, body: Buffer.concat(body) });
                    });
                    res.pipe(brotliInstance);
                    break;
                default:
                    // no compression? we store it as is.
                    res.on('data', function(chunk) {
                        body.push(chunk);
                    });
                    res.on('end', function() {
                        resolve({ status: res.statusCode, headers: res.headers, body: Buffer.concat(body) });
                    });
                    break;
            }
            
        });
        req.on('error', function(err) { reject(err); });
        if(postData) { req.write(postData); }
        req.end();
    });
}
async function httpsRequest(params, postData) {
    const gunzipInstance = zlib.createGunzip();
    const deflateInstance = zlib.createInflate();
    const brotliInstance = zlib.createBrotliDecompress();
    return new Promise(function(resolve, reject) {
        let req = https.request(params, function(res) {
            let body = [];
            switch(res.headers["content-encoding"]) {
                /*
                 * The following code is the product of many tears trying to over engineer all of the compression cases for hours at 4AM.
                 * It "should" work on all servers considering that the server actually follows MDN specifications
                 * Basically we check when the decompression ends to send the final object, and, progressively push decompressed chunks.
                 */
                case "gzip":
                    gunzipInstance.on("data", function(chunk) {
                        body.push(chunk);
                    });
                    gunzipInstance.on("end", function() {
                        resolve({ status: res.statusCode, headers: res.headers, body: Buffer.concat(body) });
                    });
                    res.pipe(gunzipInstance);
                    break;
                case "deflate":
                    deflateInstance.on("data", function(chunk) {
                        body.push(chunk);
                    });
                    deflateInstance.on("end", function() {
                        resolve({ status: res.statusCode, headers: res.headers, body: Buffer.concat(body) });
                    });
                    res.pipe(deflateInstance);
                    break;
                case "br":
                    // this is the brotli compression algorithm
                    brotliInstance.on("data", function(chunk) {
                        body.push(chunk);
                    });
                    brotliInstance.on("end", function() {
                        resolve({ status: res.statusCode, headers: res.headers, body: Buffer.concat(body) });
                    });
                    res.pipe(brotliInstance);
                    break;
                default:
                    // no compression? we store it as is.
                    res.on('data', function(chunk) {
                        body.push(chunk);
                    });
                    res.on('end', function() {
                        resolve({ status: res.statusCode, headers: res.headers, body: Buffer.concat(body) });
                    });
                    break;
            }
            
        });
        req.on('error', function(err) { reject(err); });
        if(postData) { req.write(postData); }
        req.end();
    });
}
module.exports = { httpRequest, httpsRequest };