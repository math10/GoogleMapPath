import {
  Component,
  ViewChild,
  ElementRef
} from '@angular/core';
import {
  Platform
} from 'ionic-angular';


declare var google: any;

@Component({
  selector: 'page-map',
  templateUrl: 'map.html'
})
export class MapPage {

  @ViewChild('mapCanvas') mapElement: ElementRef;
  myLocation: any = null;
  y: any = null;
  mapData: any = [{
    "name": "Ionic HQ",
    "lat": 43.074395,
    "lng": -89.381056
  }, {
    "name": "Afterparty - Brocach Irish Pub",
    "lat": 43.07336,
    "lng": -89.38335
  },
  {
    "name": "Monona Terrace Convention Center",
    "lat": 43.071584,
    "lng": -89.380120,
    "center": true
  }];
  constructor(public platform: Platform) {}

  ionViewDidLoad() {
    var scope = this;
    setTimeout(function() {
      scope.myLocation = scope.mapData[0];
      scope.initMap();
    }, 2000);
  }

  initMap() {
    var markerArray = [];
    console.log(this.mapData);
    // Instantiate a directions service.
    var directionsService = new google.maps.DirectionsService;
    let mapEle = this.mapElement.nativeElement;
    // Create a map and center it on Manhattan.
    var map = new google.maps.Map(mapEle, {
      zoom: 13,
      center: this.mapData.find((d: any) => d.center)
    });

    var directionsDisplay = null;

    this.mapData.forEach(location => {
      let marker = new google.maps.Marker({
        icon: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
        title: location.name,
        position: new google.maps.LatLng(location.lat, location.lng),
        animation: google.maps.Animation.DROP,
        map: map
      });

      marker.addListener('click', () => {
        // Create a renderer for directions and bind it to the map.
        if(directionsDisplay !== null) directionsDisplay.setMap(null);
        directionsDisplay = new google.maps.DirectionsRenderer({
          map: map
        });

        // Instantiate an info window to hold step text.
        var stepDisplay = new google.maps.InfoWindow;

        this.y = location;

        // Display the route between the initial start and end selections.
        this.calculateAndDisplayRoute(
          directionsDisplay, directionsService, markerArray, stepDisplay, map);
        });
      });


    // Listen to change events from the start and end lists.
    // var onChangeHandler = function () {
    //   calculateAndDisplayRoute(
    //     directionsDisplay, directionsService, markerArray, stepDisplay, map);
    // };
    // document.getElementById('start').addEventListener('change', onChangeHandler);
    // document.getElementById('end').addEventListener('change', onChangeHandler);
    google.maps.event.addListenerOnce(map, 'idle', () => {
            mapEle.classList.add('show-map');
    });
  }

  calculateAndDisplayRoute(directionsDisplay, directionsService,
    markerArray, stepDisplay, map) {
    // First, remove any existing markers from the map.
    for (var i = 0; i < markerArray.length; i++) {
      markerArray[i].setMap(null);
    }

    var scope = this;
    // Retrieve the start and end locations and create a DirectionsRequest using
    // WALKING directions.
    directionsService.route({
      origin: this.myLocation,
      destination: this.y,
      travelMode: 'WALKING'
    }, function (response, status) {
      // Route the directions and pass the response to a function to create
      // markers for each step.
      if (status === 'OK') {
        // document.getElementById('warnings-panel').innerHTML =
        //   '<b>' + response.routes[0].warnings + '</b>';
        directionsDisplay.setDirections(response);
        scope.showSteps(response, markerArray, stepDisplay, map);
      } else {
        window.alert('Directions request failed due to ' + status);
      }
    });
  }

  showSteps(directionResult, markerArray, stepDisplay, map) {
    // For each step, place a marker, and add the text to the marker's infowindow.
    // Also attach the marker to an array so we can keep track of it and remove it
    // when calculating new routes.
    var myRoute = directionResult.routes[0].legs[0];
    for (var i = 0; i < myRoute.steps.length; i++) {
      var marker = markerArray[i] = markerArray[i] || new google.maps.Marker;
      marker.setMap(map);
      marker.setPosition(myRoute.steps[i].start_location);
      this.attachInstructionText(
        stepDisplay, marker, myRoute.steps[i].instructions, map);
    }
  }

  attachInstructionText(stepDisplay, marker, text, map) {
    google.maps.event.addListener(marker, 'click', function () {
      // Open an info window when the marker is clicked on, containing the text
      // of the step.
      stepDisplay.setContent(text);
      stepDisplay.open(map, marker);
    });
  }
}
