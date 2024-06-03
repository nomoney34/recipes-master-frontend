import { Injectable } from '@angular/core';
import {
  AngularFirestore,
  AngularFirestoreDocument,
  DocumentReference,
} from '@angular/fire/compat/firestore';
import { User } from '../../shared/models/user';
import { AuthService } from '../../auth/auth.service';
import { Observable, map } from 'rxjs';
import { CommentService } from '../comments/comment.service';
import { RecipeServiceService } from '../recipes/recipe-service.service';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private userDoc: AngularFirestoreDocument<User> | undefined;

  constructor(
    private afs: AngularFirestore,
    private authService: AuthService,
    private commentService: CommentService,
    private recipeService: RecipeServiceService
  ) {}

  getUser(uid: string): Observable<User | undefined> {
    this.userDoc = this.afs.doc<User>(`users/${uid}`);
    return this.userDoc.valueChanges();
  }

  async updateUsername(username: string): Promise<void> {
    const user = this.authService.getCurrentUser();
    if (!user) throw new Error('User not logged in');
    await this.afs
      .doc(`users/${user.uid}`)
      .update({ username });
    this.commentService.updateCommentsForUser(user.uid, { username });
    this.recipeService.updateRecipesForUser(user.uid, { username });
  }

  async updateDescription(description: string): Promise<void> {
    const user = this.authService.getCurrentUser();
    if (!user) throw new Error('User not logged in');
    await this.afs
      .doc(`users/${user.uid}`)
      .update({ description });
    this.commentService.updateCommentsForUser(user.uid, { description });
    this.recipeService.updateRecipesForUser(user.uid, { description });
  }

  async updateProfileImage(photoURL: string): Promise<void> {
    const user = this.authService.getCurrentUser();
    if (!user) throw new Error('User not logged in');
    await this.afs
      .doc(`users/${user.uid}`)
      .update({ photoURL });
    this.commentService.updateCommentsForUser(user.uid, { photoURL });
    this.recipeService.updateRecipesForUser(user.uid, { photoURL });
  }

  getUserByUsername(username: string): Observable<User | undefined> {
    return this.afs
      .collection<User>('users')
      .valueChanges()
      .pipe(
        map((users: User[]) => users.find((user) => user.username === username))
      );
  }
}
