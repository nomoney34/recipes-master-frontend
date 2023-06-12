import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RecipeListComponent } from './recipe-list/recipe-list.component';
import { SharedModule } from '../shared/shared.module';
import { CreateRecipeComponent } from './create-recipe/create-recipe.component';
import { RecipeDetailComponent } from './recipe-detail/recipe-detail.component';
import { RouterModule } from '@angular/router';
import { ProfileComponent } from './profile/profile.component';

@NgModule({
  declarations: [
    RecipeListComponent,
    CreateRecipeComponent,
    RecipeDetailComponent,
    ProfileComponent,
  ],
  imports: [CommonModule, SharedModule, RouterModule],
})
export class RecipeModuleModule {}
