import { Component } from '@angular/core';
import { Recipe } from 'src/app/shared/models/recipe';
import { RecipeServiceService } from '../recipe-service.service';
import { UserService } from 'src/app/user.service';
import { AuthService } from 'src/app/auth/auth.service';
import { tap } from 'rxjs';

@Component({
  selector: 'app-favorites',
  templateUrl: './favorites.component.html',
  styleUrls: ['./favorites.component.sass'],
})
export class FavoritesComponent {
  currentUser: any;
  user: any;
  favoriteRecipes: Recipe[] = [];

  constructor(
    private recipeService: RecipeServiceService,
    private authService: AuthService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.getUser().subscribe(() => {
      this.recipeService.getRecipes().subscribe((recipes) => {
        this.favoriteRecipes = recipes.filter((recipe) =>
          recipe.bookmarkedBy.includes(this.user?.uid)
        );
      });
    });
  }

  getUser() {
    this.currentUser = this.authService.getCurrentUser();
    const userId = this.currentUser.uid;
    return this.userService.getUser(userId).pipe(
      tap((user) => {
        this.user = user;
      })
    );
  }
}
