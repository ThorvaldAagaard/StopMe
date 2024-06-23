import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';
import { AndroidPermissions } from '@ionic-native/android-permissions';
import { AppPreferences } from '@ionic-native/app-preferences';
import { Geolocation } from '@ionic-native/geolocation';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { BLE } from '@ionic-native/ble';
import { SmsProvider } from '../providers/smsservice/smsservice';

@NgModule({
  declarations: [
    MyApp
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp
  ],
  providers: [
    StatusBar,
    SplashScreen,
    BLE,
    AndroidPermissions,
    AppPreferences,
    Geolocation,
    { provide: ErrorHandler, useClass: IonicErrorHandler },
    SmsProvider
  ]
})
export class AppModule { }
