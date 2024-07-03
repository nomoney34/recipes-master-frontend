import { Component, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Recipe } from 'src/app/shared/models/recipe';
import { RecipeServiceService } from '../../services/recipes/recipe-service.service';
import { AuthService } from 'src/app/auth/auth.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { finalize, Observable, tap, map } from 'rxjs';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Comment } from 'src/app/shared/models/comment';
import { CommentService } from 'src/app/services/comments/comment.service';
import { UserService } from 'src/app/services/users/user.service';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { TagService } from 'src/app/services/tags/tag-service.service';

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

  currentUser: any;
  user: any;

  image?: File;
  imagePreviewUrl: string | ArrayBuffer | null = null;
  downloadURL: Observable<string> | undefined;
  recipeImageURL: string = '';

  isLoading: boolean = false;

  comments: Comment[] = [];
  commentForm!: FormGroup;

  filteredTags: Observable<string[]> | undefined;
  allTags: string[] = [];
  selectedTags: string[] = [];
  separatorKeysCodes: number[] = [ENTER, COMMA];

  @ViewChild('tagInput') tagInput!: ElementRef<HTMLInputElement>;

  private _filter(value: unknown): any {
    const filterValue = (value as string)?.toLowerCase();
    return this.allTags.filter((tag) => tag.toLowerCase().includes(filterValue));
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private recipeService: RecipeServiceService,
    private authService: AuthService,
    private userService: UserService,
    private commentService: CommentService,
    private storage: AngularFireStorage,
    private formBuilder: FormBuilder,
    private snackBar: MatSnackBar,
    private tagService: TagService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.recipeService.getRecipe(id).subscribe((recipe) => {
        this.recipe = recipe;
        this.recipeForm = this.formBuilder.group({
          name: [recipe.name],
          description: [recipe.description],
          imagePath: [''],
          ingredients: [recipe.ingredients],
          instructions: [recipe.instructions],
          tags: [recipe.tags],
        });

        this.selectedTags = recipe.tags ? [...recipe.tags] : [];
        this.imagePreviewUrl = recipe.imageUrl;
        this.recipeImageURL = recipe.imageUrl;
        console.log(this.imagePreviewUrl);

        this.tagService.getTags().subscribe((tags: any) => {
          this.allTags = tags.map((tag: any) => tag.name);
        });
    
        this.filteredTags = this.recipeForm.get('tags')?.valueChanges.pipe(
          map((value) => this._filter(value))
        );
    
  
        this.commentService.getCommentsForRecipe(id).subscribe((comments) => {
          this.comments = comments;
        });
  
        this.getUser().subscribe((user) => {
          this.user = user;
        });
      });
  
      this.commentForm = this.formBuilder.group({
        content: ['', Validators.required],
      });
  
      this.currentUserId = this.authService.getCurrentUserId();
    } else {
      throw new Error('No id provided');
    }
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

  updateRecipe() {
    this.isLoading = true;  
    if (this.recipeImageURL !== this.imagePreviewUrl) {
      this.uploadImage().then(() => {
        this.updateRecipeData();
      });
    } else {
      this.updateRecipeData();
    }
  }
  
  updateRecipeData() {
    this.recipe = {
      ...this.recipe,
      ...this.recipeForm.value,
      imageUrl: this.recipeImageURL,
      tags: this.selectedTags,
    };
    this.recipeService.updateRecipe(this.recipe.id, this.recipe).then(() => {
      this.snackBar.open('Recipe updated', 'Close', {
        duration: 2000,
      });
      this.isEditable = false;
      this.router.navigate(['/recipes']);
    }).finally(() => {
      this.isLoading = false;
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

  switchBetweenEditAndCancel() {
    this.isEditable = !this.isEditable;
    if(!this.isEditable)
      this.selectedTags = this.recipe.tags ? [...this.recipe.tags] : [];
  }

  addTag(event: any): void {
    const input = event.input;
    const value = event.value;

    if ((value || '').trim()) {
      const trimmedValue = value.trim();
      if (!this.allTags.includes(trimmedValue)) {
        this.tagService.addTag(trimmedValue).then(() => {
          this.allTags.push(trimmedValue);
        });
      }
      this.selectedTags.push(trimmedValue);
    }

    if (input) {
      input.value = '';
    }

    this.recipeForm.get('tags')!.setValue(null);
  }

  removeTag(tag: string): void {
    console.log(this.recipe.tags);

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

  addComment() {
    const comment: Comment = {
      id: '',
      content: this.commentForm.get('content')?.value,
      recipe: this.recipe,
      user: this.user,
      timestamp: new Date(),
      upvotes: [],
      downvotes: [],
      replies: [],
      parrentCommentId: '',
    };

    if (!comment.content) {
      return;
    }

    this.commentService.addComment(comment).then(() => {
      this.snackBar.open('Comment added', 'Close', {
        duration: 2000,
      });
      this.commentForm.reset();
    });
  }

  getUser() {
    this.currentUser = this.authService.getCurrentUser();
    const userId = this.currentUser.uid;
    return this.userService.getUser(userId).pipe(
      tap((user) => {
        this.user = user;
      })
    );
  }

  toProfile(username: string) {
    this.router.navigate(['/profile', username]);
  }
  
}
