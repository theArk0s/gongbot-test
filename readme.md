# thingfabric-heroku-app

This Python / js application demonstrates how to use ThingFabric and the ThingFabric Heroku add-on to build applications _on top of_ ThingFabric.

## Pre-reqs

### Node.js + NPM

1. [Python](https://www.python.org/)
1. [Foreman](https://github.com/ddollar/foreman)


## Setup

    git clone https://github.com/m2mIO/thingfabric-heroku-app.git
    cd thingfabric-heroku-app
    git checkout python
    sudo pip install -r requirements.txt
    heroku create
    heroku addons:add thingfabric --app <YOUR_APP_NAME_HERE>
    git push heroku Python:master
    heroku plugins:install git://github.com/ddollar/heroku-config.git
    heroku config:pull

Optionally set the application port (Foreman defaults to `5000`):

    export PORT=3000

Run the application locally:

    Need to install redis-server (http://redis.io/topics/quickstart)

    redis-server
    foreman start

Visit the `localhost` URL with `PORT` you specified!

Pushing the application to Heroku:

    git push heroku master
    heroku open

Login to ThingFabric _by means of the Heroku add-on link_, then start the default Device Simulator in ThingFabric to see data come through!
