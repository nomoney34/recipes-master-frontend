import { Component, ElementRef, ViewChild } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';
import { Recipe } from 'src/app/shared/models/recipe';
import { RecipeServiceService } from '../../services/recipes/recipe-service.service';
import { AuthService } from 'src/app/auth/auth.service';
import { UserService } from 'src/app/services/users/user.service';
import { COMMA, ENTER } from '@angular/cdk/keycodes';

@Component({
  selector: 'app-create-recipe',
  templateUrl: './create-recipe.component.html',
  styleUrls: ['./create-recipe.component.sass'],
})
export class CreateRecipeComponent {
  currentUser: any;
  user: any;
  image?: File;
  imagePreviewUrl: string | ArrayBuffer | null = null;
  isLoading: boolean = false;
  downloadURL: Observable<string> | undefined;
  recipeImageURL: string = '';
  recipe: Recipe | undefined;
  recipeForm!: FormGroup;

  filteredTags: Observable<string[]> | undefined;
  allTags: string[] = ["chicken", "soup"];
  selectedTags: string[] = [];
  separatorKeysCodes: number[] = [ENTER, COMMA];

  @ViewChild('tagInput') tagInput!: ElementRef<HTMLInputElement>;

  constructor(
    private formBuilder: FormBuilder,
    private storage: AngularFireStorage,
    private recipeService: RecipeServiceService,
    private authService: AuthService,
    private userService: UserService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    

  }
  private _filter(value: unknown): any {
    const filterValue = (value as string)?.toLowerCase();
    return this.allTags.filter((tag) => tag.toLowerCase().includes(filterValue));
  }

  ngOnInit(): void {
    this.recipeForm = this.formBuilder.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      imagePath: ['', Validators.required],
      ingredients: ['', Validators.required],
      instructions: ['', Validators.required],
      tags: ['']
    });

    this.filteredTags = this.recipeForm.get('tags')?.valueChanges.pipe(
      map((value) => this._filter(value))
    );

    this.currentUser = this.authService.getCurrentUser();
    const userId = this.currentUser.uid;
    this.userService.getUser(userId).subscribe((user) => {
      this.user = user;
    });
  }

  onImageSelected(event: any) {
    this.image = event.target.files[0];
    if (this.image) {
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreviewUrl = reader.result;
      };
      reader.readAsDataURL(this.image);
    }
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
        tags: [],
        upvotes: [],
        downvotes: [],
        user: this.user,
        bookmarkedBy: [],
      };

      if (
        !this.recipe.name ||
        !this.recipe.description ||
        !this.recipe.imageUrl ||
        !this.recipe.ingredients ||
        !this.recipe.instructions
      ) {
        return;
      }

      this.recipeService.addRecipe(this.recipe, this.user).then(() => {
        this.snackBar.open('Recipe added successfully', 'Close', {
          duration: 2000,
        });
        this.recipeForm.reset();
        this.router.navigate(['/recipes']);
      });
    });

    this.isLoading = false;
  }

  addTag(event: any): void {
    const input = event.input;
    const value = event.value;

    if ((value || '').trim()) {
      this.selectedTags.push(value.trim());
    }

    if (input) {
      input.value = '';
    }

    this.recipeForm.get('tags')!.setValue(null);
  }

  removeTag(tag: string): void {
    const index = this.selectedTags.indexOf(tag);

    if (index >= 0) {
      this.selectedTags.splice(index, 1);
    }
  }

  selectTag(event: any, input: HTMLInputElement): void {
    this.selectedTags.push(event.option.viewValue);
    input.value = '';
    this.recipeForm.get('tags')!.setValue('');
  }
}
