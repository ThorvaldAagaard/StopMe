import { Component, ViewChild, ElementRef, NgZone } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform, AlertController, Events } from 'ionic-angular';
import { Geolocation } from '@ionic-native/geolocation';
import { AndroidPermissions } from '@ionic-native/android-permissions';
import { SmsProvider } from '../../providers/smsservice/smsservice';
import { AppPreferences } from '@ionic-native/app-preferences';

declare var google;

@IonicPage({
  segment: 'map',
  name: 'map'
})

@Component({
  selector: 'page-map',
  templateUrl: 'map.html',
})

export class MapPage {
  @ViewChild('map', { read: ElementRef }) element: ElementRef;
  map: any;
  marker: any;
  search: boolean = true;
  lat: number = 0;
  lng: number = 0;
  cmd: string;
  mapLoaded: Boolean = false;
  statusMessage: string;
  deviceid: string;
  devicename: string;
  constructor(public navCtrl: NavController, public navParams: NavParams, public platform: Platform, private ngZone: NgZone, public alertCtrl: AlertController,
    public geolocation: Geolocation, private androidPermissions: AndroidPermissions, private appPreferences: AppPreferences, public smsservice: SmsProvider, public events: Events) {
    var self = this;
    this.cmd = navParams.get('cmd');
    this.lat = navParams.get('lat');
    this.lng = navParams.get('lng');
    this.events.subscribe('sms:location', (e) => {
      self.receiveSMS(e);
    });
  }

  ionViewDidLoad() {
    var self = this;
    self.platform.ready().then(() => {
      if (self.mapLoaded) {
        self.updateUserPosition(this.cmd);
      } else {
        self.checkPermission();
      }
    });
  }

  checkPermission() {
    console.log("checkPermission");
    var self = this;
    this.platform.ready().then(() => {
      this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.ACCESS_COARSE_LOCATION).then(
        success => console.log('Permission granted'),
        err => {
          console.log('Permission not granted:' + err),
            this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.ACCESS_COARSE_LOCATION)
        }
      ).then(() => {
        console.log("checkPermission request");
        this.androidPermissions.requestPermissions([this.androidPermissions.PERMISSION.ACCESS_COARSE_LOCATION]).then(() => {
          self.findPositionAndLoadMap();
          self.platform.ready().then(() => {

            self.appPreferences.fetch('deviceid').then((deviceid) => {
              self.deviceid = deviceid
            });
            self.appPreferences.fetch('devicename').then((devicename) => {
              self.devicename = devicename
            });

            this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.SMS).then(
              success => console.log('Permission granted'),
              err => this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.SMS)
            ).then(() => {

              console.log("Listen - MAP");
              self.androidPermissions.requestPermissions([self.androidPermissions.PERMISSION.RECEIVE_SMS, self.androidPermissions.PERMISSION.READ_SMS]).then(() => {
              });
            });

          });
        });

      });
    });

  }


  findPositionAndLoadMap() {
    console.log("findPositionAndLoadMap");
    var self = this;
    var positionOk = false;
    if (self.cmd == "track") {
      self.loadMap();
    } else {
      self.getCurrentPosition().then(resp => {
        self.lat = resp.coords.latitude;
        self.lng = resp.coords.longitude;
        positionOk = true;
      }).catch((error) => {
        console.log('Error getting location', error);
        self.showPositionError(error);
        self.findPositionAndLoadMap();
      }).then(() => {
        if (positionOk) {
          self.loadMap();
        }
      });
    }
  }

  getCurrentPosition() {
    let optionsGPS = { timeout: 10000, enableHighAccuracy: true, maximumAge: 60000 };
    return this.geolocation.getCurrentPosition(optionsGPS);
  }

  loadMap() {
    var self = this;
    self.map = new google.maps.Map(self.element.nativeElement, {
      zoom: 15,
      center: { lat: self.lat, lng: self.lng },
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      styles: [{ "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#e9e9e9" }, { "lightness": 17 }] }, { "featureType": "landscape", "elementType": "geometry", "stylers": [{ "color": "#f5f5f5" }, { "lightness": 20 }] }, { "featureType": "road.highway", "elementType": "geometry.fill", "stylers": [{ "color": "#ffffff" }, { "lightness": 17 }] }, { "featureType": "road.highway", "elementType": "geometry.stroke", "stylers": [{ "color": "#ffffff" }, { "lightness": 29 }, { "weight": 0.2 }] }, { "featureType": "road.arterial", "elementType": "geometry", "stylers": [{ "color": "#ffffff" }, { "lightness": 18 }] }, { "featureType": "road.local", "elementType": "geometry", "stylers": [{ "color": "#ffffff" }, { "lightness": 16 }] }, { "featureType": "poi", "elementType": "geometry", "stylers": [{ "color": "#f5f5f5" }, { "lightness": 21 }] }, { "featureType": "poi.park", "elementType": "geometry", "stylers": [{ "color": "#dedede" }, { "lightness": 21 }] }, { "elementType": "labels.text.stroke", "stylers": [{ "visibility": "on" }, { "color": "#ffffff" }, { "lightness": 16 }] }, { "elementType": "labels.text.fill", "stylers": [{ "saturation": 36 }, { "color": "#333333" }, { "lightness": 40 }] }, { "elementType": "labels.icon", "stylers": [{ "visibility": "off" }] }, { "featureType": "transit", "elementType": "geometry", "stylers": [{ "color": "#f2f2f2" }, { "lightness": 19 }] }, { "featureType": "administrative", "elementType": "geometry.fill", "stylers": [{ "color": "#fefefe" }, { "lightness": 20 }] }, { "featureType": "administrative", "elementType": "geometry.stroke", "stylers": [{ "color": "#fefefe" }, { "lightness": 17 }, { "weight": 1.2 }] }],
      disableDoubleClickZoom: false,
      disableDefaultUI: false,
      zoomControl: true,
      scaleControl: true,
      mapTypeControl: true,
      streetViewControl: true,
      rotateControl: true,
      fullscreenControl: true
    });

    self.search = false;
    self.mapLoaded = true;
    self.updateUserPosition(self.cmd);
  }

  updateUserPosition(cmd) {
    var self = this;
    let location = new google.maps.LatLng(self.lat, self.lng);

    if (self.marker) {
      self.marker.setPosition(location);
    } else {
      self.marker = new google.maps.Marker({
        position: location,
        icon: (cmd == "track" ? "http://maps.google.com/mapfiles/ms/micons/truck.png" : "http://maps.google.com/mapfiles/ms/micons/man.png"),
        map: self.map
      });
      self.marker.addListener('click', function () {
        console.log('User clicked marker: ' + self.marker.getPosition());
      });
    }
    self.map.setCenter(location);
  }

  setStatus(message) {
    console.log(message);
    this.ngZone.run(() => {
      this.statusMessage = message;
    });
  }

  showPositionError(error) {
    let alert = this.alertCtrl.create({
      title: "Getting location",
      message: "Error getting location: " + error.message,
      cssClass: 'alertText',
      buttons: [
        {
          cssClass: 'alertButtonNormal',
          text: "Ok",
          role: 'cancel'
        }
      ]
    });
    alert.present();
    setTimeout(() => {
      alert.dismiss();
    }, 5000);
  }

  getPosition() {
    this.smsservice.sendCommand("c", this);
  }

  receiveSMS(e) {
    var self = this;
    let x = JSON.parse(e.data.body);
    self.lat = x.lat;
    self.lng = x.lng;
    this.updateUserPosition('track');
  }
}
