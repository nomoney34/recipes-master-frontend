import { Injectable } from '@angular/core';
import * as auth from 'firebase/auth';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { User } from '../shared/models/user';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserCredential } from '@firebase/auth-types';

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

  async signUp(email: string, password: string) {
    try {
      const result = await this.afAuth.createUserWithEmailAndPassword(email, password);
      const user = result.user;
      user?.sendEmailVerification().then(() => {
        const userRef = this.afs.doc(`users/${user!.uid}`);
        userRef.get().toPromise().then((userDoc) => {
          if (userDoc?.exists) {
            const userData = userDoc.data();
            this.SetUserData(userData, user).then(() => {
              this.snackBar.open('Signed up successfully. Verification email has been sent.', 'Close', { duration: 2000 });
            });
          } else {
            const userData_2 = {
              email: user?.email,
              username: user?.displayName,
              description: '',
              photoURL: user?.photoURL,
            };
            this.SetUserData(userData_2, user).then(() => {
              this.snackBar.open('Signed up successfully. Verification email has been sent.', 'Close', { duration: 2000 });
            });
          }
        });
      });
    } catch (error_1) {
      this.snackBar.open('The email address is already in use by another account.', 'Close', { duration: 2000 });
    }
  }

  async signIn(email: string, password: string) {
    try {
      const result = await this.afAuth
        .signInWithEmailAndPassword(email, password);
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
    } catch (error) {
      window.alert((error as any).message);
    }
  }

  async signOut() {
    await this.afAuth.signOut();
    localStorage.removeItem('user');
    this.router.navigate(['home']);
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

  signInWithGoogle() {
    const provider = new auth.GoogleAuthProvider();
    return this.signInWithPopup(provider);
  }

  // Common method to handle sign-in with a popup
  private async signInWithPopup(provider: auth.AuthProvider) {
    try {
      const result = await this.afAuth
        .signInWithPopup(provider);
      this.handleUserCredential(result);
    } catch (error) {
      this.snackBar.open('An error occurred while signing in with Google.', 'Close', {
        duration: 2000,
      });
    }
  }

  // Common method to handle UserCredential
  private async handleUserCredential(result: UserCredential) {
    const user = result.user;
    const userRef = this.afs.doc(`users/${user!.uid}`);

    try {
      const userDoc = await userRef.get().toPromise();

      if (userDoc?.exists) {
        const userData = userDoc.data();
        this.SetUserData(userData, user);
      } else {
        const userData = {
          email: user?.email,
          username: user?.displayName,
          description: '',
          photoURL: user?.photoURL,
        };
        this.SetUserData(userData, user);
      }
    } catch (error) {
      console.log(error);
    }

    this.afAuth.authState.subscribe((user) => {
      if (user) {
        this.router.navigate(['recipes']).then(() => {
          this.snackBar.open('Welcome to the world of recipes!', 'Close', {
            duration: 2000,
          });
        });
      }
    });
  }
}
