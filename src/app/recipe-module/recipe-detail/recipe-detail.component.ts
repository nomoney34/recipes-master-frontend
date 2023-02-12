import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Recipe } from 'src/app/shared/models/recipe';
import { RecipeServiceService } from '../recipe-service.service';
import { AuthService } from 'src/app/auth/auth.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { finalize, Observable } from 'rxjs';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-recipe-detail',
  templateUrl: './recipe-detail.component.html',
  styleUrls: ['./recipe-detail.component.sass'],
})
export class RecipeDetailComponent {
  recipe!: Recipe;
  currentUserId!: string;
  isEditable = false;
  recipeForm!: FormGroup;

  image?: File;
  downloadURL: Observable<string> | undefined;
  recipeImageURL: string = '';

  isLoading: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private recipeService: RecipeServiceService,
    private authService: AuthService,
    private storage: AngularFireStorage,
    private formBuilder: FormBuilder,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.recipeService.getRecipe(id).subscribe((recipe) => {
        this.recipe = recipe;
        this.recipeService.getRecipe(id).subscribe((recipe) => {
          this.recipeForm = this.formBuilder.group({
            name: [recipe.name],
            description: [recipe.description],
            imagePath: [''],
            ingredients: [recipe.ingredients],
            instructions: [recipe.instructions],
          });
        });
      });
    } else {
      throw new Error('No id provided');
    }

    this.currentUserId = this.authService.getCurrentUserId();
  }

  onImageSelected(event: any) {
    this.image = event.target.files[0];
  }

  uploadImage() {
    return new Promise<void>((resolve, reject) => {
      const fileName = `${new Date().getTime()}_${this.image?.name}`;
      const filePath = `images/${fileName}`;
      const fileRef = this.storage.ref(filePath);
      const task = this.storage.upload(filePath, this.image!);
      task
        .snapshotChanges()
        .pipe(
          finalize(() => {
            this.downloadURL = fileRef.getDownloadURL();
            this.downloadURL.subscribe((url) => {
              this.recipeImageURL = url;
              resolve();
            });
          })
        )
        .subscribe();
    });
  }

  updateRecipe() {
    this.isLoading = true;
    this.uploadImage().then(() => {
      this.recipe = {
        ...this.recipe,
        ...this.recipeForm.value,
        imageUrl: this.recipeImageURL,
      };
      this.recipeService.updateRecipe(this.recipe.id, this.recipe).then(() => {
        this.snackBar.open('Recipe updated', 'Close', {
          duration: 2000,
        });
        this.isEditable = false;
        this.router.navigate(['/recipes']);
      });
    });
  }

  deleteRecipe() {
    this.isLoading = true;
    this.recipeService.deleteRecipe(this.recipe.id).then(() => {
      this.snackBar.open('Recipe deleted', 'Close', {
        duration: 2000,
      });
      this.isEditable = false;
      this.router.navigate(['/recipes']);
    });
  }
}
