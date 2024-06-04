import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.sass'],
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;

  passwordRequirements = [
    { requirement: 'At least 8 characters', isMet: false },
    { requirement: 'At least 1 uppercase letter', isMet: false },
    { requirement: 'At least 1 lowercase letter', isMet: false },
    { requirement: 'At least 1 number', isMet: false },
    { requirement: 'At least 1 special character', isMet: false },
  ];

  constructor(
    public authService: AuthService,
    public dialogRef: MatDialogRef<RegisterComponent>,
  ) {}

  ngOnInit(): void {
    this.registerForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required, this.passwordValidator.bind(this)]),
      confirmPassword: new FormControl('', [Validators.required])
    }, { validators: this.checkPasswords });
  }
  
  register() {
    const email = this.registerForm.get('email')?.value;
    const password = this.registerForm.get('password')?.value;

    this.authService.signUp(email, password).then(() => {
      this.authService.signIn(email, password);
    });

    this.dialogRef.close();
  }

  passwordValidator(control: AbstractControl): { [key: string]: boolean } | null {
    const password = control.value;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumeric = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(password);
    const hasMinLength = password.length >= 8;
  
    if (hasUpperCase && hasLowerCase && hasNumeric && hasSpecialChar && hasMinLength)  {
      return null;
    } else {
      return { 'passwordStrength': true };
    }
  }


  onPasswordInput(event: Event) {
    const passwordInput = event.target as HTMLInputElement;
    const password = passwordInput.value;
    this.updatePasswordRequirements(password);
    this.registerForm.updateValueAndValidity();
  }

  updatePasswordRequirements(password: string) {
    this.passwordRequirements[0].isMet = password.length >= 8;
    this.passwordRequirements[1].isMet = /[A-Z]/.test(password);
    this.passwordRequirements[2].isMet = /[a-z]/.test(password);
    this.passwordRequirements[3].isMet = /[0-9]/.test(password);
    this.passwordRequirements[4].isMet = /[\W_]/.test(password);
  }
  
  checkPasswords: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
    if(this.registerForm){
      const password = this.registerForm.get('password')?.value;
      const confirmPassword = this.registerForm.get('confirmPassword')?.value;
      return password === confirmPassword ? null : { notSame: true };
    
    }
    return { notSame: true };
  };
  
}