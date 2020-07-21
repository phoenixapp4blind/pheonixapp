import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TextToSpeech } from '@ionic-native/text-to-speech/ngx';
import { Platform } from '@ionic/angular';
import { ChangeDetectorRef } from '@angular/core';
import { SpeechRecognition } from '@ionic-native/speech-recognition/ngx';
import { WifiWizard2 } from '@ionic-native/wifi-wizard-2/ngx';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  
  constructor(private wifiWizard2: WifiWizard2, private router: Router,private tts: TextToSpeech, private speechRecognition: SpeechRecognition, private plt: Platform, private cd: ChangeDetectorRef) {}

  ngOnInit(){
    this.wifiWizard2.enableWifi()
    this.tts.speak("Double Click to Start and Stop the App");
  }
  
  doubleclick(){
    this.getpermission();
    this.wifiPermission();
  }

  wifiPermission(){
    if(!this.wifiWizard2.isWifiEnabled()){
      this.wifiWizard2.requestPermission();
    }
  }
  getpermission(){
    this.speechRecognition.hasPermission()
    .then((hasPermission: boolean) => {
      if (!hasPermission) {
        this.speechRecognition.requestPermission().then(()=>{
          this.router.navigate(['/permission']);
        });
      }
      else{
        this.router.navigate(['/courses']);
      }
    });
  }
  
}
