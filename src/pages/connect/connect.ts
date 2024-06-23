import { Component, NgZone } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform, Events } from 'ionic-angular';
import { FormBuilder, Validators } from '@angular/forms';
import { AndroidPermissions } from '@ionic-native/android-permissions';
import { AppPreferences } from '@ionic-native/app-preferences';
import { SmsProvider } from '../../providers/smsservice/smsservice';


@IonicPage({
  segment: 'connect',
  name: 'connect'
})

@Component({
  selector: 'page-connect',
  templateUrl: 'connect.html',
})
export class ConnectPage {
  public connectForm;
  statusMessage: string;
  submitAttempt: boolean = false;
  deviceid: string;
  devicename: string;
  constructor(public navCtrl: NavController, public navParams: NavParams, private ngZone: NgZone, private platform: Platform, public formBuilder: FormBuilder, private androidPermissions: AndroidPermissions,
    private appPreferences: AppPreferences, public smsservice: SmsProvider, public events: Events) {
    var self = this;
    let device = navParams.get('device');

    self.events.subscribe('sms:connect', (e) => {
      self.receiveConnectSMS(e);
    });
    self.events.subscribe('sms:disconnect', (e) => {
      self.receiveDisconnectSMS(e);
    });
    this.connectForm = formBuilder.group({
      mobile: ['', Validators.compose([Validators.required])],
      device: ['', Validators.compose([Validators.required])],
    })
    self.connectForm.controls.device.setValue(device);
  }

  elementChanged(input) {
    let field = input.ngControl.name;
    this[field + "Changed"] = true;
  }

  ionViewDidLoad() {
    var self = this;
    self.platform.ready().then(() => {
      self.appPreferences.fetch('deviceid').then((deviceid) => {
        self.connectForm.controls.mobile.setValue(deviceid);
        self.deviceid = deviceid;
      });
      if (!self.connectForm.value.device) {
        self.appPreferences.fetch('devicename').then((deviceid) => {
          self.connectForm.controls.device.setValue(deviceid);
        });
      }
      self.androidPermissions.checkPermission(self.androidPermissions.PERMISSION.SMS).then(
        success => console.log('Permission granted'),
        err => self.androidPermissions.requestPermission(self.androidPermissions.PERMISSION.SMS)
      ).then(() => {
        self.androidPermissions.requestPermissions([self.androidPermissions.PERMISSION.RECEIVE_SMS, self.androidPermissions.PERMISSION.READ_SMS]).then(() => {
        });
      });
    });
  }

  receiveConnectSMS(e) {
    var self = this;
    self.setStatus('SMS arrived');
    self.appPreferences.store('deviceid', this.connectForm.value.mobile);
    self.appPreferences.store('devicename', this.connectForm.value.device);
    this.navCtrl.push('home', { "parentPage": this, "device": this.connectForm.value.mobile });
  }

  receiveDisconnectSMS(e) {
    var self = this;
    self.setStatus('SMS arrived');
    self.appPreferences.remove('deviceid');
    this.navCtrl.pop();
  }

  setStatus(message) {
    console.log(message);
    this.ngZone.run(() => {
      this.statusMessage = message;
    });
  }

  connect() {

    this.submitAttempt = true;

    if (!this.connectForm.valid) {
      console.log(this.connectForm.value);
      this.setStatus("Fejl i input");
    } else {
      this.deviceid = this.connectForm.value.mobile;
      this.devicename = this.connectForm.value.device;
      this.smsservice.sendCommand("i", this);
    }
  }

  disconnect() {

    this.submitAttempt = true;

    if (!this.connectForm.valid) {
      console.log(this.connectForm.value);
      this.setStatus("Fejl i input");
    } else {
      this.deviceid = this.connectForm.value.mobile;
      this.devicename = this.connectForm.value.device;
      this.smsservice.sendCommand("u", this);
    }
  }
}
