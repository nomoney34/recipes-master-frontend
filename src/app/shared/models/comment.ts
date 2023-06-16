import { Recipe } from './recipe';
import { User } from './user';

export interface Comment {
  id: string;
  content: string;
  user: User;
  recipe: Recipe;
  timestamp: Date;
  upvotes: string[];
  downvotes: string[];
  replies: string[];
}
