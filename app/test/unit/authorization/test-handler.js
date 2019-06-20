'use strict';

const app = require('../../../authorizer.js');
const chai = require('chai');
const expect = chai.expect;
var fs = require('fs');


var event = JSON.parse(fs.readFileSync('./test/unit/authorization/test-data.json', 'utf8'));
var context;

describe('Tests index', function () {
    it('verifies successful response', async () => {
        //event = JSON.parse(fs.readFileSync('./test-data.json', 'utf8'));
        console.log(event);
        const result = await app.basiclogin(event, context)

        console.log('y el result est ');
        console.log(result);

        expect(result.headers.Authorization).to.be.an('string');//verify Token is returned
        expect(result).to.be.an('object');
        expect(result.statusCode).to.equal(200);
        expect(result.body).to.be.an('string');

        let response = JSON.parse(result.body);
console.log('que moviidiaiaiia');
        console.log(response);
        expect(response).to.be.an('object');
        //expect(response.message).to.be.equal("hello world");
        // expect(response.location).to.be.an("string");
    });
});
