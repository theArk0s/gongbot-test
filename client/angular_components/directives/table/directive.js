angular.module('com.2lemetry.heroku-demo.directives.table', []).directive('herokuDemoTable', [
  function() {
    return {
      restrict: 'A',
      scope: true,
      templateUrl: 'client/angular_components/directives/table/directive.html'
    };
  }
]);
