import { User } from './user';

export interface Recipe {
  id: string;
  name: string;
  description: string;
  ingredients: string;
  instructions: string;
  imageUrl: string;
  user: User;
}
