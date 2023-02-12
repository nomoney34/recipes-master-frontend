import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AuthComponent } from '../auth/auth.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.sass'],
})
export class HomeComponent {
  constructor(private dialog: MatDialog) {}

  openLoginDialog() {
    this.dialog.open(AuthComponent, {
      width: '400px',
    });
  }
}
