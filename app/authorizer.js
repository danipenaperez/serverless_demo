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
			claims: 'read:write Pets'
		},
		SECRET, {
			expiresIn: '2m' // expires in 24 hours
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
			token: 'Bearer ' + token,
			refreshToken: 'Bearer 12345'
		}),
		headers: {
			Authorization: 'Bearer ' + token
		}
	}

}
/**
 *Validate JWT Token
 **/
exports.validateToken = async function(event) {
	const auth_token = event.authorizationToken
	console.log("el authorization token por configuracion es " + auth_token);
	//fetch Header 
	let auth = auth_token;
	const methodArn = event.methodArn
	logger.info("auth es " + auth);
	logger.info("metodo invocado " + methodArn);

	//Process it
	if (auth.indexOf('Bearer') == -1) {
		return {
			statusCode: 401,
			body: JSON.stringify({
				'msg': 'Not found Bearer Token'
			}),

		}
	}
	var tmp = auth.split(' '); // Split on a space, the original auth looks like  "Basic Y2hhcmxlczoxMjM0NQ==" and we need the 2nd part

	var plain_auth = tmp[1];


	var response;

	try {
		const decoded = JWT.verify(plain_auth, SECRET);
		console.log(decoded);
		response = generateAuthResponse('user', 'Allow', methodArn);

	} catch (err) {
		// Throws an error if the token is invalid.
		console.log('error en token jwt' + err);
		response = generateAuthResponse('user', 'Deny', methodArn);

	}


	return response;

}



function generateAuthResponse(principalId, effect, methodArn) {
	// If you need to provide additional information to your integration
	// endpoint (e.g. your Lambda Function), you can add it to `context`
	const context = {
		'stringKey': 'stringval',
		'numberKey': 123,
		'booleanKey': true
	}
	const policyDocument = generatePolicyDocument(effect, methodArn)

	return {
		principalId,
		context,
		policyDocument
	}
}

function generatePolicyDocument(effect, methodArn) {
	if (!effect || !methodArn) return null

/**
	const policyDocument = {
		Version: '2012-10-17',
		Statement: [{
			Action: 'execute-api:Invoke',
			Effect: effect,
			Resource: methodArn
		}]
	}
**/
	const policyDocument = {
		Version: '2012-10-17',
		Statement: [{
			Action: 'execute-api:Invoke',
			Effect: effect,
			Resource: "*"
		}]
	}


	return policyDocument
}



exports.validateToken2 = async function(event) {
	//fetch Header 
	let auth = event.headers.Authorization;
	logger.info("auth es " + auth);

	//Process it
	if (auth.indexOf('Bearer') == -1) {
		return {
			statusCode: 401,
			body: JSON.stringify({
				'msg': 'Not found Bearer Token'
			}),

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
		body: JSON.stringify({
			'msg': 'congrats your token is ok'
		}),

	}

}