import { Injectable } from '@angular/core';
import {
  AngularFirestore,
  AngularFirestoreCollection,
} from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { Comment } from '../shared/models/comment';
import { User } from '../shared/models/user';

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
    console.log('fetched comments for user');
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

  async updateCommentsForUser(
    userId: string,
    updatedUser: Partial<User>
  ): Promise<void> {
    console.log('updating comments for user');
    const querySnapshot = await this.firestore
      .collection<Comment>('comments', (ref) =>
        ref.where('user.uid', '==', userId)
      )
      .get()
      .toPromise();

    const batch = this.firestore.firestore.batch();
    querySnapshot!.docs.forEach((doc) => {
      const comment = doc.data() as Comment;
      comment.user = { ...comment.user, ...updatedUser };
      batch.update(doc.ref, comment);
    });

    return batch.commit();
  }
}
