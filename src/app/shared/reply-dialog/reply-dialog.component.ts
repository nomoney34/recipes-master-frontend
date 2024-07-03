import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommentService } from 'src/app/services/comments/comment.service';
import { Recipe } from '../models/recipe';
import { Comment } from '../models/comment';
import { User } from '../models/user';

@Component({
  selector: 'app-reply-dialog',
  templateUrl: './reply-dialog.component.html',
  styleUrls: ['./reply-dialog.component.sass'],
})
export class ReplyDialogComponent {
  replyContent: string = '';

  constructor(
    public dialogRef: MatDialogRef<ReplyDialogComponent>,
    private commentService: CommentService,

    @Inject(MAT_DIALOG_DATA)
    public data: { commentId: string; recipe: Recipe; user: User }
  ) {}

  onSendReply() {
    const commentId = this.data.commentId;
    const recipe = this.data.recipe;
    const user = this.data.user;
    const replyContent = this.replyContent;

    const reply: Comment = {
      id: '',
      content: replyContent,
      user: user,
      recipe: recipe,
      timestamp: new Date(),
      replies: [],
      upvotes: [],
      downvotes: [],
      parrentCommentId: commentId,
    };

    this.commentService
      .addReply(commentId, reply)
      .then(() => {
        this.dialogRef.close(true);
      })
      .catch((error: any) => {
        console.error('Failed to add reply:', error);
      });
  }

  onCancel() {
    this.dialogRef.close();
  }
}
