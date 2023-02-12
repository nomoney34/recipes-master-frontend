import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Recipe } from 'src/app/shared/models/recipe';
import { RecipeServiceService } from '../recipe-service.service';
import { AuthService } from 'src/app/auth/auth.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { finalize, Observable } from 'rxjs';
import { AngularFireStorage } from '@angular/fire/compat/storage';

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

  constructor(
    private route: ActivatedRoute,
    private recipeService: RecipeServiceService,
    private authService: AuthService,
    private storage: AngularFireStorage,
    private formBuilder: FormBuilder
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
    this.uploadImage().then(() => {
      this.recipe = {
        ...this.recipe,
        ...this.recipeForm.value,
        imageUrl: this.recipeImageURL,
      };
      this.recipeService.updateRecipe(this.recipe.id, this.recipe);
      this.isEditable = false;
    });
  }

  deleteRecipe() {
    this.recipeService.deleteRecipe(this.recipe.id);
  }
}
