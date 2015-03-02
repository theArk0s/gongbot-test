angular.module('com.2lemetry.heroku-demo.services.websocket', []).factory('HerokuDemoWebSocketService', [ 
  '$window',
  function($window) {
    var scope;
    return {
      open: function(scope) {
        scope = scope;
        console.log('WebSocket connection opening at: ' + $window.location.origin.replace(/^http/, 'ws'));
        var ws = new WebSocket($window.location.origin.replace(/^http/, 'ws'));
        ws.onopen = function() {
          console.log('WebSocket opened!');
        };
        ws.onmessage = function (event) {
          var message = JSON.parse(event.data);
          message.date = new Date();
          console.log(message);
          scope.$emit('HerokuDemoWebSocketService:message', message);
        };
      }
    };
  }
]);
