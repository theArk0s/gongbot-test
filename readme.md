# gongbot-test

This Node.js / AngularJS application integrates a Heroku web service with Twilio and ThingFabric. 

Based on thingfabric-heroku-app (with fixes)

## Pre-reqs

### Heroku

You will need a Heroku account in order to use this sample application.

### Twilio

You will need a Twilio account in order to use this sample application.

### ThingFabric

You will need a ThingFabric account in order to use this application.

### Node.js + NPM

1. [Node.js](http://nodejs.org) (version 0.10.18)
1. [NPM](http://npm.org) (version 1.2.32)
1. [Bower](http://bower.io) as `sudo npm install -g bower@1.3.3`
1. [Foreman](https://github.com/strongloop/node-foreman) as `sudo npm install -g foreman@0.3.0`
1. [Express](http://expressjs.com) as 'sudo npm install -g express'
1. [Request](https://github.com/request/request) as 'sudo npm install -g request'

## Setup

### Deploy manually

    git clone https://github.com/theArk0s/gongbot-test.git
    cd gongbot-test
    npm install
    bower install
    npm install express
    npm install request
    heroku create 
    heroku addons:add thingfabric --app <YOUR_APP_NAME_HERE>
    heroku plugins:install git://github.com/ddollar/heroku-config.git
    heroku config:pull --app <YOUR_APP_NAME_HERE>

    ...change a bunch of account-specific variables...

Optionally set the application port (Foreman defaults to `5000`):

    export PORT=3000

Run the application locally:

    foreman start

Visit the `localhost` URL with `PORT` you specified!

Pushing the application to Heroku:

    git push heroku master
    heroku open
