import { Component, OnInit, Input, Output } from '@angular/core';
import { AuthService } from '../_services/auth.service';
import { EventEmitter } from '@angular/core';
import { AlertifyService } from '../_services/alertify.service';
import {
  FormGroup,
  FormControl,
  Validators,
  FormBuilder
} from '@angular/forms';
import { User } from '../_models/User';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  user: User;

  @Input() valuesFromHome: any;

  @Output() cancelRegister = new EventEmitter();
  registerForm: FormGroup;
  constructor(
    private authService: AuthService,
    private alertifyService: AlertifyService,
    private formBuilder: FormBuilder,
    private router: Router
  ) {}

  ngOnInit() {
    this.createRgisterForm();
  }

  createRgisterForm() {
    this.registerForm = this.formBuilder.group(
      {
        gender: ['male', Validators.required],
        userName: ['', Validators.required],
        knownAs: ['', Validators.required],
        dateOfBirth: ['', Validators.required],
        country: ['', Validators.required],
        city: ['', Validators.required],
        password: [
          '',
          [
            Validators.required,
            Validators.minLength(8),
            Validators.maxLength(50)
          ]
        ],
        confirmPassword: ['', [Validators.required]]
      },
      {
        validator: (form: FormGroup) => {
          return form.get('password').value ===
            form.get('confirmPassword').value
            ? null
            : { mismatch: true };
        }
      }
    );
  }

  register() {
    console.log(this.registerForm.value);
    if (this.registerForm.valid) {
      this.user = Object.assign({}, this.registerForm.value);
      console.log(this.user);
      this.authService.reigster(this.user).subscribe(
        () => {
          this.alertifyService.success('registered successfully');
        },
        error => {
          this.alertifyService.error(error);
        },
        () => {
          this.authService.login(this.user).subscribe(() => {
            this.router.navigate(['/members']);
          });
        }
      );
    }
  }

  cancel() {
    this.cancelRegister.emit(false);
  }
}
