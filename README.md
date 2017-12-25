# Restaurant-Review-Service-API

This is a demo RESTful api to simulate the working of a restaurant rating website like yelp.

The API uses Node.js 8.1.2 as server side scripting language along with MySql database for storing data.


## Setup

Install Node.js on your machine.
-	Download the latest version of node.js from here https://nodejs.org/en/download/
-	The above setup includes npm (node package manager)

Set up MySQL on your machine.
-	Download from https://dev.mysql.com/downloads/mysql/
-	After you have installed mysql, please import the .sql file provided in the folder

Install and Setup PostMan
- Postman is a developer tool that allows us to easily make HTTP Requests to APIs.
- https://www.getpostman.com/
- After you open postman, click on 'Import' on the top left corner of the screen.
- click on 'choose file' and select the ` Restaurant-review-service-api.postman_collection ` file in  `project-directory/setup-files`
- This will allow you to have a set templates to make requests to API endpoints.


## Run the App

Navigate to the project root directory and type ` npm install ` . This will install all the dependencies required for this app to run.

To start the service, type ` node app.js ` in your terminal and hit enter.

you will see something like :

```
SUCCESS: Connected to Database as ProcessId 498
Restaurant-Review-API started. Listening on port 3000
Test check : http://localhost:3000/service/service-status
```


- This confirms that your app successfully connected to the database and is listening on port 3000.

- Try hitting the service status uri from your web brouser to verify the app is working : ` http://localhost:3000/service/service-status `

- Please use the different endpoints provided using postman import file to test different use cases like creating a new user, updating an existing user, creating a new restaurant, adding a review etc.