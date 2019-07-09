'use strict';

const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const fileType = require('file-type');



/**
 * Constructor
 **/
function BasicMedia(args) {
    this.bucketDestination = (args && args.bucketDestination) ? args.bucketDestination : null
}

BasicMedia.prototype.upload = function(data, callback) {
    // allows for using callbacks as finish/error-handlers
    //context.callbackWaitsForEmptyEventLoop = false;
    console.log('ejecutando upload');
    console.log('el buket es ' + this.bucketDestination);
    

    try {
        //let request = JSON.parse(event.body);
        console.log('el body es ');
        console.log(data);

        let base64String;
        if (data.indexOf(',') > -1) {
            base64String = data.split(',')[1];
        } else {
            base64String = data;
        }

        let buffer = new Buffer(base64String, 'base64');
        let fileMime = fileType(buffer);

        if (fileMime === null) {
            return context.fail("The string suppplied is not a file type");
        }

        let file = getFile(this.bucketDestination, fileMime, buffer);
        var params = file.params;


        console.log('y al final he terminado ');
        console.log(file);

        console.log('los params para el put son ');
        console.log(params);
        console.log(params.Key);



        s3.putObject(params, function(err, data) {
            if (err) {
                return console.log(err);
            }
            callback(null,{
                    key: params.Key,
                    ETag: data.ETag
                } )
        });

    } catch (err) {
        console.log(err);
    }


};



let getFile = function(bucketDestination, fileMime, buffer) {
    let fileExt = fileMime.ext;

    // let hash = sha1(new Buffer(new Date().toString()));
    // let now = moment().format('YYY - MM - DD HH: mm: ss');

    let hash = 'user_images';


    let filePath = hash + "/";
    let fileName = 'fileName' + '.' + fileExt;
    let fileFullName = filePath + fileName;
    let fileFullPath = fileFullName;

    let params = {
        Bucket: bucketDestination,
        Key: fileFullName,
        Body: buffer
    };

    let uploadFile = {
        size: buffer.toString('ascii').length,
        type: fileMime.mime,
        name: fileName,
        full_path: fileFullPath
    };


    console.log('vamos a grabar en ' + fileFullPath);
    return {
        params: params,
        uploadFile: uploadFile
    };
}



module.exports = BasicMedia;