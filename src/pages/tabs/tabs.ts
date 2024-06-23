import { Component } from '@angular/core';
import { IonicPage, NavParams } from 'ionic-angular';

@IonicPage({
  segment: 'tabs',
  name: 'tabs'
})
@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {

  tab1Root = 'home';
  tab2Root = 'map';
  tab3Root = 'settings';
  mySelectedIndex: number = 0;
  constructor(private navParams: NavParams) {
    this.mySelectedIndex = this.navParams.data.tabIndex || 0;

  }
}
