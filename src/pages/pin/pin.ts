import { Component, NgZone } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { AppPreferences } from '@ionic-native/app-preferences';
import { isNumber } from "ionic-angular/util/util";

@IonicPage({
  segment: 'pin',
  name: 'pin'
})
@Component({
  selector: 'page-pin',
  templateUrl: 'pin.html',
})
export class PinPage {
  passcode: string = '';
  pin: string = '';
  codeArr: Array<number> = [];
  passcodeWrong: boolean = false;
  statusMessage: string;
  constructor(public navCtrl: NavController, public navParams: NavParams, private appPreferences: AppPreferences, private ngZone: NgZone) {
  }

  ionViewDidLoad() {
    var self = this;
    this.appPreferences.fetch('pin').then((res) => {
      //console.log(res);
      self.pin = res;
    });
  }

  delete() {
    if (this.passcode.length > 0) {
      this.passcode = this.passcode.substring(0, this.passcode.length - 1);
    }
  }

  add(value) {
    this.passcodeWrong = false;

    if (this.passcode.length < 4) {
      this.passcode = this.passcode + value;
      if (this.passcode.length == 4) {
        if (this.pin == '') {
          // Store pin code
          this.appPreferences.store('pin', this.passcode)
          this.navCtrl.setRoot('tabs', { tabIndex: 2 });
        } else {
          if (this.pin == this.passcode) {
            this.appPreferences.fetch('deviceid').then((deviceid) => {
              console.log("deviceid: " + deviceid);
              if (deviceid == '') {
                console.log("No deviceid");
                // go to settings
                this.navCtrl.setRoot('tabs', { tabIndex: 2 });
              } else {
                this.navCtrl.setRoot('tabs', { tabIndex: 0 });
              }
            });
          } else {
            this.passcodeWrong = true;
            this.setStatus("PIN-kode forkert")
            this.restoreClick();
          }
        }
      }
    }
  }

  isNum(num: any): boolean {
    if (isNumber(num)) {
      return num <= 9 || num >= 0;
    } else {
      return false
    }
  }

  restoreClick() {
    this.passcode = '';
  }

  setStatus(message) {
    console.log(message);
    this.ngZone.run(() => {
      this.statusMessage = message;
    });
  }

}
