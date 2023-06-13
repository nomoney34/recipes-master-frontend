import { Component, Input } from '@angular/core';
import { Comment } from '../models/comment';
@Component({
  selector: 'app-comment',
  templateUrl: './comment.component.html',
  styleUrls: ['./comment.component.sass'],
})
export class CommentComponent {
  @Input() comment!: Comment;
}
