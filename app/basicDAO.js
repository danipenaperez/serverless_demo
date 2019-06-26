'use strict';

let doc = require('dynamodb-doc');
let dynamo = new doc.DynamoDB();

/**
* Constructor
**/
function BasicDAO(args) {
    this.entityTable = (args && args.TableName)? args.TableName:null 
}

BasicDAO.prototype.get = function(key, callback) {
    console.log('entityTable es ' + this.entityTable);
    var params = {
        "TableName": this.entityTable,
        "Key": {
            id: key
        }
    };

    dynamo.getItem(params, (err, data) => {
        callback(err, data);
    });
};



BasicDAO.prototype.put = function(key, content, callback) {
    console.log('entityTable es ' + this.entityTable);
    var item = {
        "id": key,
        "doc": content
    };

    var params = {
        "TableName": this.entityTable,
        "Item": item
    };

    console.log('voy a hacer put con ');
    console.log(params);

    dynamo.putItem(params, (err, data) => {
        callback(err, params); //data is {}, so this method return the input body that will be stored on bbdd
    });
};

BasicDAO.prototype.remove = function (key, callback) {
    var item = {
        "id": key
    };

    var params = {
        "TableName": this.entityTable,
        "Key": item
    };
    dynamo.deleteItem(params, (err, data) => {
        callback(err, params);
    })
};


module.exports = BasicDAO;