  if (Meteor.isClient) {
    var MAP_ZOOM = 15;
    var list = [];
    var markers = [];
    var infoWindow;
    var myMarker;
    var directionsService;
     var directionsDisplay;

    Meteor.startup(function() {
     GoogleMaps.load({ v: '3', key: Meteor.settings.public.apiKey, libraries: 'geometry,places' });
   });

    Template.map.onCreated(function() {
      var self = this;
      list.length = 0;
      GoogleMaps.ready('map', function(map) {
      

        self.autorun(function() {
          var latLng = Geolocation.latLng();
          if (! latLng)
            return;
          if (! myMarker) {
            myMarker = new google.maps.Marker({
              position: new google.maps.LatLng(latLng.lat, latLng.lng),
              map: map.instance,
              content: "You are here!",
              icon: "http://maps.google.com/mapfiles/ms/icons/green-dot.png"
            });
          }
         
          else {
            myMarker.setPosition(latLng);
          }
          map.instance.setCenter(myMarker.getPosition());
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
      //var infowindow;

      var latLng = Geolocation.latLng();
      var pyrmont = new google.maps.LatLng(latLng.lat,latLng.lng);
      var mapPointsBounds=[];
      mapPointsBounds = new google.maps.LatLngBounds();
      list.length=0;
      map = new google.maps.Map(document.getElementById('map-container'), {
        center: pyrmont,
        zoom: 15
      });

 infoWindow = new google.maps.InfoWindow({
          content: document.getElementById('info-content')
        });
        directionsService = new google.maps.DirectionsService;
        directionsDisplay = new google.maps.DirectionsRenderer({suppressMarkers: true});


      var service = new google.maps.places.PlacesService(map);
      service.textSearch({
        location:  new google.maps.LatLng(latLng.lat, latLng.lng),
        radius: 800,
        query: searchValue,
        type: searchValue
      }, callback);

      function callback(results, status) {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
          clearResults();
          clearMarkers();

              for (var i = 0; i < results.length; i++) {

                markers[i] = new google.maps.Marker({
                  position: results[i].geometry.location

                });

                markers[i].placeResult = results[i];
                google.maps.event.addListener(markers[i], 'click', showInfoWindow);
                setTimeout(dropMarker(i), i * 100);
                addResult(results[i], i);
              }
               $('ul.tabs').tabs('select_tab', 'test1');
              markers[results.length] = myMarker;
              markers[results.length].setMap(map);
              map.fitBounds(mapPointsBounds);
            }
          }
          function clearResults() {
            var results = document.getElementById('results');
            while (results.childNodes[0]) {
              results.removeChild(results.childNodes[0]);
            }
          }  
          function hoverMarker(position) {
           if (marker.getAnimation() !== null) {
            marker.setAnimation(null);
          } else {
            marker.setAnimation(google.maps.Animation.BOUNCE);
          }
        }

        function showInfoWindow() {
        var marker = this;
        places = new google.maps.places.PlacesService(map);
        places.getDetails({placeId: marker.placeResult.place_id},
            function(place, status) {
              if (status !== google.maps.places.PlacesServiceStatus.OK) {
                return;
              }
              infoWindow.open(map, marker);
               buildIWContent(place);
     
            });
        directionsDisplay.setMap(null);
        directionsDisplay.setMap(map);
        directionsDisplay.setPanel(document.getElementById('test2'));
        calculateAndDisplayRoute(marker, directionsService, directionsDisplay);
      }
      function calculateAndDisplayRoute(marker, directionsService, directionsDisplay) {
        directionsService.route({
          origin: myMarker.position,
          destination: marker.position,
          travelMode: 'DRIVING'
        }, function(response, status) {
          if (status === 'OK') {
            directionsDisplay.setDirections(response);
          $('ul.tabs').tabs('select_tab', 'test2');
          } else {
            window.alert('Directions request failed due to ' + status);
          }
        });
      }

        function dropMarker(i) {
          return function() {
            markers[i].setMap(map);
          };
        }
        function clearMarkers() {
          for (var i = 0; i < markers.length; i++) {
            if (markers[i]) {
              markers[i].setMap(null);
            }
          }
          markers = [];
        }   
        function addResult(result, i) {
          mapPointsBounds.extend(result.geometry.location);
          var results = document.getElementById('results');
          results.style.border = "2px solid black";
          results.style.borderTop = "none";
          var tr = document.createElement('tr');
          tr.style.backgroundColor = (i % 2 === 0 ? '#F0F0F0' : '#FFFFFF');
          tr.onclick = function() {
            google.maps.event.trigger(markers[i], 'click');
          };

          var addressTd = document.createElement('td');
          var nameTd = document.createElement('td');
          var name = document.createTextNode(result.name);
          var address = document.createTextNode(result.formatted_address)
          addressTd.appendChild(address);
          nameTd.appendChild(name);
          tr.appendChild(nameTd);
          tr.appendChild(addressTd);
          results.appendChild(tr);
        }

        function buildIWContent(place) {
          document.getElementById('iw-url').innerHTML = '<b><a href="' + place.url +
          '">' + place.name + '</a></b>';
          document.getElementById('iw-address').textContent = place.vicinity;

document.getElementById('iw-icon').innerHTML = '<b><button><a href="' + place.url +
            '"><img src="http://superawesomevectors.com/wp-content/uploads/2015/11/black-simple-car-icon.jpg" width="42" height="42"></a></button></b>';


          if (place.formatted_phone_number) {
            document.getElementById('iw-phone-row').style.display = '';
            document.getElementById('iw-phone').textContent =
            place.formatted_phone_number;
          } else {
            document.getElementById('iw-phone-row').style.display = 'none';
          }

          if (place.rating) {
            var ratingHtml = '';
            for (var i = 0; i < 5; i++) {
              if (place.rating < (i + 0.5)) {
                ratingHtml += '&#10025;';
              } else {
                ratingHtml += '&#10029;';
              }
              document.getElementById('iw-rating-row').style.display = '';
              document.getElementById('iw-rating').innerHTML = ratingHtml;
            }
          } else {
            document.getElementById('iw-rating-row').style.display = 'none';
          }

          if (place.website) {
            document.getElementById('iw-website-row').style.display = '';
            document.getElementById('iw-website').textContent = place.website;
          } else {
            document.getElementById('iw-website-row').style.display = 'none';
          }
        }
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
