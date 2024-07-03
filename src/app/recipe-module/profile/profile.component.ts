import { Component } from '@angular/core';
import { AuthService } from 'src/app/auth/auth.service';
import { UserService } from 'src/app/services/users/user.service';
import { MatDialog } from '@angular/material/dialog';
import { ChangeUsernameDialogComponent } from 'src/app/shared/change-username-dialog/change-username-dialog.component';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { finalize } from 'rxjs';
import { RecipeServiceService } from '../../services/recipes/recipe-service.service';
import { CommentService } from 'src/app/services/comments/comment.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.sass'],
})
export class ProfileComponent {
  currentUser: any;
  user: any;
  selectedFile: File | null = null;

  userRecipes: any[] = [];
  upvotedRecipes: any[] = [];
  comments: any[] = [];

  activeTab = 'recipes';

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private recipeService: RecipeServiceService,
    private commentService: CommentService,
    private router: Router,
    private dialog: MatDialog,
    private storage: AngularFireStorage,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    
    this.route.params.subscribe((params) => {
      const username = params['username'];
      this.userService.getUserByUsername(username).subscribe((user) => {
        this.user = user;
        this.filterUserRecipes();
        this.filterUpvotedRecipes();
        this.filterInteractions();
      });
    });
  }

  isCurrentUser(): boolean {
    return this.currentUser.uid === this.user?.uid;
  }

  filterUserRecipes() {
    this.recipeService.getRecipes().subscribe((response) => {
      this.userRecipes = response.recipes.filter(
        (recipe) => recipe.user.uid === this.user.uid
      );
    });
  }

  filterUpvotedRecipes() {
    this.recipeService.getRecipes().subscribe((response) => {
      this.upvotedRecipes = response.recipes.filter((recipe) =>
        recipe.upvotes.includes(this.user.uid)
      );
    });
  }

  filterInteractions() {
    this.commentService
      .getCommentsForUser(this.user.uid)
      .subscribe((comments) => {
        this.comments = comments;
      });
  }

  changeProfileImage() {
    console.log('change profile image');
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  updateUsername(username: string) {
    this.userService
      .updateUsername(username)
      .then(() => {
        this.snackBar.open('Profile updated', 'Close', {
          duration: 2000,
        });
        this.router.navigate(['/profile', username]);
      });
      
  }

  updateDescription(description: string) {
    this.userService.updateDescription(description).then(() => {
      this.snackBar.open('Profile updated', 'Close', {
        duration: 2000,
      });     
    });
  }

  openUsernameDialog() {
    const dialogRef = this.dialog.open(ChangeUsernameDialogComponent, {
      data: {
        username: this.user.username,
        description: this.user.description,
      },
      width: '600px',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.updateUsername(result.username);
        this.updateDescription(result.description);
      }
    });
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
    if (this.selectedFile) {
      const filePath = `profile-images/${this.currentUser.uid}`;
      const fileRef = this.storage.ref(filePath);
      const task = this.storage.upload(filePath, this.selectedFile);

      task
        .snapshotChanges()
        .pipe(
          finalize(() => {
            fileRef.getDownloadURL().subscribe((url) => {
              this.userService.updateProfileImage(url).then(() => {
                this.snackBar.open('Profile image updated', 'Close', {
                  duration: 2000,
                });
              });
            });
          })
        )
        .subscribe();
    }
  }

  toDetails(id: string) {
    this.router.navigate(['recipes', id]);
  }

  onCommentClick(recipeId: string) {
    this.toDetails(recipeId);
  }
}
