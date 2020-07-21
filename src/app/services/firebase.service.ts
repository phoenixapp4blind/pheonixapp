import { Injectable } from '@angular/core';
import { AngularFirestore } from 'angularfire2/firestore';

import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  items: any;

  constructor(public firestore: AngularFirestore) { }

  read_courses(collectionName) {   
    return this.firestore.collection(collectionName).snapshotChanges();
  }

}
