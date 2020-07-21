import { Component, OnInit, OnDestroy } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';
import { Platform } from '@ionic/angular';
import { Router } from '@angular/router';
import { SpeechRecognition } from '@ionic-native/speech-recognition/ngx';
import { TextToSpeech } from '@ionic-native/text-to-speech/ngx';
import { NativeAudio } from '@ionic-native/native-audio/ngx';
import { Media, MediaObject } from '@ionic-native/media/ngx';
import { File } from '@ionic-native/file/ngx';
import { FirebaseService } from '../services/firebase.service';

@Component({
  selector: 'app-courses',
  templateUrl: './courses.page.html',
  styleUrls: ['./courses.page.scss'],
})
export class CoursesPage implements OnInit, OnDestroy {
  working:boolean = false;
  matches: any;
  yesorno: any;
  CoursesList = [];
  Course = [];
  waitCheck: boolean = false;//for checking the course list
  audioCheck: boolean = false;//for checking the course list
  doubleLock: boolean = false;//stop double click from doing default action
  pausedVideo: boolean = false;// pause or play during playback
  currentIndex=0;
  currentUrl:any;
  playVideo:any;
  fileToPlay:any;
  constructor(private router: Router, private speechRecognition: SpeechRecognition, private plt: Platform, private cd: ChangeDetectorRef, private tts: TextToSpeech, private nativeAudio: NativeAudio, private media: Media, private firebase: FirebaseService, private file: File) { }
  ngOnInit() {
    this.fileToPlay = new Audio();
    this.working = true;
    this.introFunction('Welcome to The Phenix App, Let me assist you in selecting a course. You can doubletap anytime to stop')
    .then(() => {
      this.introFunction('Please tap once to listout all the courses available. While listing tap again once to select the course')
      .then(()=>{
        this.working = false;
        this.waitCheck=true;
      })
      .catch((reason: any) => console.log(reason));
    });
  }
  ngOnDestroy(){
    this.waitCheck=false;
    this.audioCheck=false;
    this.doubleLock=false; 
    this.pausedVideo=false;
    this.fileToPlay.pause(); 
    this.speechRecognition.stopListening()
    this.tts.stop();
  }
  introFunction(toSpeak){
    return this.tts.speak(toSpeak); 
  }
  readCoursesList(){
    var delayInMilliseconds = 1000; //1 second
    this.firebase.read_courses('Courses').subscribe(data => {
      this.CoursesList = data.map(e => {
        return {
          id: e.payload.doc.id,
        };
      })
      let stringVal='';
      this.CoursesList.forEach(element => {
        stringVal+=(element['id']+', ')
      });
      this.introFunction(stringVal);
    })
  }
  firebaseDataGet(){
    this.doubleLock=false;
    this.currentIndex=0;
    this.firebase.read_courses(this.matches[0]).subscribe(data => {
      this.Course = data.map(e => {
        return {
          id: e.payload.doc.id,
          Name: e.payload.doc.data()['SlNo'],
          Url: e.payload.doc.data()['token'],
        };
      })
      this.working = true;
      this.introFunction('If you want to play or pause the audio anytime during the playback just tap').then(()=>{
        this.currentUrl=this.Course[this.currentIndex]['Url'];
        this.playVideo=true;
        this.playAudio(this.Course[this.currentIndex]['Url']);
      });
    });      
  }
  playAudio(url){
    this.fileToPlay.src = url;
    this.fileToPlay.load();
    this.fileToPlay.play();
    this.fileToPlay.loop = false;
  }
  recogniseAudio(){
    let options = {
      language: 'en-US'
    }
    this.speechRecognition.startListening().subscribe(matches => {
      this.matches = matches;
      this.doubleLock=true;
      this.cd.detectChanges();
      this.introFunction("You Said"+this.matches[0]+"click once and say yes or no");
    });
  }
  recogniseyesorno(){
    let options = {
      language: 'en-US'
    }
    this.speechRecognition.startListening().subscribe(matches => {
      this.yesorno = matches;
      this.cd.detectChanges();
      if(this.yesorno[0].toLowerCase()=="yes"){
        this.firebaseDataGet();
        this.doubleLock=false;
      }
      else{
        this.introFunction("Please say the course name again").then(()=>{
          this.recogniseAudio();
        });
      }
    });
  }
  recogniseAudioMediaPlay(){
    let options = {
      language: 'en-US'
    }
    this.speechRecognition.startListening().subscribe(matches => {
      this.matches = matches;
      this.cd.detectChanges();
      if(this.matches[0].toLowerCase()=="play"){
        this.pausedVideo=false;
        this.playVideo=true;
        this.fileToPlay.play(); 
      }else if(this.matches[0].toLowerCase()=="next"){
        if(this.currentIndex==this.Course.length){
        }else{
          this.currentIndex+=1;
          this.currentUrl=this.Course[this.currentIndex]['Url'];
          this.playVideo=true;
          this.playAudio(this.Course[this.currentIndex]['Url']);
        }
      }else if(this.matches[0].toLowerCase()=="previous"){
        if(this.currentIndex==0){
        }else{
          this.currentIndex-=1;
          this.currentUrl=this.Course[this.currentIndex]['Url'];
          this.playVideo=true;
          this.playAudio(this.Course[this.currentIndex]['Url']);
        }
      }else if(this.matches[0].toLowerCase()=="stop"){
        this.doubleclick();
      }
    });
  }
  doubleclick(){
    this.router.navigate(['']);
    this.fileToPlay.pause(); 
    this.speechRecognition.stopListening()
    this.tts.stop();
  }
  clicked() {
    this.working = true; 
    if(this.waitCheck){
      this.readCoursesList();
      this.waitCheck = false;
      this.working = false;
      this.audioCheck = true;
    }
    if(this.audioCheck){
      this.introFunction('Please say the course name after the beep sound')
      .then(() => {
        this.recogniseAudio();
        this.working = false;
        this.audioCheck = false;
      });
    }
    if(this.doubleLock){
      this.recogniseyesorno();
    }
    if(this.pausedVideo){
      this.introFunction("Plese Give the instruction after the beep. What do you want to do, U can use Next, Previous, Play, Stop").then(()=>{
        this.recogniseAudioMediaPlay();
      })
    }
    if(this.playVideo){
      this.playVideo=false;
      this.fileToPlay.pause(); 
      this.pausedVideo=true;
    }
  }
}
