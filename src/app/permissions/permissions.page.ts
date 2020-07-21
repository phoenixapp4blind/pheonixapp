import { Component, OnInit } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';
import { Platform } from '@ionic/angular';
import { SpeechRecognition } from '@ionic-native/speech-recognition/ngx';
import { Router } from '@angular/router';

@Component({
  selector: 'app-permissions',
  templateUrl: './permissions.page.html',
  styleUrls: ['./permissions.page.scss'],
})
export class PermissionsPage implements OnInit {

  constructor(private router: Router, private speechRecognition: SpeechRecognition, private plt: Platform, private cd: ChangeDetectorRef) {}

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
  ngOnInit() {
    this.getpermission();
  }

}
