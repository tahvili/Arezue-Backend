# DSC-backend
This is the repo solely for the backend of our DSC-arezue project

## Requirements
- npm^=6.13
- nodejs^=12.14/1
- PostgreSQL^=12.1

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
## Testing
We will be using [mocha](https://mochajs.org/) as the testing environment and [chai](https://www.chaijs.com/) for assertion library. It will be similar to python unit testing, writing good test cases are a must

## NOTE
- Do not commit your node_modules folder, therefore do not delete what is in .gitignore
- For every feature, please use branching option
- Once feature is developed, please use pull requests, another team member will need to verify
- As you write, please document everything and write test cases if possible
