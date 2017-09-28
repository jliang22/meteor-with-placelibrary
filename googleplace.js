if (Meteor.isClient) {
  var MAP_ZOOM = 15;
  var list = [];

  Meteor.startup(function() {
   GoogleMaps.load({ v: '3', key: Meteor.settings.apiKey, libraries: 'geometry,places' });
 });

  Template.map.onCreated(function() {
    var self = this;
    list.length = 0;
    GoogleMaps.ready('map', function(map) {
      var marker;

      // Create and move the marker when latLng changes.
      self.autorun(function() {
        var latLng = Geolocation.latLng();
        if (! latLng)
          return;

        // If the marker doesn't yet exist, create it.
        if (! marker) {
          marker = new google.maps.Marker({
            position: new google.maps.LatLng(latLng.lat, latLng.lng),
            map: map.instance
          });
        }
        // The marker already exists, so we'll just change its position.
        else {
          marker.setPosition(latLng);
        }

        // Center and zoom the map view onto the current position.
        map.instance.setCenter(marker.getPosition());
        map.instance.setZoom(MAP_ZOOM);
      });
    });
  });


  Template.map.events({
    'submit #search': function(event) {
    // Prevent default browser form submit
    event.preventDefault();
    var search = $('.search-input-box');
    // Get value from form element
    var searchValue = search.val();


    var map;
    var infowindow;

    var latLng = Geolocation.latLng();
    var pyrmont = new google.maps.LatLng(latLng.lat,latLng.lng);
    var mapPointsBounds=[];
    mapPointsBounds = new google.maps.LatLngBounds();
    list.length=0;
    map = new google.maps.Map(document.getElementById('map-container'), {
      center: pyrmont,
      zoom: 15
    });

    infowindow = new google.maps.InfoWindow();
    var service = new google.maps.places.PlacesService(map);
    service.textSearch({
      location:  new google.maps.LatLng(latLng.lat, latLng.lng),
      radius: 800,
      query: searchValue,
      type: searchValue
    }, callback);

    function callback(results, status) {
      if (status === google.maps.places.PlacesServiceStatus.OK) {
        for (var i = 0; i < results.length; i++) {

          list.push(results[i]);

          createMarker(results[i]);
        }
        Session.set('listResult', list);
        map.fitBounds(mapPointsBounds);
      }
    }

    function createMarker(place) {
      var placeLoc = place.geometry.location;
      var marker = new google.maps.Marker({
        map: map,
        position: place.geometry.location
      });
      mapPointsBounds.extend(place.geometry.location);
      google.maps.event.addListener(marker, 'click', function() {
        infowindow.setContent(place.name);
        infowindow.open(map, this);
      });
    }

            // Clear form
  // search.val('');
},
});

  Template.map.helpers({
    geolocationError: function() {
      var error = Geolocation.error();
      return error && error.message;
    },
    mapOptions: function() {
      var latLng = Geolocation.latLng();
      // Initialize the map once we have the latLng.
      if (GoogleMaps.loaded() && latLng) {
        return {
          center: new google.maps.LatLng(latLng.lat, latLng.lng),
          zoom: MAP_ZOOM
        };
      }
    },
    listResult: function() {
      return Session.get('listResult', list);
    },

  });

}
