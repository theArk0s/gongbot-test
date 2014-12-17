# thingfabric-heroku-app

This Node.js / AngularJS application demonstrates how to use ThingFabric to build applications _on top of_ ThingFabric. 

## Pre-reqs

### Heroku

You will need a Heroku account in order to use this sample application.

### ThingFabric

This branch of the thingfabric-heroku-app is meant to be deployed from the ThingFabric Portal. Sign up first here: [ThingFabric Portal](https://app.thingfabric.com)

### Node.js + NPM

1. [Node.js](http://nodejs.org) (version 0.10.18)
1. [NPM](http://npm.org) (version 1.2.32)
1. [Bower](http://bower.io) as `sudo npm install -g bower@1.3.3`
1. [Foreman](https://github.com/strongloop/node-foreman) as `sudo npm install -g foreman@0.3.0`

## Setup

    git clone https://github.com/m2mIO/thingfabric-heroku-app.git
    cd thingfabric-heroku-app
    npm install
    bower install
    heroku create 
    heroku addons:add thingfabric --app <YOUR_APP_NAME_HERE>
    heroku plugins:install git://github.com/ddollar/heroku-config.git
    heroku config:pull --app <YOUR_APP_NAME_HERE>

Optionally set the application port (Foreman defaults to `5000`):

    export PORT=3000

Run the application locally:

    foreman start

Visit the `localhost` URL with `PORT` you specified!

Pushing the application to Heroku:

    git push heroku master
    heroku open

Login to ThingFabric _by means of the Heroku add-on link_, then start the default Device Simulator in ThingFabric to see data come through!
