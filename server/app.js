if (!process.env.THINGFABRIC_CONFIG) {
  throw new Error('`THINGFABRIC_CONFIG` missing!');
}
if (!process.env.NOT_THINGFABRIC_EXTRAS) {
  throw new Error('`NOT_THINGFABRIC_EXTRAS` missing!');
}

var config;
// config comes back different whether we are local or on heroku actual
try {
  config =  JSON.parse('{'.concat(process.env.THINGFABRIC_CONFIG).concat('}'));
} catch (error) {
  config =  JSON.parse('{"'.concat(process.env.THINGFABRIC_CONFIG).concat('"}'));
}
console.log(config);

var config2;
try {
  config2 =  JSON.parse('{'.concat(process.env.NOT_THINGFABRIC_EXTRAS).concat('}'));
} catch (error) {
  config2 =  JSON.parse('{"'.concat(process.env.NOT_THINGFABRIC_EXTRAS).concat('"}'));
}
console.log(config2);

var path = require('path'),
  http = require('http'),
  _ = require('underscore'),
  express = require('express'),
  mqtt = require('./mqtt'),
  WebSocketServer = require('ws').Server,
  request = require('request');

var twilio = require('twilio');
var client = new twilio.RestClient(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  
var app = express(), 
  port = parseInt(process.env.PORT, 10) || 3000, 
  wss, 
  connections = {};

var message_number = 0;
var original_sender;
var twilio_recipient;
var body_content;
var body_match = "DING";
var body_match2 = "ding";
var body_match3 = "Ding";
var body_match4 = "WIN";
var body_match5 = "win";
var body_match6 = "Win";
var body_match7 = "WON";
var body_match8 = "Won";
var body_match9 = "won";

// MQTT SECTION

app.configure(function(){
  app.use(express.logger());
  app.use('/client', express.static(path.resolve(__dirname, '../client/')));
  app.use('/', express.static(path.resolve(__dirname, '../client/')));
  app.use(express.bodyParser());
  app.use(app.router);
});

app.post('/sms2mqtt', function(req, res) {

  var xml;
  var status = sms2mqtt(req.body.Body);

if(message_number == 0) 
   {
   twilio_recipient = req.body.To;
   original_sender = req.body.From;
   body_content = req.body.Body;

console.log("<=============Message0===============>");
console.log("To: " + original_sender);
console.log("From: " + twilio_recipient);
console.log("Body: " + body_content);

   xml = '<?xml version="1.0" encoding="UTF-8"?><Response><Message>' + req.body.Body + '</Message></Response>';

   res.setHeader("Content-Type", "text/xml");
   console.log("Sending message " + message_number);
   res.send(xml);

   if (body_content === body_match || body_content === body_match2 || body_content === body_match3 || body_content === body_match4 || body_content === body_match5 || body_content === body_match6 || body_content === body_match7 || body_content === body_match8 || body_content === body_match9) {
   console.log("Body Matched Allowable Rules, continuing");
   message_number = 1;
   }
   else
   {
   console.log("Body <> DING, killing loop");
   message_number = 0;
   }

} 
else if(message_number == 1) 
   {
   body_content = req.body.Body;
   req.body.From = original_sender;
//   message_number = 0;

console.log("<=============Message1===============>");
console.log("To: " + original_sender);
console.log("From: " + twilio_recipient);
console.log("Body: " + body_content);

   client.sendMessage({
      to: "" + original_sender,
//      from: "+15005550006",
      from: "" + twilio_recipient,
      body: "" + body_content
      }, function(error, message) {
      if (error) {
          console.error('DAMMIT!!!: ' + error.message);
      message_number = 0;

      } else {
      console.log("Sending message " + message_number);
      console.log('Message sent! Message id: '+message.sid); 
      message_number = 0;

      } 
      });

   }

});

function sms2mqtt(sms) {

  var THINGFABRIC_URI = config2.THINGFABRIC_URI;
  var THINGFABRIC_PASSWORD = config.THINGFABRIC_PASSWORD;
  var THINGFABRIC_USERNAME = config.THINGFABRIC_USERNAME;

  var encodedTopic, opts, request, url;
  request = require('request');

  opts = {
    uri: "" + THINGFABRIC_URI,
    method: "POST",
    json: {
    message: "" + sms
    },
    auth: {
        user: "" + THINGFABRIC_USERNAME,
        pass: "" + THINGFABRIC_PASSWORD,
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
//  console.log('NODE_ENV: ' + process.env.NODE_ENV);
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
