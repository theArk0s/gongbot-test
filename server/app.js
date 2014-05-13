if (!process.env.THINGFABRIC_USERNAME) {
  throw new Error('`THINGFABRIC_USERNAME` missing!');
}
if (!process.env.THINGFABRIC_PASSWORD) {
  throw new Error('`THINGFABRIC_PASSWORD` missing!');
}
if (!process.env.THINGFABRIC_M2M_ENDPOINT) {
  throw new Error('`THINGFABRIC_M2M_ENDPOINT` missing!');
}
if (!process.env.THINGFABRIC_M2M_DATA_CHANNEL) {
  throw new Error('`THINGFABRIC_M2M_DATA_CHANNEL` missing!');
}

var path = require('path'),
  http = require('http'),
  _ = require('underscore'),
  express = require('express'),
  mqtt = require('./mqtt'),
  WebSocketServer = require('ws').Server,
  app = express(), 
  port = process.env.PORT || 3000, 
  wss, 
  connections = {};

app.use(express.logger());
app.use('/client', express.static(path.resolve(__dirname, '../client/')));
app.use('/', express.static(path.resolve(__dirname, '../client/')));

var server = http.createServer(app);
server.listen(port);

// Proxy Mqtt messages from ThingFabric Devices/Simulators over to browser pages with WebSocket connection open.
var messageProxy = function(message) {
  if (!wss) {
    return console.log('Mqtt -> WebSocket proxy not available!');
  }
  console.log('Mqtt -> WebSocket message being proxied:');
  console.log(message);
  for (id in connections) {
    connections[id].send(JSON.stringify(message), function() { 
      console.log('Mqtt -> WebSocket message proxied to: %s', id);
    });
  }
};

server.listen(port, function() {
  console.log('NODE_ENV: ' + process.env.NODE_ENV);
  console.log('Heroku Demo started on port %s', port);
  mqtt({
    THINGFABRIC_USERNAME: process.env.THINGFABRIC_USERNAME,
    THINGFABRIC_PASSWORD: process.env.THINGFABRIC_PASSWORD,
    THINGFABRIC_M2M_ENDPOINT: process.env.THINGFABRIC_M2M_ENDPOINT,
    THINGFABRIC_M2M_DATA_CHANNEL: process.env.THINGFABRIC_M2M_DATA_CHANNEL
  }, messageProxy).then(function() {
    wss = new WebSocketServer({
      server: server
    });
    wss.on('connection', function(ws) {
      var id = new Date().getTime();
      console.log('New WebSocket connection: %s', id);
      connections[id] = ws;
      console.log('Total connections: %s', _.size(connections));
      ws.on('close', function() {
        console.log('WebSocket connection closed: %s', id);
        delete connections[id];
        console.log('Total connections: %s', _.size(connections));
      });
    });
  });
});