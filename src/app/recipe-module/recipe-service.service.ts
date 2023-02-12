import { Injectable } from '@angular/core';
import {
  AngularFirestore,
  AngularFirestoreDocument,
} from '@angular/fire/compat/firestore';
import { map, Observable } from 'rxjs';
import { Recipe } from '../shared/models/recipe';
import { User } from '../shared/models/user';

@Injectable({
  providedIn: 'root',
})
export class RecipeServiceService {
  constructor(private afs: AngularFirestore) {}

  getRecipes(): Observable<Recipe[]> {
    return this.afs.collection<Recipe>('recipes').valueChanges();
  }

  getRecipe(id: string): Observable<Recipe> {
    return this.afs
      .collection('recipes')
      .doc(id)
      .snapshotChanges()
      .pipe(
        map((recipeDoc) => {
          const recipe = recipeDoc.payload.data() as Recipe;
          recipe.id = recipeDoc.payload.id;
          return recipe;
        })
      );
  }

  async addRecipe(recipe: Recipe, user: User) {
    const recipeRef = this.afs.collection<Recipe>('recipes').doc();
    const recipeId = recipeRef.ref.id;
    recipe.id = recipeId;
    recipe.user = user;
    recipeRef.set(recipe);
  }

  updateRecipe(id: string, recipe: Recipe) {
    const recipeDoc = this.afs.doc<Recipe>(`recipes/${id}`);
    recipeDoc.update(recipe);
  }

  deleteRecipe(id: string) {
    const recipeDoc = this.afs.doc<Recipe>(`recipes/${id}`);
    recipeDoc.delete();
  }
}
