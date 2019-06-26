'use strict';

var BCrypt = require('bcryptjs');
var JWT = require('jsonwebtoken');
var ObjectPath = require('object-path');
var logger = require('./logger');
var SECRET = 'certificateValueLiteral';


let doc = require('dynamodb-doc');
let dynamo = new doc.DynamoDB();

/**
* Constants
**/
const entityTable = process.env.TABLE_NAME;
const entityIdField = process.env.ENTITY_ID_FIELD;


/** RETURN A USER **/
exports.get = (event, context, callback) => {
    get(event.pathParameters.resourceId, function(err, data){
        var response;
        if(err){
            response = createResponse(500, err);
        }else if(data.Item === undefined){
            response = createResponse(404, null);
        }else{
            response = createResponse(200, data.Item ? data.Item.doc : null);
        }
        callback(null, response);
    });
};



/** CREATE A USER **/
exports.create = (event, context, callback) => {
    var entityData = JSON.parse(event.body);

    //Fetch the Id key for the Create Object (from globals)
    var objectToCreateId = ObjectPath.get(entityData,entityIdField);


    get(objectToCreateId, function(err, data) {
        var response;
        if(err){
            response = createResponse(500, err);
            callback(null, response);
        }else if(data.Item !== undefined){
            response = createResponse(403, "The entity key already exists. Try PUT instead of POST");
            callback(null, response);
        }else{
            //The object not exist, so execute update
            put(objectToCreateId, entityData, function(err, createdData){
                if(err){
                    response = createResponse(500, err);
                }else{
                    response = createResponse(200, entityData);
                } 
                callback(null, response);
            });
                
        }
    });
}

/** UPDATE A USER **/
exports.update = (event, context, callback)=>  {
	//fetch Header 
    var objectToUpdateId = event.pathParameters.resourceId;
	
    var entityData = JSON.parse(event.body);
	get(objectToUpdateId, function(err, data) {
        var response;
        if(err){
            response = createResponse(500, err);
            callback(null, response);
        }else if(data.Item === undefined){
            response = createResponse(404, "The target object does not exists");
            callback(null, response);
        }else{
            Object.assign(data.Item.doc,entityData);//Merge data
            put(objectToUpdateId, data.Item.doc, function(err, updatedData){
                if(err){
                    response = createResponse(500, err);
                }else{
                    response = createResponse(200, data.Item.doc);
                } 
                callback(null, response);
            });
    
        }
	});
}

/** DELETE A USER **/
exports.delete = (event, context, callback)=>  {
    //fetch Header 
    console.log('y el resource es ' +event.pathParameters.resourceId);
    var objectToDeleteId = event.pathParameters.resourceId;
    remove(objectToDeleteId, function(err,data){
        var response;
        if(err){
            response = createResponse(500, err);
            callback(null, response);
        }else {
            response = createResponse(204, null);
            callback(null, response);
        }
    });
}





/**
* Fetch the entity from DataBase. 
* return empty object if {} if not found
**/
function get(key, callback){
    var params = {
        "TableName": entityTable,
        "Key": {
            id: key
        }
    };

    dynamo.getItem(params, (err, data) => {
        callback(err, data);
    });
}


//INTERNAL FUNCTIONS /////////////////
function put(key , content, callback){
	var item = {
        "id": key,
        "doc": content
    };

    var params = {
        "TableName": entityTable,
        "Item": item
    };

    console.log('voy a hacer put con ');
    console.log( params);

    dynamo.putItem(params, (err, data) => {
        callback(err, params);//data is {}, so this method return the input body that will be stored on bbdd
    });
}

function remove(key, callback){
    var item = {
        "id": key
    };

    var params = {
        "TableName": entityTable,
        "Key": item
    };
    dynamo.deleteItem(params,(err, data)=>{
        callback(err,params);
    })
}



//UTILS ///////////
const createResponse = (statusCode, body) => {
    return {
        "statusCode": statusCode,
        "body": body ? JSON.stringify(body) : ""
    }
};