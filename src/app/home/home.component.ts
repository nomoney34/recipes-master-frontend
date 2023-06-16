import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { AuthComponent } from '../auth/auth.component';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.sass'],
})
export class HomeComponent {
  isLoggedIn = false;

  constructor(
    private dialog: MatDialog,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    // localStorage.clear();
    this.isLoggedIn = this.authService.isLoggedIn();
  }

  toRecipes() {
    this.router.navigate(['recipes']).then(() => {
      this.snackBar.open('Welcome to the the world of recipes!', 'Close', {
        duration: 2000,
      });
    });
  }

  openLoginDialog() {
    this.dialog.open(AuthComponent, {
      width: '400px',
    });
  }
}
