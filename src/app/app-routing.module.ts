import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RecipeListComponent } from './recipe-module/recipe-list/recipe-list.component';
import { HomeComponent } from './home/home.component';
import { CreateRecipeComponent } from './recipe-module/create-recipe/create-recipe.component';
import { RecipeDetailComponent } from './recipe-module/recipe-detail/recipe-detail.component';
import { AuthGuard } from './guard/auth.guard';
import { ProfileComponent } from './recipe-module/profile/profile.component';
import { FavoritesComponent } from './recipe-module/favorites/favorites.component';

const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'recipes', component: RecipeListComponent },
  {
    path: 'recipes/create-recipe',
    component: CreateRecipeComponent,
    canActivate: [AuthGuard],
  },
  { path: 'recipes/:id', component: RecipeDetailComponent },
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },
  {
    path: 'favorites',
    component: FavoritesComponent,
    canActivate: [AuthGuard],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
