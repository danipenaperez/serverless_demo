'use strict';


exports.createResponse = function(statusCode, body){
    return {
        "statusCode": statusCode,
        "body": body ? JSON.stringify(body) : "",
        "headers" : {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key, Accept, Access-Control-Allow-Origin"
        }
    }
}

