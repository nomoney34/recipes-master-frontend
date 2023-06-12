import { Injectable } from '@angular/core';
import {
  AngularFirestore,
  AngularFirestoreDocument,
  DocumentReference,
} from '@angular/fire/compat/firestore';
import { User } from './shared/models/user';
import { AuthService } from './auth/auth.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private userDoc: AngularFirestoreDocument<User> | undefined;

  constructor(
    private afs: AngularFirestore,
    private authService: AuthService
  ) {}

  getUser(uid: string): Observable<User | undefined> {
    this.userDoc = this.afs.doc<User>(`users/${uid}`);
    return this.userDoc.valueChanges();
  }

  changeUsername(username: string): Promise<void> {
    const user = this.authService.getCurrentUser();
    if (!user) throw new Error('User not logged in');
    return this.afs.doc(`users/${user.uid}`).update({ username });
  }

  changeDescription(description: string): Promise<void> {
    const user = this.authService.getCurrentUser();
    if (!user) throw new Error('User not logged in');
    return this.afs.doc(`users/${user.uid}`).update({ description });
  }

  changeProfileImage(photoURL: string): Promise<void> {
    const user = this.authService.getCurrentUser();
    if (!user) throw new Error('User not logged in');
    return this.afs.doc(`users/${user.uid}`).update({ photoURL });
  }
}
