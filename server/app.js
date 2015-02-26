if (!process.env.THINGFABRIC_CONFIG) {
  throw new Error('`THINGFABRIC_CONFIG` missing!');
}

var config;
// config comes back different whether we are local or on heroku actual
try {
  config =  JSON.parse('{'.concat(process.env.THINGFABRIC_CONFIG).concat('}'));
} catch (error) {
  config =  JSON.parse('{"'.concat(process.env.THINGFABRIC_CONFIG).concat('"}'));
}
console.log(config);

var path = require('path'),
  http = require('http'),
  _ = require('underscore'),
  express = require('express'),
  mqtt = require('./mqtt'),
  WebSocketServer = require('ws').Server,
  request = require('request');
  
var app = express(), 
  port = process.env.PORT || 3000, 
  wss, 
  connections = {};

app.use(express.logger());
app.use('/client', express.static(path.resolve(__dirname, '../client/')));
app.use('/', express.static(path.resolve(__dirname, '../client/')));

// MQTT TEST

app.post('/sms2mqtt', function(request, response) {
  var xml;
  // return a blank response to Twilio
  xml = '<?xml version="1.0" encoding="UTF-8"?><Response></Response>';
var status = sms2mqtt(request);
//  var status = sms2mqtt(request.body.Body);
//  response.status(status).type("text/xml").send(xml);
response.send(xml);
});

function sms2mqtt(sms) {
  var encodedTopic, opts, request, url;
  request = require('request');
  url = 'http://api.thingfabric.com/2';
 
  encodedTopic = encodeURIComponent('gvgxnrkdrpj9co1/RingGong');
 
  opts = {
    uri: "" + url + "/account/domain/gvgxnrkdrpj9c1o/stuff/things/thing/GongButton/publish?topic=" + encodedTopic,
    method: "POST",
    json: {
      payload: "" + sms
    },
    auth: {
      user: "c3daf8f3-8683-44f0-b8b0-5a7b47d89fe8",
      pass: "7b867993-f81e-4b9a-ace9-934a1800e5c2",
      sendImmediately: true
    }
  };
 
  return request.post(opts, function(error, response, body) {
    return response.statusCode;
  });
};

// END MQTT TEST


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
  console.log('ThingFabric Heroku app started on port %s', port);
  mqtt({
    THINGFABRIC_USERNAME: config.THINGFABRIC_USERNAME,
    THINGFABRIC_PASSWORD: config.THINGFABRIC_PASSWORD,
    THINGFABRIC_M2M_ENDPOINT: config.THINGFABRIC_M2M_ENDPOINT,
    THINGFABRIC_M2M_DATA_CHANNEL: config.THINGFABRIC_M2M_DATA_CHANNEL
  }, messageProxy).then(function() {
    console.log('Starting WebSocket server...');
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
