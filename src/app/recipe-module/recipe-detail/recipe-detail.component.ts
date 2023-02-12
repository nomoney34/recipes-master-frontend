import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Recipe } from 'src/app/shared/models/recipe';
import { RecipeServiceService } from '../recipe-service.service';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-recipe-detail',
  templateUrl: './recipe-detail.component.html',
  styleUrls: ['./recipe-detail.component.sass'],
})
export class RecipeDetailComponent {
  recipe!: Recipe;
  currentUserId!: string;

  constructor(
    private route: ActivatedRoute,
    private recipeService: RecipeServiceService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.recipeService.getRecipe(id).subscribe((recipe) => {
        this.recipe = recipe;
      });
    } else {
      throw new Error('No id provided');
    }

    this.currentUserId = this.authService.getCurrentUserId();
  }

  updateRecipe() {
    this.recipeService.updateRecipe(this.recipe.id, this.recipe);
  }

  deleteRecipe() {
    this.recipeService.deleteRecipe(this.recipe.id);
  }
}
