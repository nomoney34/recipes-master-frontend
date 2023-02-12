import { Component } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { Recipe } from 'src/app/shared/models/recipe';
import { User } from 'src/app/shared/models/user';
import { RecipeServiceService } from '../recipe-service.service';

@Component({
  selector: 'app-create-recipe',
  templateUrl: './create-recipe.component.html',
  styleUrls: ['./create-recipe.component.sass'],
})
export class CreateRecipeComponent {
  onSubmit() {
    throw new Error('Method not implemented.');
  }
  user: User = JSON.parse(localStorage.getItem('user') || '{}');

  // recipeName!: string;
  // description!: string;
  image?: File;
  // ingredients!: string;
  // instructions!: string;

  downloadURL: Observable<string> | undefined;
  recipeImageURL: string = '';

  recipe: Recipe | undefined;
  recipeForm!: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private storage: AngularFireStorage,
    private recipeService: RecipeServiceService
  ) {}

  ngOnInit(): void {
    this.recipeForm = this.formBuilder.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      imagePath: ['', Validators.required],
      ingredients: ['', Validators.required],
      instructions: ['', Validators.required],
    });
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

  addRecipe() {
    this.uploadImage().then(() => {
      this.recipe = {
        id: '',
        name: this.recipeForm.get('title')?.value,
        description: this.recipeForm.get('description')?.value,
        imageUrl: this.recipeImageURL,
        ingredients: this.recipeForm.get('ingredients')?.value,
        instructions: this.recipeForm.get('instructions')?.value,
        user: this.user,
      };
      this.recipeService.addRecipe(this.recipe, this.user);
    });
  }
}
