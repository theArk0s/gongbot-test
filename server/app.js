if (!process.env.THINGFABRIC_CONFIG) {
  throw new Error('`THINGFABRIC_CONFIG` missing!');
}

var config = process.env.THINGFABRIC_CONFIG;

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
    THINGFABRIC_USERNAME: config.THINGFABRIC_USERNAME,
    THINGFABRIC_PASSWORD: config.THINGFABRIC_PASSWORD,
    THINGFABRIC_M2M_ENDPOINT: config.THINGFABRIC_M2M_ENDPOINT,
    THINGFABRIC_M2M_DATA_CHANNEL: config.THINGFABRIC_M2M_DATA_CHANNEL
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
