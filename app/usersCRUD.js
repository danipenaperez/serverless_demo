'use strict';

var logger = require('./logger');
var BasicDAO = require('./basicDAO');
let ObjectPath = require('object-path');




/**
* Constants
**/
const entityTable = process.env.TABLE_NAME;
const entityIdField = process.env.ENTITY_ID_FIELD;



const basicDAO = new BasicDAO({TableName: entityTable});

/** RETURN A USER **/
exports.get = (event, context, callback) => {
    basicDAO.get(event.pathParameters.resourceId, function(err, data){
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
    console.log('el basicDAO es ');
    console.log(basicDAO);
    var entityData = JSON.parse(event.body);

    //Fetch the Id key for the Create Object (from globals)
    var objectToCreateId = ObjectPath.get(entityData,entityIdField);


    basicDAO.get(objectToCreateId, function(err, data) {
        var response;
        if(err){
            response = createResponse(500, err);
            callback(null, response);
        }else if(data.Item !== undefined){
            response = createResponse(403, "The entity key already exists. Try PUT instead of POST");
            callback(null, response);
        }else{
            //The object not exist, so execute update
            basicDAO.put(objectToCreateId, entityData, function(err, createdData){
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
	basicDAO.get(objectToUpdateId, function(err, data) {
        var response;
        if(err){
            response = createResponse(500, err);
            callback(null, response);
        }else if(data.Item === undefined){
            response = createResponse(404, "The target object does not exists");
            callback(null, response);
        }else{
            Object.assign(data.Item.doc,entityData);//Merge data
            basicDAO.put(objectToUpdateId, data.Item.doc, function(err, updatedData){
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
    basicDAO.remove(objectToDeleteId, function(err,data){
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







//UTILS ///////////
const createResponse = (statusCode, body) => {
    return {
        "statusCode": statusCode,
        "body": body ? JSON.stringify(body) : ""
    }
};