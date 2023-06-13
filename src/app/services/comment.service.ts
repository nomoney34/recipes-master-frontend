import { Injectable } from '@angular/core';
import {
  AngularFirestore,
  AngularFirestoreCollection,
} from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { Comment } from '../shared/models/comment';

@Injectable({
  providedIn: 'root',
})
export class CommentService {
  private commentCollection: AngularFirestoreCollection<Comment> | undefined;

  constructor(private firestore: AngularFirestore) {
    this.commentCollection = this.firestore.collection<Comment>('comments');
  }

  getCommentsForRecipe(recipeId: string): Observable<Comment[]> {
    return this.firestore
      .collection<Comment>('comments', (ref) =>
        ref.where('recipe.id', '==', recipeId)
      )
      .valueChanges();
  }

  getCommentsForUser(userId: string): Observable<Comment[]> {
    return this.firestore
      .collection<Comment>('comments', (ref) =>
        ref.where('user.uid', '==', userId)
      )
      .valueChanges();
  }

  async addComment(comment: Comment) {
    const commentRef = this.commentCollection?.doc();
    if (commentRef) {
      const commentId = commentRef.ref.id;
      comment.id = commentId;
      await commentRef.set(comment);
    }
  }

  async deleteComment(commentId: string) {
    this.firestore.doc<Comment>(`comments/${commentId}`).delete();
  }

  async updateComment(commentId: string, comment: Comment) {
    this.firestore.doc<Comment>(`comments/${commentId}`).update(comment);
  }
}
