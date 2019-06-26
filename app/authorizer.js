'use strict';

var BCrypt = require('bcryptjs');
var JWT = require('jsonwebtoken');
var logger = require('./logger');
var SECRET = 'certificateValueLiteral';

/**
 * Verify Basic Credentials and return the generated JWT token
 **/
exports.basiclogin = async function(event) {
	//fetch Header 
	let auth = event.headers.Authorization;
	logger.info("auth es " + auth);

	//Process it
	var tmp = auth.split(' '); // Split on a space, the original auth looks like  "Basic Y2hhcmxlczoxMjM0NQ==" and we need the 2nd part
	var buf = new Buffer(tmp[1], 'base64'); // create a buffer and tell it the data coming in is base64
	var plain_auth = buf.toString();
	var creds = plain_auth.split(':');
	var username = creds[0];
	var password = creds[1];

	logger.info('Incoming user ' + username);

	//Encrypt result
	let salt = BCrypt.genSaltSync(10);
	var originalHash = BCrypt.hashSync(password, salt);



	let isequals = BCrypt.compareSync(password, originalHash);
	logger.info('son iguales =>  ' + isequals);



	//Create JWT
	var token = JWT.sign({
			username: username,
			claims: 'alto y ojos azules'
		},
		SECRET, {
			expiresIn: '1m' // expires in 24 hours
		}
	);

	console.log(token);
	//Test decode it
	//@ see https://yos.io/2017/09/03/serverless-authentication-with-jwt/
	try {
		const decoded = JWT.verify(token, SECRET);
		console.log(decoded); // 123
	} catch (err) {
		// Throws an error if the token is invalid.
		console.log(err);
	}


	return {
		statusCode: 200,
		body: JSON.stringify({
			token: 'Bearer '+token, 
			refreshToken: 'Bearer 12345'
		}),
		headers: {
			Authorization: 'Bearer '+token
		}
	}

}
/**
*Validate JWT Token
**/
exports.validateToken = async function(event) {
	//fetch Header 
	let auth = event.headers.Authorization;
	logger.info("auth es " + auth);

	//Process it
	if(auth.indexOf('Bearer')== -1){
		return {
			statusCode: 401,
			body: JSON.stringify({'msg':'Not found Bearer Token'}),
			
		}
	}
	var tmp = auth.split(' '); // Split on a space, the original auth looks like  "Basic Y2hhcmxlczoxMjM0NQ==" and we need the 2nd part
	
	var plain_auth = tmp[1];
	
	//Test decode it
	//@ see https://yos.io/2017/09/03/serverless-authentication-with-jwt/
	try {
		const decoded = JWT.verify(plain_auth, SECRET);
		console.log(decoded); 

		
	} catch (err) {
		// Throws an error if the token is invalid.
		console.log(err);
		return {
			statusCode: 401,
			body: JSON.stringify(err)
			
		}
	}

	const methodArn = event.methodArn
	logger.info(methodArn);
	return {
		statusCode: 200,
		body: JSON.stringify({'msg':'congrats your token is ok'}),
		
	}

}
