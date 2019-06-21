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
exports.get = (event, context, callback) => {
    console.log('tablename es ');
    console.log(usersTable);
    var params = {
        "TableName": usersTable,
        "Key": {
            id: event.pathParameters.resourceId
        }
    };

    dynamo.getItem(params, (err, data) => {
        var response;
        if (err){
            console.log('ha idgo mal ');
            console.log(err);
            response = createResponse(500, err);
        }
        else{
        	console.log('ha idgo bien');
        	console.log(JSON.stringify(data.Item));
            response = createResponse(200, data.Item ? data.Item.doc : null);
        }
        callback(null, {body:JSON.stringify(data.Item.doc)});
    });
};

/** CREATE A USER **/
exports.create = (event, context, callback) => {

	console.log('y la tabla es ' +JSON.stringify(usersTable)); 

	//fetch Header 
	console.log(event.body);
	let userData = JSON.parse(event.body);
	logger.info('Created User ' + userData);
	logger.info('1 '+ userData.document.value);
	
	put(userData.document.value, userData, callback);
	

}
/** UPDATE A USER **/
exports.update = (event, context, callback)=>  {
	//fetch Header 
	console.log('y el resource es ' +event.pathParameters.resourceId);


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


function get(key, callback){
	var params = {
        "TableName": usersTable,
        "Key": {
            id: key
        }
    };
    console.log('y llamo al get con ');
    console.log(params);
    dynamo.getItem(params, (err, data) => {
        var response;
        if (err){
        	console.log('ha ido mal ');
        	console.log(err);
            response = createResponse(500, err);
        }else{
        	console.log('jha ido bien');
        	console.log (JSON.stringify(data.Item));
            response = createResponse(200, data.Item ? data.Item.doc : null);
        }
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