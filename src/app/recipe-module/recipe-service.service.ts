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
    return this.afs
      .collection<Recipe>('recipes')
      .valueChanges()
      .pipe(
        map((recipes) => {
          // Initialize upvotes and downvotes arrays for each recipe
          return recipes.map((recipe) => ({
            ...recipe,
            upvotes: recipe.upvotes || [],
            downvotes: recipe.downvotes || [],
          }));
        })
      );
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
    recipe.upvotes = [];
    recipe.downvotes = [];
    recipeRef.set(recipe);
  }

  async updateRecipe(id: string, recipe: Recipe) {
    const recipeDoc = this.afs.doc<Recipe>(`recipes/${id}`);
    recipeDoc.update(recipe);
  }

  async deleteRecipe(id: string) {
    const recipeDoc = this.afs.doc<Recipe>(`recipes/${id}`);
    recipeDoc.delete();
  }

  async upvoteRecipe(recipeId: string, user: User) {
    const recipeRef = this.afs.doc<Recipe>(`recipes/${recipeId}`);
    const recipe = await recipeRef.get().toPromise();

    if (recipe) {
      const { upvotes, downvotes } = recipe.data() as Recipe;

      if (upvotes.includes(user?.uid)) {
        const index = upvotes.indexOf(user?.uid);
        upvotes.splice(index, 1);
      } else {
        const downvoteIndex = downvotes.indexOf(user?.uid);
        if (downvoteIndex !== -1) {
          downvotes.splice(downvoteIndex, 1);
        }
        upvotes.push(user?.uid);
      }

      await recipeRef.update({ upvotes, downvotes });
    }
  }

  async downvoteRecipe(recipeId: string, user: User) {
    const recipeRef = this.afs.doc<Recipe>(`recipes/${recipeId}`);
    const recipe = await recipeRef.get().toPromise();

    if (recipe) {
      const { upvotes, downvotes } = recipe.data() as Recipe;

      if (downvotes.includes(user?.uid)) {
        const index = downvotes.indexOf(user?.uid);
        downvotes.splice(index, 1);
      } else {
        const upvoteIndex = upvotes.indexOf(user?.uid);
        if (upvoteIndex !== -1) {
          upvotes.splice(upvoteIndex, 1);
        }
        downvotes.push(user?.uid);
      }

      await recipeRef.update({ upvotes, downvotes });
    }
  }

  async toggleBookmark(recipeId: string, user: User) {
    const recipeRef = this.afs.doc<Recipe>(`recipes/${recipeId}`);
    const recipe = await recipeRef.get().toPromise();

    if (recipe) {
      const { bookmarkedBy } = recipe.data() as Recipe;
      const userIndex = bookmarkedBy.indexOf(user.uid);
      const updatedBookmarkedBy = [...bookmarkedBy]; // Create a new array

      if (userIndex !== -1) {
        // Remove user ID from the array
        updatedBookmarkedBy.splice(userIndex, 1);
      } else {
        // Add user ID to the array
        updatedBookmarkedBy.push(user.uid);
      }

      await recipeRef.update({ bookmarkedBy: updatedBookmarkedBy });
    }
  }
}
