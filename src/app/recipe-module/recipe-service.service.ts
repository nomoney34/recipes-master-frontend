import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Recipe } from './recipe';

@Injectable({
  providedIn: 'root',
})
export class RecipeServiceService {
  private httpHeaders: HttpHeaders;

  constructor(private http: HttpClient) {
    this.httpHeaders = new HttpHeaders({
      'Access-Control-Allow-Origin': '*',
    });
  }

  getRecipes(): Observable<Recipe[]> {
    return this.http.get<Recipe[]>('https://localhost:7295/api/recipe');
  }

  getRecipe(id: number): Observable<Recipe> {
    return this.http.get<Recipe>(`https://localhost:7295/api/recipe/${id}`);
  }

  addRecipe(recipe: Recipe): Observable<Recipe> {
    return this.http.post<Recipe>('https://localhost:7295/api/recipe', recipe);
  }

  updateRecipe(recipe: Recipe): Observable<Recipe> {
    return this.http.put<Recipe>(
      `https://localhost:7295/api/recipe/${recipe.id}`,
      recipe
    );
  }

  deleteRecipe(id: number): Observable<Recipe> {
    return this.http.delete<Recipe>(`http://localhost:7295/api/recipe/${id}`);
  }
}
