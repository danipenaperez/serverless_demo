'use strict';

var BCrypt = require('bcryptjs');
var JWT = require('jsonwebtoken');
var logger = require('./logger');
var SECRET = 'certificateValueLiteral';


let doc = require('dynamodb-doc');
let dynamo = new doc.DynamoDB();

/**
* Constants
**/
const usersTable = process.env.TABLE_NAME;


/** RETURN A USER **/
exports.get = async function(event, context, callback) {


	//SAVE IT
	//get(event.pathParameters.resourceId, callback);

/**
	return {
			statusCode: 201,
			body: JSON.stringify({userData})
	}
**/


	return {
			statusCode: 201,
			body: JSON.stringify(event)
	}
}

/** CREATE A USER **/
exports.create = async function(event, context, callback) {

	console.log('y la tabla es ' +JSON.stringify(usersTable)); 

	//fetch Header 
	console.log(event.body);
	let userData = JSON.parse(event.body);
	logger.info('Created User ' + userData);
	logger.info('1 '+ userData.document.value);
	//SAVE IT
	put(userData.document.value, userData);

	/**
	return {
			statusCode: 201,
			body: JSON.stringify({userData}),
		
	}
	**/

}
/** UPDATE A USER **/
exports.update = async function(event, context, callback) {
	//fetch Header 

	let body = event.body;
	logger.info('Updating User ' + body);
	return {
			statusCode: 200,
			body: JSON.stringify({body}),
		
	}
}


function put(key , content, callback){
	var item = {
        "id": key,
        "doc": content
    };

    var params = {
        "TableName": usersTable,
        "Item": item
    };

    console.log('voy a hacer put con ');
    console.log( params);

    dynamo.putItem(params, (err, data) => {
        var response;
        if (err){
        	console.log('ha habido error ');
        	console.log(err);
            response = createResponse(500, err);
        }else{
        	console.log('ha IDO BIEN ');
            response = createResponse(200, null);
        }
        callback(null, response);
    });
}


function get(key, callbak){
	var params = {
        "TableName": usersTable,
        "Key": {
            id: key
        }
    };

    dynamo.getItem(params, (err, data) => {
        var response;
        if (err)
            response = createResponse(500, err);
        else
            response = createResponse(200, data.Item ? data.Item.doc : null);
        callback(null, response);
    });

}

//UTILS ///////////
const createResponse = (statusCode, body) => {
    return {
        "statusCode": statusCode,
        "body": body || ""
    }
};