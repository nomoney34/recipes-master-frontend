import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/auth/auth.service';
import { User } from 'src/app/shared/models/user';
import { Recipe } from '../../shared/models/recipe';
import { RecipeServiceService } from '../../services/recipes/recipe-service.service';
import { UserService } from 'src/app/services/users/user.service';
import { PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-recipe-list',
  templateUrl: './recipe-list.component.html',
  styleUrls: ['./recipe-list.component.sass'],
})
export class RecipeListComponent implements OnInit {
  filteredRecipes: Recipe[] = [];
  searchValue: string = '';
  totalRecipes: number = 0;
  currentUser: any;
  user: any;
  pageIndex: number = 0;
  pageSize: number = 50;

  constructor(
    private recipeService: RecipeServiceService,
    private authService: AuthService,
    private userService: UserService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.getRecipes();
    this.getUser();
  }

  getRecipes(): void {
    this.recipeService.getRecipes(this.searchValue, this.pageIndex, this.pageSize).subscribe((response: any) => {
      this.filteredRecipes = response.recipes;
      this.totalRecipes = response.total;
    });
  }

  filterRecipes(searchValue: string) {
    this.pageIndex = 0;
    searchValue = searchValue.trim();
    this.getRecipes();
  }

  pageChanged(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.getRecipes();
  }

  toCreateRecipe() {
    this.router.navigate(['recipes/create-recipe']);
  }

  toProfile() {
    this.router.navigate(['profile']);
  }

  toDetails(id: string) {
    this.router.navigate(['recipes', id]);
  }

  signOut() {
    this.authService.signOut().then(() => {
      localStorage.clear();
      this.snackBar.open('Signed out successfully', 'Close', {
        duration: 2000,
      });
    });
  }

  getUser() {
    this.currentUser = this.authService.getCurrentUser();
    const userId = this.currentUser.uid;
    this.userService.getUser(userId).subscribe((user) => {
      this.user = user;
    });
  }
}
