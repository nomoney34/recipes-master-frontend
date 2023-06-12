import { Component } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { Recipe } from 'src/app/shared/models/recipe';
import { User } from 'src/app/shared/models/user';
import { RecipeServiceService } from '../recipe-service.service';
import { AuthService } from 'src/app/auth/auth.service';
import { UserService } from 'src/app/user.service';

@Component({
  selector: 'app-create-recipe',
  templateUrl: './create-recipe.component.html',
  styleUrls: ['./create-recipe.component.sass'],
})
export class CreateRecipeComponent {
  onSubmit() {
    throw new Error('Method not implemented.');
  }
  currentUser: any;
  user: any;

  image?: File;
  isLoading: boolean = false;

  downloadURL: Observable<string> | undefined;
  recipeImageURL: string = '';

  recipe: Recipe | undefined;
  recipeForm!: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private storage: AngularFireStorage,
    private recipeService: RecipeServiceService,
    private authService: AuthService,
    private userService: UserService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.recipeForm = this.formBuilder.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      imagePath: ['', Validators.required],
      ingredients: ['', Validators.required],
      instructions: ['', Validators.required],
    });

    this.currentUser = this.authService.getCurrentUser();
    const userId = this.currentUser.uid;
    this.userService.getUser(userId).subscribe((user) => {
      this.user = user;
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
    this.isLoading = true;
    this.uploadImage().then(() => {
      this.recipe = {
        id: '',
        name: this.recipeForm.get('title')?.value,
        description: this.recipeForm.get('description')?.value,
        imageUrl: this.recipeImageURL,
        ingredients: this.recipeForm.get('ingredients')?.value,
        instructions: this.recipeForm.get('instructions')?.value,
        upvotes: [],
        downvotes: [],
        user: this.user,
        bookmarkedBy: [],
      };
      this.recipeService.addRecipe(this.recipe, this.user).then(() => {
        this.snackBar.open('Recipe added successfully', 'Close', {
          duration: 2000,
        });
        this.router.navigate(['/recipes']);
      });
    });
  }
}
