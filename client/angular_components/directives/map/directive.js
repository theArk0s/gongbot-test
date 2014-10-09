angular.module('com.2lemetry.heroku-demo.directives.map', []).directive('herokuDemoMap', [
  '$window',
  function($window) {
    return {
      restrict: 'A',
      scope: true,
      templateUrl: 'client/angular_components/directives/map/directive.html',
      link: function($scope, element, attrs) {
        var map,
          tileLayer = $window.L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            maxZoom: 18,
            minZoom: 0,
            attribution: false
          }),
          currentPositionLayer = $window.L.featureGroup([]),
          layers = [
            tileLayer,
            currentPositionLayer
          ];
        var createMap = function() {
          map = $window.L.map('heroku-demo-map', {
            center:  {
              lat: 36.619937,
              lng: -103.535156
            },
            zoom: 15,
            layers: layers
          });
          map.invalidateSize();
        };
        var getMarker = function(latLng) {
          var icon = $window.L.icon({
            iconUrl: '/client/img/marker-icon-blue.png',
            shadowUrl: '/client/img/marker-shadow.png',
            iconSize: [25, 41],
            shadowSize: [41, 41],
            iconAnchor: [12, 40],
            shadowAnchor: [12, 40],
            popupAnchor: [0, -40]
          });
          return $window.L.marker(latLng, {
            icon: icon
          });
        };
        var updateMap = function(latLng) {
          currentPositionLayer.clearLayers();
          currentPositionLayer.addLayer(getMarker(latLng));
          map.fitBounds(currentPositionLayer.getBounds());
        };
        createMap();
        $scope.$watch('currentMessage', function(currentMessage) {
          if (currentMessage && currentMessage.location) {
            // GPX Simulator / Geofence Rule format.
            if (currentMessage.location.split(',').length > 1) {
              updateMap({
                lat: currentMessage.location.split(',')[0],
                lng: currentMessage.location.split(',')[1]
              });
            } else {
              updateMap({
                lat: currentMessage.location.latitude,
                lng: currentMessage.location.longitude
              });
            }
          }
        }, true);
      }
    };
  }
]);
