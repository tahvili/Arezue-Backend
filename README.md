# Arezue - Recruitment App - Backend
This is the repo solely for the backend of our Arezue - Recruitment App - Backend project

## Main Backend developer
- daffychuy [https://github.com/daffychuy]
- pshyong [https://github.com/pshyong]

## Requirements
- npm^6.13
- nodejs^12.14.1
- PostgreSQL^11 // We recommend 12 or higher

## Environments
All enviornmental variables (i.e. ports, database credentials) will go into the dotenv (.env) file.

*Currently the file contains credential to our remote API server which is only valid in that server's IP range making security not an issue given no one outside that IP can access the database even knowing the credential*

## How to start
If first time cloning the repo, we will need to download all dependencies, simply perform the following commands
```
npm install
npm start
```
We do **recommend** you develop with nodemon which provides easability, and it will be included in development environment.
Once nodemon is installed, simply perform the following commands
```
npm install -D
nodemon start
```
After running the above command, your webserver will now be started. By default we will be using port ```3000``` so connect using http://localhost:3000

Now we need a working database, which we've kindly provided a ```init.sh``` that will initilize all tables automatically, but in order to use the script, you will need to first manually create the database. After the database has been created, you must modify ```database.conf``` accordingly to the database you've just created.

## ExpressJS
We use Express module for nodejs for middleware, routing, and API.

## Databases
- We are using PostgreSQL for our backend and frontend's database
- All schemas for databases are stored in the db folder
- There is a init.sh that will allow people to generate the database tables by just executing the script
- Before running the script, you are required to modify database.conf accordingly to your own database configuration
    ```
    ## Several options for the script: ##
    ./init # Create only the database
    ./init dummy # Insert only the dummy data into the database
    ./init all or ./init new # Creates and insert dummy data into the database
    ./init clear # Remove all data from the databse including the table itself
    ```
## Data model
Our database follows the following image of data model that our backend has designed to give scalability.
[Enlarge Here](https://app.sqldbm.com/PostgreSQL/Share/kV3GUyt-8Z5r7qtVxQ4xGkGFrngIE8md_DYjF4jNYw0) (Note: This diagram is outdated)
![Image of Data Model](https://i.imgur.com/NbNqjvO.png)

## Testing
We will be using [mocha](https://mochajs.org/) as the testing environment and [chai](https://www.chaijs.com/) for assertion library. It will be similar to python unit testing, writing good test cases are a must

## NOTE
- Do not commit your node_modules folder, therefore do not delete what is in .gitignore, if you feel there are files we shouldn't commit (i.e. individual development environment folder like IDE's environment) please update and create pull requests
- For every feature, please use branching option
- Once feature is developed, please use pull requests, another team member will need to verify
- As you write, please document everything and write test cases if possible
- While it is good to write codes when you know it, please strive to perform code development in a TDD (Test Driven Development) format so that we can think of edge cases while we develop
