import { Component, NgZone } from '@angular/core';
import { NavController, Platform, IonicPage, Events } from 'ionic-angular';
import { AndroidPermissions } from '@ionic-native/android-permissions';
import { AppPreferences } from '@ionic-native/app-preferences';
import { SmsProvider } from '../../providers/smsservice/smsservice';

@IonicPage({
  segment: 'home',
  name: 'home'
})

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  currentCommand: string;
  statusMessage: string;
  deviceid: any;
  devicename: string;
  constructor(public navCtrl: NavController, private ngZone: NgZone, private platform: Platform, private androidPermissions: AndroidPermissions, private appPreferences: AppPreferences, public smsservice: SmsProvider, public events: Events) {
    var self = this;
    self.events.subscribe('sms:status', (e) => {
      self.receiveStatusSMS(e);
    });
    self.events.subscribe('sms:location', (e) => {
      self.receiveSMS(e);
    });
  }

  ionViewDidLoad() {
    var self = this;
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
        self.androidPermissions.requestPermissions([self.androidPermissions.PERMISSION.RECEIVE_SMS, self.androidPermissions.PERMISSION.READ_SMS]).then(() => {
        });
      });

    });
  }

  receiveSMS(e) {
    var self = this;
    var x: any;
    console.log("Event");
    if (e) {
      x = JSON.parse(e.data.body);
    }
    self.setStatus('SMS arrived - Home');
    if (self.currentCommand == "c") {
      self.map(x.lat, x.lng);
    }
  }

  receiveStatusSMS(e) {
    var self = this;
    var x: any;
    console.log("Event");
    if (e) {
      x = JSON.parse(e.data.body);
    }
    self.setStatus('SMS arrived - Home');
    self.setStatus("Enheden er " + (x.relay == 1 ? "aktiveret" : "deaktiveret"));
  }

  map(lat, lng) {
    console.log(lat);
    console.log(lng);
    this.navCtrl.push('map', { "parentPage": this, "cmd": "track", "lat": lat, "lng": lng });
  }

  setStatus(message) {
    console.log(message);
    this.ngZone.run(() => {
      this.statusMessage = message;
    });
  }

  getStatus() {
    this.smsservice.sendCommand("s", this);
  }

  getPosition() {
    this.smsservice.sendCommand("c", this);
  }

  turnOn() {
    this.smsservice.sendCommand("1", this);
  }

  turnOff() {
    this.smsservice.sendCommand("0", this);
  }

}
