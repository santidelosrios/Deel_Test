
# Deel Backend Test

## Description
This project implements the NodeJs client/contractor test. All endpoint were mostly implemented using Sequelize queries.

## Project struture
One folder was added to the original structure called `services`. Here we stored all the API handlers divided by model or API. 

## Challenges and/or issues
The biggest challange (it was pretty cool) I had was getting to know all the things Sequelize is capable to do. I had used it before but only with simple queries, so getting to this level was very interesting

## Changes for production
If we were taking this API to production, I would make the following changes:
- Testing: Unit, Integration and any other kind of testing we consider appropiate. 
- Containerization: I would add a custom image build and a `docker-compose` setup to deploy the application independently of the environment
- Error manegement: I would build a module/library for better error management. I repeated a lot of error messages and status codes and a shared library can do that job better so we can make our code more readable
- Error tracing and logging. I would add a logging library that can integrate with a Tracing platform like Datadog or Sentry
- Typescript: that gives us the ability to make our code more readable and take avantage of a more typed coding structure. For example, since both a Client and a Contractor are 'Profiles', Typescript would help us a lot to implement design patterns like Factory.
- Linting: Finally, I would add a linting tool like ESLint to enforce coding standards across the entire API.