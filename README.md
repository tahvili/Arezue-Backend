# DSC-backend
This is the repo solely for the backend of our DSC-arezue project

## Requirements
- npm^6.13
- nodejs^12.14.1
- PostgreSQL^11

## Environments
All enviornmental variables (i.e. ports, database credentials) will go into the dotenv file

## How to start
If first time cloning the repo, we will need to download all dependencies, simply perform the following commands
```
npm install
npm start
```
We do **recommend** you develop with nodemon which provides easability, and it will be included in development environment.
Once nodemon is installed, simply perform the following commands
```
npm install
nodemon start
```
After running the above command, your webserver will now be started. By default we will be using port **3000** so connect using http://localhost:3000

## ExpressJS
Will be mainly using expressjs for its middleware and page routing

## Testing
We will be using [mocha](https://mochajs.org/) as the testing environment and [chai](https://www.chaijs.com/) for assertion library. It will be similar to python unit testing, writing good test cases are a must

## NOTE
- Do not commit your node_modules folder, therefore do not delete what is in .gitignore, if you feel there are files we shouldn't commit (i.e. individual development environment folder like IDE's environment) please update and create pull requests
- For every feature, please use branching option
- Once feature is developed, please use pull requests, another team member will need to verify
- As you write, please document everything and write test cases if possible
- While it is good to write codes when you know it, please strive to perform code development in a TDD (Test Driven Development) format so that we can think of edge cases while we develop
