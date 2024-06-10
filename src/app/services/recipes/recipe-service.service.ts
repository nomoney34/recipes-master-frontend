import { Injectable } from '@angular/core';
import {
  AngularFirestore,
  CollectionReference,
  Query,
} from '@angular/fire/compat/firestore';
import { map, Observable } from 'rxjs';
import { Recipe } from '../../shared/models/recipe';
import { User } from '../../shared/models/user';

@Injectable({
  providedIn: 'root',
})
export class RecipeServiceService {
  constructor(private afs: AngularFirestore) {}

 
  getRecipes(searchValue: string = '', pageIndex: number = 0, pageSize: number = 50): Observable<{ recipes: Recipe[], total: number }> {
    return this.afs.collection<Recipe>('recipes').valueChanges({ idField: 'id' }).pipe(
      map((recipes) => {
        if (searchValue) {
          const searchValueLower = searchValue.toLowerCase();
          recipes = recipes.filter(recipe => 
            recipe.name.toLowerCase().includes(searchValueLower)
          );
        }
        
        const total = recipes.length;
        const start = pageIndex * pageSize;
        const end = start + pageSize;
        return { recipes: recipes.slice(start, end), total };
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
    await this.afs.firestore.runTransaction(async (transaction) => {
      const recipeSnapshot = await transaction.get(recipeRef.ref);
      const recipe = recipeSnapshot.data() as Recipe;

      if (recipe) {
        const { upvotes, downvotes } = recipe;

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

        transaction.update(recipeRef.ref, { upvotes, downvotes });
      }
    });
  }

  async downvoteRecipe(recipeId: string, user: User) {
    const recipeRef = this.afs.doc<Recipe>(`recipes/${recipeId}`);
    await this.afs.firestore.runTransaction(async (transaction) => {
      const recipeSnapshot = await transaction.get(recipeRef.ref);
      const recipe = recipeSnapshot.data() as Recipe;

      if (recipe) {
        const { upvotes, downvotes } = recipe;

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

        transaction.update(recipeRef.ref, { upvotes, downvotes });
      }
    });
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

  async updateRecipesForUser(
    userId: string,
    updatedUser: Partial<User>
  ): Promise<void> {
    const userDoc = this.afs.doc<User>(`users/${userId}`);
    const userSnapshot = await userDoc.ref.get();

    if (userSnapshot.exists) {
      const userData = userSnapshot.data() as User;
      const batch = this.afs.firestore.batch();

      const recipesRef = this.afs.collection<Recipe>('recipes', (ref) =>
        ref.where('user.uid', '==', userId)
      );

      recipesRef.get().subscribe((recipesSnapshot) => {
        recipesSnapshot.forEach((recipeDoc) => {
          const recipe = recipeDoc.data() as Recipe;
          recipe.user = { ...recipe.user, ...updatedUser, ...userData };
          batch.update(recipeDoc.ref, recipe);
        });

        batch.commit();
      });
    }
  }


  getRecipesByTag(tag: string): Observable<Recipe[]> {
    return this.afs
      .collection<Recipe>('recipes', ref => ref.where('tags', 'array-contains', tag))
      .valueChanges();
  }

  
}
