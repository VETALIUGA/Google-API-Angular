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
  useApiSelect = false;
  places = [
    {
      name: 'Mir',
      latitude: 49.232552399999996,
      longitude: 28.4744925
    },
    {
      name: 'Politeh',
      latitude: 32,
      longitude: 41
    }
  ];


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
    const foundedOption = this.places.find(item => item.name === currentOption);
    this.longitude = foundedOption.longitude;
    this.latitude = foundedOption.latitude;
    console.log(event.target.value);
  }

  changeCurInterface() {
    this.useApiSelect = !this.useApiSelect;
  }

  addNewOption(event) {
    const newOption = {
      name: event.target[0].value,
      latitude: this.latitude,
      longitude: this.longitude
    };
    this.places.push(newOption);
    console.log(event.target[0].value);
    this.zoom = 12;
  }

  private setCurrentLocation() {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        this.latitude = position.coords.latitude;
        this.longitude = position.coords.longitude;
        this.zoom = 8;
        this.getAddress(this.latitude, this.longitude);
      });
    }
  }

  markerDragEnd($event: MouseEvent) {
    console.log($event);
    this.latitude = $event.coords.lat;
    this.longitude = $event.coords.lng;
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
        console.log(results);
        console.log(status);
        if (status === 'OK') {
          if (results[0]) {
            this.zoom = 12;
            this.address = results[0].formatted_address;
          } else {
            console.info('No results found');
          }
        } else {
          console.error('Geocoder failed due to: ' + status);
        }


      }
    )
  }
}
