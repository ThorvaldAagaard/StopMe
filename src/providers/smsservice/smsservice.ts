import { Injectable } from '@angular/core';
import { Events } from 'ionic-angular';
import { AppPreferences } from '@ionic-native/app-preferences';

declare var SMS;

@Injectable()
export class SmsProvider {

  watching: boolean = false;
  deviceid: any;
  constructor(private appPreferences: AppPreferences, public events: Events) {
    var self = this;
    self.appPreferences.fetch('deviceid').then((deviceid) => {
      self.deviceid = deviceid
    });

    if (SMS) SMS.enableIntercept(status, function (e) {
      console.log('enableIntercept: ' + e);
    }, function (e) {
      console.log('Error enableIntercept: ' + e);
    });

    document.addEventListener('onSMSArrive', function (e: any) {
      console.log("onSMSArrive");
      console.log(e);
      if (e.data.address == "+45" + self.deviceid) {
        var response = JSON.parse(e.data.body);
        self.events.publish('sms:' + response.response, e);
        if (self.watching) {
          self.stopWatch();
        }
            
      } else {
        console.log('Ignoring SMS')
        console.log(e);
      }
    });
  }

  setDevice(deviceid) {
    this.deviceid = deviceid;
  }

  sendCommand(cmd, caller) {
    if (!this.watching) {
      this.startWatch(caller);
    }
    this.setDevice(caller.deviceid);
    
    SMS.sendSMS(caller.deviceid, cmd + " " +caller.devicename, function (e) {
      caller.setStatus('SMS sendt til ' + caller.deviceid + "(" + cmd + "): " + e);
    }, function (e) {
      caller.setStatus('Fejl ved afsendelse af SMS ' + e);
    });
  }

  private startWatch(caller) {
    var self = this;
    if (!self.watching) {
      if (SMS) SMS.startWatch(function (e) {
        self.watching = true;
        caller.setStatus('SMS monitor startet ' + e);
      }, function (e) {
        self.watching = false;
        caller.setStatus('Fejl ved SMS monitor start ' + e);
      });
    }
  }

  private stopWatch() {
    var self = this;
    if (self.watching) {
      if (SMS) SMS.stopWatch(function (e) {
        self.watching = false;
        console.log('SMS monitor stoppet ' + e);
      }, function (e) {
        console.log('Fejl ved SMS monitor stop ' + e);
      });
    }
  }

}
