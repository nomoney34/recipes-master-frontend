import { Injectable } from '@angular/core';
import * as auth from 'firebase/auth';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { User } from '../shared/models/user';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  userData: any;
  constructor(
    public afs: AngularFirestore,
    public afAuth: AngularFireAuth,
    public router: Router,
    private snackBar: MatSnackBar
  ) {
    this.afAuth.authState.subscribe((user) => {
      if (user) {
        this.userData = user;
        localStorage.setItem('user', JSON.stringify(this.userData));
        JSON.parse(localStorage.getItem('user')!);
      } else {
        localStorage.setItem('user', 'null');
        JSON.parse(localStorage.getItem('user')!);
      }
    });
  }

  signUp(email: string, password: string) {
    return this.afAuth
      .createUserWithEmailAndPassword(email, password)
      .then((result) => {
        const userRef = this.afs.doc(`users/${result.user!.uid}`);
        userRef
          .get()
          .toPromise()
          .then((userDoc) => {
            const userData = userDoc!.data();
            this.SetUserData(userData, result.user).then(() => {
              this.snackBar.open('Signed up successfully', 'Close', {
                duration: 2000,
              });
            });
          });
      })
      .catch((error) => {
        window.alert(error.message);
      });
  }

  signIn(email: string, password: string) {
    return this.afAuth
      .signInWithEmailAndPassword(email, password)
      .then((result) => {
        const userRef = this.afs.doc(`users/${result.user!.uid}`);
        userRef
          .get()
          .toPromise()
          .then((userDoc) => {
            const userData = userDoc!.data();
            this.SetUserData(userData, result.user);
          });

        this.afAuth.authState.subscribe((user) => {
          if (user) {
            this.router.navigate(['recipes']).then(() => {
              this.snackBar.open('Welcome to the world of recipes!', 'Close', {
                duration: 2000,
              });
            });
          }
        });
      })
      .catch((error) => {
        window.alert(error.message);
      });
  }

  signOut() {
    return this.afAuth.signOut().then(() => {
      localStorage.removeItem('user');
      this.router.navigate(['home']);
    });
  }

  SetUserData(userData: any, user: any) {
    const userRef = this.afs.doc(`users/${user.uid}`);
    const updatedUserData: User = {
      uid: user.uid,
      email: user.email,
      username: userData.username
        ? userData.username
        : this.extractUsernameFromEmail(user.email),
      description: userData.description ? userData.description : '',
      photoURL: userData.photoURL ? userData.photoURL : '',
    };

    return userRef.set(updatedUserData, { merge: true });
  }

  getCurrentUser() {
    return JSON.parse(localStorage.getItem('user')!);
  }

  getCurrentUserId() {
    const userData = JSON.parse(localStorage.getItem('user')!);
    if (userData) {
      return userData.uid;
    }
    return null;
  }

  isLoggedIn() {
    return this.getCurrentUserId() !== null;
  }

  private extractUsernameFromEmail(email: string) {
    return email.split('@')[0];
  }
}
