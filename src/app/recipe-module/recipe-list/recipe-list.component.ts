import { Component, OnInit } from '@angular/core';
import { Recipe } from '../recipe';
import { RecipeServiceService } from '../recipe-service.service';

@Component({
  selector: 'app-recipe-list',
  templateUrl: './recipe-list.component.html',
  styleUrls: ['./recipe-list.component.sass'],
})
export class RecipeListComponent implements OnInit {
  recipes: Recipe[] = [];

  constructor(private recipeService: RecipeServiceService) {}

  ngOnInit(): void {
    this.recipeService.getRecipes().subscribe((recipes) => {
      this.recipes = recipes;
    });
  }
}
