'use strict';

var logger = require('./logger');
var Response = require('./response');
var BasicMedia = require('./basicMedia');
let ObjectPath = require('object-path');
const fileType = require('file-type');
const AWS = require('aws-sdk');
const s3 = new AWS.S3();
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
    var params = {
        "Bucket": bucketImages,
        "Key": event.queryStringParameters.key
    };
    s3.getObject(params, function(err, data) {
        console.log('los datos retornados son ');
        console.log(data);
        console.log('y el body to string es ');
        var res = data.Body.toString('base64');
        console.log(res);

        let fileMime = fileType(data.Body);
        console.log('y el filetype es '+fileMime.ext);

        if (err) {
            callback(err, null);
        } else {
            let response = {
                "statusCode": 200,
                "headers": {
                    "Content-type" : 'application/json',
                    "Access-Control-Allow-Origin": "*"
                },
                "body": JSON.stringify({
                    dataType:"data:image/"+fileMime.ext+";base64",
                    //dataType:"data:image/png;base64",
                    data:res
                })
                ,
                "isBase64Encoded": false
            };
            console.log('ye l response final final es ');
            console.log(response);
            callback(null, response);
        }
    });

};


