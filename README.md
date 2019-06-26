# serverless_demo
SAM Aws demo project with some features = APIGateway+Lambda Auth => LambdaFunction => SNS => SQS =>S3 (put and get)

Requeriments:
-npm installed
-AWS account 
-AWS cli
-Configure aws cli "aws configure"

Build:
-execute npm install to fetch dependencies.

1.Create the Bucket on AWS to upload the code:
	$ aws s3 mb s3://serverless-demo-bucket-dpp   
	> make_bucket: serverless-demo-bucket-dpp

	(my bucket name will be "serverless-demo-bucket-dpp" )

1. Package the app (run ./build.sh or execute  sam cli )
	
	$ sam package --template-file template.yaml --output-template-file packaged.yaml --s3-bucket serverless-demo-bucket-dpp

2. After packaged , upload the code (or execute ./deploy.sh) Ensure set your own StackName and region

	$ sam deploy --template-file packaged.yaml --stack-name serverlessDemoStack --capabilities CAPABILITY_IAM --region us-west-2

	
	
TO TEST IT:

$ curl -X POST -H 'Authorization: Basic dXNlcjE6MTIzNDU=' -i http://localhost:3000/login     (f.ex : user admin123/12345)

This request will return the JWT token for 1 minute, paste the token on Bearer Authentication header

$ curl -X POST -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InVzZXIxIiwicHJpdmlsZWRnZXMiOiJhbHRvIHkgb2pvcyBhenVsZXMiLCJpYXQiOjE1NjEwMzY0NzYsImV4cCI6MTU2MTAzNjUzNn0.Wt5uzZmAP33urTLLIpJcq9SNUhSynkHtDVgaw-Ke5YU' -i http://localhost:3000/token/validate



Para esta version vamos a crear una tabla en Dynamo para usuaros (usersTable),
1-añadimos en el template.yaml 

Pero es necesario crear la tabla en remoto para poder jugar (se podria hacer un docker con una imagen y demas....pero no nos vamos aliar)
Asi que hay que hacer el build para construir la plantilla de cloudformation y hacer el deploy


TO TEST:
CREATE NEW USER:
curl -X POST -k -H 'Content-Type: application/json' -i 'https://99gbvdr12e.execute-api.us-west-2.amazonaws.com/Dev/users' --data '{
  "lastName": "Marcos Alonso",
  "password": "s3cr3t",
  "address": {
    "name": "alcala ,4A ",
    "Country": "Spain",
    "ZipCode": 28043
  },
  "document": {
    "type": "NIF",
    "value": "519331112K"
  },
  "name": "Paco",
  "email": "paco@gmail.com",
  "acceptedLegalConditions": true
}'
UPDATE THE USER (partial update):
curl -X PUT -k -H 'Content-Type: application/json' -i 'https://99gbvdr12e.execute-api.us-west-2.amazonaws.com/Dev/users/519331112K' --data '{
  "address": {
    "name": "Mayor 72,4A ",
    "Country": "Slovakia",
    "ZipCode": 2345667
  }
}'
FETCH THE USER
curl -X GET -k -i 'https://99gbvdr12e.execute-api.us-west-2.amazonaws.com/Dev/users/519331112K'

DELETE THE USER
curl -X DELETE -k -H 'Accept: application/json' -i 'https://99gbvdr12e.execute-api.us-west-2.amazonaws.com/Dev/users/519331112K'



https://medium.com/@siddharthac6/json-web-token-jwt-the-right-way-of-implementing-with-node-js-65b8915d550e
//CON JWT 
Obtener un token, a partir de las credenciales
curl -X POST -k -H 'Authorization: Basic YWRtaW4xMjM6MTIzNDU=' -i 'https://99gbvdr12e.execute-api.us-west-2.amazonaws.com/Dev/login'
retorna el body 
{
  "token": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkbWluMTIzIiwiY2xhaW1zIjoicmVhZDp3cml0ZSBQZXRzIiwiaWF0IjoxNTYxNTQ4OTA3LCJleHAiOjE1NjE1NTA3MDd9.hfycl0TEAJ8YvaD1kyHutFcPO0hamWRMKGA5mOeOOQw",
  "refreshToken": "Bearer 12345"
}

Ahora usar el valor de ese token en todas las peticiones y meterlo en la cabecera Authorization .
Lso ejemplos anteriores ahora sonn asi:

curl -X POST -k -H 'Content-Type: application/json' -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkbWluMTIzIiwiY2xhaW1zIjoicmVhZDp3cml0ZSBQZXRzIiwiaWF0IjoxNTYxNTQ4OTA3LCJleHAiOjE1NjE1NTA3MDd9.hfycl0TEAJ8YvaD1kyHutFcPO0hamWRMKGA5mOeOOQw' -i 'https://99gbvdr12e.execute-api.us-west-2.amazonaws.com/Dev/users' --data '{
  "lastName": "Marcos Alonso",
  "password": "s3cr3t",
  "address": {
    "name": "alcala ,4A ",
    "Country": "Spain",
    "ZipCode": 28043
  },
  "document": {
    "type": "NIF",
    "value": "519331116K"
  },
  "name": "Paco",
  "email": "paco@gmail.com",
  "acceptedLegalConditions": true
}'


curl -X PUT -k -H 'Content-Type: application/json' -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkbWluMTIzIiwiY2xhaW1zIjoicmVhZDp3cml0ZSBQZXRzIiwiaWF0IjoxNTYxNTQ4OTA3LCJleHAiOjE1NjE1NTA3MDd9.hfycl0TEAJ8YvaD1kyHutFcPO0hamWRMKGA5mOeOOQw' -i 'https://99gbvdr12e.execute-api.us-west-2.amazonaws.com/Dev/users/519331116K' --data '{
  "address": {
    "name": "Mayor 72,4A ",
    "Country": "Bartolacaca",
    "ZipCode": 2345667
  }
}'

curl -X GET -k -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkbWluMTIzIiwiY2xhaW1zIjoicmVhZDp3cml0ZSBQZXRzIiwiaWF0IjoxNTYxNTQ4OTA3LCJleHAiOjE1NjE1NTA3MDd9.hfycl0TEAJ8YvaD1kyHutFcPO0hamWRMKGA5mOeOOQw' -H 'Accept: application/json' -i 'https://99gbvdr12e.execute-api.us-west-2.amazonaws.com/Dev/users/519331115K'

curl -X DELETE -k -H 'Accept: application/json' -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkbWluMTIzIiwiY2xhaW1zIjoicmVhZDp3cml0ZSBQZXRzIiwiaWF0IjoxNTYxNTQ4OTA3LCJleHAiOjE1NjE1NTA3MDd9.hfycl0TEAJ8YvaD1kyHutFcPO0hamWRMKGA5mOeOOQw' -i 'https://99gbvdr12e.execute-api.us-west-2.amazonaws.com/Dev/users/519331116K'