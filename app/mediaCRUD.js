'use strict';

var logger = require('./logger');
var Response = require('./response');
var BasicDAO = require('./basicMedia');
let ObjectPath = require('object-path');

const bucketImages = process.env.S3_bucket;


const basicMedia = new BasicMedia({bucketDestination: bucketImages});


exports.upload = (event, context, callback) => {
    context.callbackWaitsForEmptyEventLoop = false;

    let request = JSON.parse(event.body);
    let base64String;
    basicMedia.upload(request.data, function(err, data){
        var response;
        if(err){
            response = Response.createResponse(500, err);
        }else{
            response = Response.createResponse(200, data);
        }
        callback(null, response);
    });
};



exports.get = (event, context, callback) => {
    var response = Response.createResponse(200, {msg:'hola'});
    callback(null, response);
};


