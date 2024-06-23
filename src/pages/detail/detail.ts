import { Component, NgZone } from '@angular/core';
import { NavController, NavParams, IonicPage } from 'ionic-angular';
import { ToastController } from 'ionic-angular';
import { BLE } from '@ionic-native/ble';

@IonicPage({
  segment: 'detail',
  name: 'detail'
})

@Component({
  selector: 'page-detail',
  templateUrl: 'detail.html',
})
export class DetailPage {

  peripheral: any = {};
  statusMessage: string;

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    private ble: BLE,
    private toastCtrl: ToastController,
    private ngZone: NgZone) {

    let device = navParams.get('device');

    this.setStatus('Forbinder til ' + device.name || device.id);

    this.ble.connect(device.id).subscribe(
      peripheral => this.onConnected(peripheral),
      peripheral => this.onDeviceDisconnected(peripheral)
    );

  }

  onConnected(peripheral) {
    this.ngZone.run(() => {
      this.setStatus('');
      this.peripheral = peripheral;
    });
  }

  onDeviceDisconnected(peripheral) {
    let toast = this.toastCtrl.create({
      message: 'The peripheral unexpectedly disconnected',
      duration: 3000,
      position: 'middle'
    });
    toast.present();
  }

  // Disconnect peripheral when leaving the page
  ionViewWillLeave() {
    console.log('Disconnecting Bluetooth');
    this.ble.disconnect(this.peripheral.id).then(
      () => console.log('Afbrudt ' + JSON.stringify(this.peripheral)),
      () => console.log('FEJL afbrydelse ' + JSON.stringify(this.peripheral))
    )
  }

  setStatus(message) {
    console.log(message);
    this.ngZone.run(() => {
      this.statusMessage = message;
    });
  }

}