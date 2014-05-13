angular.module('com.2lemetry.heroku-demo', [
  'com.2lemetry.heroku-demo.services.websocket',
  'com.2lemetry.heroku-demo.directives.table',
  'com.2lemetry.heroku-demo.directives.chart'
]).controller('HerokuDemoController', ['$scope', 'HerokuDemoWebSocketService',
  function($scope, HerokuDemoWebSocketService) {
    $scope.messages = [];
    $scope.$on('HerokuDemoWebSocketService:message', function(event, message) {
      $scope.$apply(function() {
        $scope.messages.unshift(message);
        if ($scope.messages.length > 50) {
          $scope.messages = _.first(50, $scope.messages);
        }
      });
    });
    HerokuDemoWebSocketService.open($scope); 
  }
]);
