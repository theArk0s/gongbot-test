angular.module('com.2lemetry.heroku-demo.directives.chart', []).directive('herokuDemoChart', [
  function() {
    return {
      restrict: 'A',
      scope: true,
      templateUrl: 'client/angular_components/directives/chart/directive.html',
      link: function($scope, element, attrs) {}
    };
  }
]);
