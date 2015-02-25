var q = require('q'),
  mqtt = require('mqtt'),
  md5 = require('MD5'),
  uuid = require('node-uuid');
var errorMappings = {
  'Connection refused: Bad username or password': 'exception',
  'connect ECONNREFUSED': 'exception',
  'getaddrinfo ENOENT': 'exception'
};
var parseError = function(error) {
  error = error.toString();
  if (error.indexOf('[') !== -1) {
    var start = error.indexOf('[') + 1;
    var end = error.indexOf(']');
    error = error.substring(start, end);
  }
  return error.replace('Error: ', '');
};
var parse = function(topic, message) {
  try {
    var message = JSON.parse(message);
    var stuff = topic.split('/')[1];
    var thing = topic.split('/')[2];
    return {
      stuff: stuff,
      thing: thing,
      message: message
    };
  } catch (error) {
    return console.log('Could not parse Mqtt message received as JSON on topic ' + topic);
  }
};
module.exports = function(connOpts, messageProxy) {
  var defer = q.defer();
  console.log(JSON.stringify(connOpts, null, 2));
  var opts = {
    protocolVersion: 3,
    username: connOpts.THINGFABRIC_USERNAME,
    password: md5(connOpts.THINGFABRIC_PASSWORD),
    keepalive: 30,
    clientId: 'GongButton'
  };
  console.log('Connecting Mqtt client to %s:%s:', connOpts.THINGFABRIC_M2M_ENDPOINT.split(':')[0], 1883);
  console.log(JSON.stringify(opts, null, 2));
  var client = mqtt.createClient(1883, connOpts.THINGFABRIC_M2M_ENDPOINT.split(':')[0], opts);
  client.on('connect', function() {
    console.log('Mqtt ' + opts.clientId + ' connected and subscribing to %s', connOpts.THINGFABRIC_M2M_DATA_CHANNEL);
    client.subscribe(connOpts.THINGFABRIC_M2M_DATA_CHANNEL, {
      qos: 1
    });
    return defer.resolve();
  });
  client.on('message', function(topic, payload) {
    console.log('Mqtt client ' + opts.clientId + ' received message!');
    var parsed = parse(topic, payload);
    if (parsed) {
      return messageProxy(parsed);
    }
  });
  client.on('error', function(error) {
    console.log('Mqtt client ' + opts.clientId + ' error: ' + parseError(error));
  });
  client.on('disconnect', function() {
    console.log('Mqtt client ' + opts.clientId + ' disconnected!');
  });
  return defer.promise;
};
