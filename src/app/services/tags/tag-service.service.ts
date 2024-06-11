import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Injectable({
  providedIn: 'root'
})
export class TagService {
  constructor(private firestore: AngularFirestore) {}

  getTags() {
    return this.firestore.collection('tags').valueChanges();
  }

  addTag(tag: string) {
    return this.firestore.collection('tags').doc(tag).set({ name: tag });
  }
}
