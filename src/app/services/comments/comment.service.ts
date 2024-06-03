import { Injectable } from '@angular/core';
import {
  AngularFirestore,
  AngularFirestoreCollection,
} from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { Comment } from '../../shared/models/comment';
import { User } from '../../shared/models/user';
import { firstValueFrom } from 'rxjs';

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
    const querySnapshot = await firstValueFrom(this.firestore
      .collection<Comment>('comments', (ref) =>
        ref.where('user.uid', '==', userId)
      )
      .get());


    const batch = this.firestore.firestore.batch();
    querySnapshot!.docs.forEach((doc) => {
      const comment = doc.data() as Comment;
      comment.user = { ...comment.user, ...updatedUser };
      batch.update(doc.ref, comment);
    });

    return batch.commit();
  }

  async toggleUpvoteComment(commentId: string, userId: string): Promise<void> {
    const commentRef = this.firestore.doc<Comment>(`comments/${commentId}`);
    const commentSnapshot = await firstValueFrom(commentRef.get());
    const comment = commentSnapshot!.data() as Comment;

    if (comment) {
      const { upvotes, downvotes } = comment;

      if (upvotes.includes(userId)) {
        const index = upvotes.indexOf(userId);
        upvotes.splice(index, 1);
      } else {
        const downvoteIndex = downvotes.indexOf(userId);
        if (downvoteIndex !== -1) {
          downvotes.splice(downvoteIndex, 1);
        }
        upvotes.push(userId);
      }

      return commentRef.update({ upvotes, downvotes });
    }
  }

  async toggleDownvoteComment(
    commentId: string,
    userId: string
  ): Promise<void> {
    const commentRef = this.firestore.doc<Comment>(`comments/${commentId}`);
    const commentSnapshot = await firstValueFrom(commentRef.get());
    const comment = commentSnapshot!.data() as Comment;

    if (comment) {
      const { upvotes, downvotes } = comment;

      if (downvotes.includes(userId)) {
        const index = downvotes.indexOf(userId);
        downvotes.splice(index, 1);
      } else {
        const upvoteIndex = upvotes.indexOf(userId);
        if (upvoteIndex !== -1) {
          upvotes.splice(upvoteIndex, 1);
        }
        downvotes.push(userId);
      }

      return commentRef.update({ upvotes, downvotes });
    }
  }

  async addReply(commentId: string, reply: Comment) {
    const replyRef = this.commentCollection?.doc();
    if (replyRef) {
      const replyId = replyRef.ref.id;
      reply.id = replyId;
      await replyRef.set(reply);

      const commentRef = this.commentCollection?.doc(commentId);
      if (commentRef) {
        const commentSnapshot = await firstValueFrom(commentRef.get());
        const comment = commentSnapshot!.data() as Comment;
        if (comment) {
          const { replies } = comment;
          replies.push(replyId);
          return commentRef.update({ replies });
        }
      }
    }
  }
}
