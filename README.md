# Restaurant-Review-Service-API

This is a demo RESTful api to simulate the working of a restaurant rating website like yelp.

The API uses Node.js 8.1.2 as server side scripting language along with MySql database for storing data.


## Setup

#### 1. Install Node.js on your machine.
-	Download the latest version of node.js from here https://nodejs.org/en/download/
-	The above setup includes npm (node package manager)
-   Verify the installation by typing the following in your terminal
-   `node -v ` Should be 8.1.2 or above.
-   ` npm -v ` Should be 5.0 or above.

#### 2. Set up MySQL on your machine.
-	Download from https://dev.mysql.com/downloads/mysql/
-	After you have installed mysql, please make a note of the temporary password ( you'll need it later).
-   On your mac, hit `Command + SpaceBar` and type `MySql`
-   You should see a window saying ` The MySQL Server Instance is running`.


#### 3. Install MySQL workbench on your machine.
- Download : https://dev.mysql.com/downloads/workbench/
- Complete the installation and open the app from your Apps drawer on Mac.
- Click on thr ` + ` next to MySQL Connections.
- In the password section, type in the temp password that was generated while installing MySQL.
- You will be prompted to reset your password. type in a new password. This will be used for running your app.
- After you type in your new password, you should be able to navigate to the UI screen.
- click on `management` on left hand side menu.
- click on `Data import/ restore` , Click on `Import from Self-Contained File` and load the file found in this application root` ./setup-files/database`
- Once imported, you will have the sample database on your machine as a Schema named ` restaurant-rating-system`. SWEET ! So Far So Good.

#### 4. Install and Setup PostMan
- Postman is a developer tool that allows us to easily make HTTP Requests to APIs.
- https://www.getpostman.com/
- After you open postman, click on 'Import' on the top left corner of the screen.
- click on 'choose file' and select the ` Restaurant-review-service-api.postman_collection ` file in  `project-directory/setup-files`.
- Click on `Collections` in the top left corner of the UI; Here you will see `Restaurant-review-service-api` .
- This will present to you a list of templates to make requests to API endpoints.

- Sweet ! we are all set. Lets get the app running.

## Run the App

- Navigate to the project root directory and type ` npm install ` . This will install all the dependencies required for this app to run.

- Set the Process.Env variables for the database credentials. Check the ` ./config/defaults.js ` file for more info.

- On Mac , Environment variables can be set as follows

```
export HOST=localhost
export USER=your-database-user-name ('root' in most cases)
export PASS=your-database-pass (the one that you created while connecting MySQL Workbench to MySql)
```

- To start the service in debug mode, type the following in your terminal and hit enter.
```
export DEBUG=service,users,restaurants,rating
node app.js
```
debug mode will allow you to see a trace of all the sql commands, error information, and other useful information.

- To start the service in regular mode, type ` node app.js ` in your terminal and hit enter.

you will see something like :

```
SUCCESS: Connected to Database as ProcessId 498
Restaurant-Review-API started. Listening on port 3000
Test check : http://localhost:3000/service/service-status
```


- This confirms that your app successfully connected to the database and is listening on port 3000.

- Try hitting the service status uri from your web brouser to verify the app is working : ` http://localhost:3000/service/service-status `

- Please use the following route co verify that the app and Database are connected. : ` http://localhost:3000/users/allusers `

- Please try the different endpoints via postman to test different use-cases like creating a new user, updating an existing user, creating a new restaurant, adding a review etc.