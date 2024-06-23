import { Component, NgZone } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController } from 'ionic-angular';
import { BLE } from '@ionic-native/ble';

@IonicPage({
  segment: 'settings',
  name: 'settings'
})
@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html',
})
export class SettingsPage {
  devices: any[] = [];
  statusMessage: string;

  constructor(public navCtrl: NavController, public navParams: NavParams, private toastCtrl: ToastController, private ble: BLE, private ngZone: NgZone) {
  }

  search() {
    this.scan();
  }

  ionViewDidLoad() {
    console.log('ionViewDidEnter');
  }

  scan() {
    this.setStatus('Søger efter Bluetooth LE enheder');
    this.devices = [];  // clear list

    this.ble.scan([], 5).subscribe(
      device => this.onDeviceDiscovered(device),
      error => this.scanError(error)
    );

    setTimeout(this.setStatus.bind(this), 5000, 'Søgning gennemført');
  }

  onDeviceDiscovered(device) {
    console.log('Fundet: ' + JSON.stringify(device, null, 2));
    if (device.name)
    this.ngZone.run(() => {
      this.devices.push(device);
    });
  }

  // If location permission is denied, you'll end up here
  scanError(error) {
    this.setStatus('Error ' + error);
    let toast = this.toastCtrl.create({
      message: 'Error scanning for Bluetooth low energy devices',
      position: 'middle',
      duration: 5000
    });
    toast.present();
  }

  setStatus(message) {
    console.log(message);
    this.ngZone.run(() => {
      this.statusMessage = message;
    });
  }

  deviceSelected(device) {
    this.navCtrl.push('detail', {
      device: device
    });
  }

  deviceConnect(device) {
    this.navCtrl.push('connect', {
      device: device.name
    });
  }  

  manualConnect() {
    this.navCtrl.push('connect', {
    });
  }  
  
}

