import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { User } from '../models/user';
import { RecipeServiceService } from '../../recipe-module/recipe-service.service';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.sass'],
})
export class CardComponent implements OnInit {
  @Input() id!: string;
  @Input() name!: string;
  @Input() description!: string;
  @Input() ingredients!: string;
  @Input() instructions!: string;
  @Input() imageUrl!: string;
  @Input() upvotes!: string[];
  @Input() downvotes!: string[];
  @Input() user!: User;

  @Output() navigate = new EventEmitter<string>();

  constructor(private recipeService: RecipeServiceService) {}

  ngOnInit(): void {}

  toDetails(id: string) {
    this.navigate.emit(id);
  }

  upvoteRecipe(id: string, user: User) {
    this.recipeService.upvoteRecipe(id, user);
  }

  downvoteRecipe(id: string, user: User) {
    this.recipeService.downvoteRecipe(id, user);
  }

  isUpvoted(user: User, upvotes: string[]): boolean {
    return upvotes.includes(user.uid);
  }

  isDownvoted(user: User, downvotes: string[]): boolean {
    return downvotes.includes(user.uid);
  }

  bookmarkRecipe(id: string, user: User) {
    this.recipeService.toggleBookmark(id, user);
    console.log('bookmark');
  }
}
