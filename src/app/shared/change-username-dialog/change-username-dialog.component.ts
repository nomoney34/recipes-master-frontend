import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-change-username-dialog',
  templateUrl: './change-username-dialog.component.html',
  styleUrls: ['./change-username-dialog.component.sass'],
})
export class ChangeUsernameDialogComponent {
  newUsername: string = '';
  newDescription: string = '';

  constructor(
    public dialogRef: MatDialogRef<ChangeUsernameDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.newUsername = data.username;
    this.newDescription = data.description;
  }

  save() {
    if (this.newUsername.length > 0) {
      this.dialogRef.close({
        username: this.newUsername,
        description: this.newDescription,
      });
    }
  }

  cancel() {
    this.dialogRef.close();
  }
}
