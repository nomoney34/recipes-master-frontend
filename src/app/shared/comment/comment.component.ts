import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { Comment } from '../models/comment';
import { CommentService } from 'src/app/services/comments/comment.service';
import { User } from '../models/user';

import { MatDialog } from '@angular/material/dialog';
import { ReplyDialogComponent } from '../reply-dialog/reply-dialog.component';

import { Router } from '@angular/router';

@Component({
  selector: 'app-comment',
  templateUrl: './comment.component.html',
  styleUrls: ['./comment.component.sass'],
})
export class CommentComponent implements OnInit {
  @Input() comment!: Comment;
  @Input() user!: User;
  @Output() commentClick = new EventEmitter<string>();
  expanded: boolean = false;

  constructor(
    private commentService: CommentService,
    private dialog: MatDialog,
    private router: Router
  ) {}

  ngOnInit(): void {}

  openReplyDialog() {
    const dialogRef = this.dialog.open(ReplyDialogComponent, {
      width: '400px',
      data: {
        commentId: this.comment.id,
        recipe: this.comment.recipe,
        user: this.user,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        console.log('Reply sent');
      } else {
        console.log('Reply not sent');
      }
    });
  }

  upvote(userId: string) {
    this.commentService.toggleUpvoteComment(this.comment.id, userId);
  }

  downvote(userId: string) {
    this.commentService.toggleDownvoteComment(this.comment.id, userId);
  }

  goToProfile() {
    this.router.navigate(['/profile', this.comment.user.username]);
  }

  toggleExpand() {
    this.expanded = !this.expanded;
  }

  onCommentClick() {
    this.commentClick.emit(this.comment.recipe.id);
  }
}
