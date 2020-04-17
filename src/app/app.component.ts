import { Component, OnInit, ViewChild, ElementRef, NgZone } from '@angular/core';
import { MapsAPILoader, MouseEvent, GeocoderResult } from '@agm/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title: string = 'google-api';
  latitude: number;
  longitude: number;
  zoom: number;
  address: string;
  private geoCoder: any;
  useApiSelect = true;
  interfaceIsHided = false;
  isFormSuccess = false;
  places = [
    
  ];
  staticPlaces = [
    {
      name: 'Кинотеатр "Мир"',
      latitude: 49.224635181023004,
      longitude: 28.41901368873595
    },
    {
      name: 'Винницкий политехнический университет',
      latitude: 49.23407614389448,
      longitude: 28.412136504821767
    },
    {
      name: 'магазин "Сильпо"',
      latitude: 49.226548041306835,
      longitude: 28.404519031219472
    }
  ]
  styles: any = [
    { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
    {
      featureType: 'administrative.locality',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#d59563' }]
    },
    {
      featureType: 'poi',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#d59563' }]
    },
    {
      featureType: 'poi.park',
      elementType: 'geometry',
      stylers: [{ color: '#263c3f' }]
    },
    {
      featureType: 'poi.park',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#6b9a76' }]
    },
    {
      featureType: 'road',
      elementType: 'geometry',
      stylers: [{ color: '#38414e' }]
    },
    {
      featureType: 'road',
      elementType: 'geometry.stroke',
      stylers: [{ color: '#212a37' }]
    },
    {
      featureType: 'road',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#9ca5b3' }]
    },
    {
      featureType: 'road.highway',
      elementType: 'geometry',
      stylers: [{ color: '#746855' }]
    },
    {
      featureType: 'road.highway',
      elementType: 'geometry.stroke',
      stylers: [{ color: '#1f2835' }]
    },
    {
      featureType: 'road.highway',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#f3d19c' }]
    },
    {
      featureType: 'transit',
      elementType: 'geometry',
      stylers: [{ color: '#2f3948' }]
    },
    {
      featureType: 'transit.station',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#d59563' }]
    },
    {
      featureType: 'water',
      elementType: 'geometry',
      stylers: [{ color: '#17263c' }]
    },
    {
      featureType: 'water',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#515c6d' }]
    },
    {
      featureType: 'water',
      elementType: 'labels.text.stroke',
      stylers: [{ color: '#17263c' }]
    }
  ]


  @ViewChild('search')
  public searchElementRef: ElementRef;

  constructor(
    private mapsAPILoader: MapsAPILoader,
    private ngZone: NgZone
  ) { }

  ngOnInit() {
    
    this.mapsAPILoader.load()
      .then(() => {
        this.setCurrentLocation();
        
        this.geoCoder = new google.maps.Geocoder;
        
        let autocomplete = new google.maps.places.Autocomplete(this.searchElementRef.nativeElement, {
          types: ["address"]
        });
        
        autocomplete.addListener("place_changed", () => {
          this.ngZone.run(() => {

            let place: google.maps.places.PlaceResult = autocomplete.getPlace();
            
            if (place.geometry === undefined || place.geometry === null) {
              return;
            }
            this.latitude = place.geometry.location.lat();
            this.longitude = place.geometry.location.lng();
            this.zoom = 12;
          });
        });
      });
  }

  setCurrentOption(event) {
    const currentOption = event.target.value;
    const foundedOption = this.places.find(item => item.name === currentOption) || this.staticPlaces.find(item => item.name === currentOption);
    this.longitude = foundedOption.longitude;
    this.latitude = foundedOption.latitude;
    this.address = event.target.value;
    console.log(event.target.value);
    this.zoom = 12;
  }

  changeCurInterface() {
    this.useApiSelect = !this.useApiSelect;
  }

  private setCurrentLocation() {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        this.latitude = position.coords.latitude;
        this.longitude = position.coords.longitude;
        this.zoom = 12;
        this.getAddress(this.latitude, this.longitude);
        this.getNearbyPlaces(this.latitude, this.longitude);
      });
    }
  }

  markerDragEnd($event: MouseEvent) {
    this.latitude = $event.coords.lat;
    this.longitude = $event.coords.lng;
    this.getAddress(this.latitude, this.longitude);
    this.getNearbyPlaces(this.latitude, this.longitude);
  }

  private getNearbyPlaces(latitude: number, longitude: number) {
    let request = {
      radius: 500,
      location: {
        lat: latitude,
        lng: longitude
      }
    }
    let nearbyPlaces = new google.maps.places.PlacesService(this.searchElementRef.nativeElement);
    nearbyPlaces.nearbySearch(request, (results, status) => {
      if(status === 'OK') {
         const newPlaces = results.map((item) => {
          return {
            name: item.name,
            latitude: item.geometry.location.lat(),
            longitude: item.geometry.location.lng(),
          }
        });
        
        this.ngZone.run(() => {
          this.places = [...newPlaces];
        })
      }
    });
  }

  getAddress(latitude: number, longitude: number) {
    this.geoCoder.geocode(
      {
        'location': {
          lat: latitude,
          lng: longitude
        }
      },
      (results: GeocoderResult[], status: string) => {
        console.log("Current results is", results);
        if (status === 'OK') {
          if (results[0]) {
            this.address = results[0].formatted_address;            
            this.zoom = 12;
          } else {
            console.info('No results found');
          }
        } else {
          console.error('Geocoder failed due to: ' + status);
        }


      }
    )
  }

  toggleInterface() {
    this.interfaceIsHided = !this.interfaceIsHided;

  }
  addNewOption(event) {
    const newOption = {
      name: event.target[0].value,
      latitude: this.latitude,
      longitude: this.longitude
    };
    this.staticPlaces.push(newOption);
    console.log(event.target[0].value);
    this.zoom = 12;
    this.isFormSuccess = true;
    setTimeout(() => { this.isFormSuccess = false }, 2000);
  }
}
