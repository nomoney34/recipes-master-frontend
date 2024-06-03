import { Component } from '@angular/core';
import { AuthService } from 'src/app/auth/auth.service';
import { UserService } from 'src/app/services/users/user.service';
import { MatDialog } from '@angular/material/dialog';
import { ChangeUsernameDialogComponent } from 'src/app/shared/change-username-dialog/change-username-dialog.component';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { finalize } from 'rxjs';
import { RecipeServiceService } from '../../services/recipes/recipe-service.service';
import { CommentService } from 'src/app/services/comments/comment.service';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';

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
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    const userId = this.currentUser.uid;

    this.route.params.subscribe((params) => {
      const username = params['username'];
      // Retrieve user based on username
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
    this.recipeService.getRecipes().subscribe((recipes) => {
      this.userRecipes = recipes.filter(
        (recipe) => recipe.user.uid === this.user.uid
      );
    });
  }

  filterUpvotedRecipes() {
    this.recipeService.getRecipes().subscribe((recipes) => {
      this.upvotedRecipes = recipes.filter((recipe) =>
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
        console.log('username updated');
      })
      .catch((error) => {
        console.log(error);
      });
  }

  updateDescription(description: string) {
    this.userService.updateDescription(description).then(() => {
      console.log('description updated');
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
    console.log(this.selectedFile);
  }

  uploadProfileImage() {
    if (this.selectedFile) {
      const file = this.selectedFile;
      const filePath = `profile-images/${this.currentUser.uid}`;
      const fileRef = this.storage.ref(filePath);
      const task = this.storage.upload(filePath, file);

      task
        .snapshotChanges()
        .pipe(
          finalize(() => {
            fileRef.getDownloadURL().subscribe((url) => {
              this.userService.updateProfileImage(url).then(() => {
                console.log('profile image updated');
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
}
