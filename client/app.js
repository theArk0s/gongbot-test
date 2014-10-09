angular.module('com.2lemetry.heroku-demo', [
  'com.2lemetry.heroku-demo.services.websocket',
  'com.2lemetry.heroku-demo.directives.table',
  'com.2lemetry.heroku-demo.directives.map'
]).controller('HerokuDemoController', [
  '$scope', 
  'HerokuDemoWebSocketService',
  function($scope, HerokuDemoWebSocketService) {
    $scope.messages = [];
    $scope.$on('HerokuDemoWebSocketService:message', function(event, message) {
      $scope.$apply(function() {
        $scope.currentMessage = message.message;
        $scope.messages.unshift(message);
        if ($scope.messages.length > 10) {
          $scope.messages = _.first($scope.messages, 10);
        }
      });
    });
    HerokuDemoWebSocketService.open($scope); 
  }
]);
