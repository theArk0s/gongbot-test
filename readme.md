# thingfabric-heroku-app

This Play framework Scala application demonstrates how to use ThingFabric and the ThingFabric Heroku add-on to build applications _on top of_ ThingFabric.

## Pre-reqs

1. [Play Framework 2.2.x](https://www.playframework.com/)


## Setup

    git clone https://github.com/m2mIO/thingfabric-heroku-app.git
    cd thingfabric-heroku-app
    git checkout Play-Scala
    heroku create
    heroku addons:add thingfabric --app <YOUR_APP_NAME_HERE>
    heroku plugins:install git://github.com/ddollar/heroku-config.git
    heroku config:pull --app <YOUR_APP_NAME_HERE>

Run the application locally:

    play run

Visit the `localhost` URL with `PORT` you specified!

Pushing the application to Heroku:

    git push heroku Play-Scala:master
    heroku open

Login to ThingFabric _by means of the Heroku add-on link_, then start the default Device Simulator in ThingFabric to see data come through!