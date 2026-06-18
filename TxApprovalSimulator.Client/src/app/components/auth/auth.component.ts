import { Component, inject, output, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthService } from '../../services/auth.service';

type Mode = 'login' | 'signup';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [ReactiveFormsModule, TranslatePipe],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.scss'
})
export class AuthComponent {
  private readonly auth = inject(AuthService);
  private readonly fb = inject(FormBuilder);

  /** Emitted when the modal should close (after success, or via the X / backdrop). */
  readonly close = output<void>();

  readonly mode = signal<Mode>('login');
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    fullName: [''],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  constructor() {
    this.applyModeValidators('login');
  }

  setMode(mode: Mode): void {
    this.mode.set(mode);
    this.error.set(null);
    this.applyModeValidators(mode);
  }

  /** Signup additionally requires a full name and a 6+ character password. */
  private applyModeValidators(mode: Mode): void {
    const { fullName, password } = this.form.controls;

    if (mode === 'signup') {
      fullName.setValidators([Validators.required]);
      password.setValidators([Validators.required, Validators.minLength(6)]);
    } else {
      fullName.clearValidators();
      password.setValidators([Validators.required]);
    }

    fullName.updateValueAndValidity();
    password.updateValueAndValidity();
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.error.set(null);
    this.loading.set(true);

    const { email, password, fullName } = this.form.getRawValue();
    const handlers = {
      next: () => {
        this.loading.set(false);
        this.close.emit();
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        this.error.set(this.messageFor(err));
      }
    };

    if (this.mode() === 'login') {
      this.auth.login({ email, password }).subscribe(handlers);
    } else {
      this.auth.signup({ email, password, fullName }).subscribe(handlers);
    }
  }

  onClose(): void {
    this.close.emit();
  }

  /** Map an HTTP error to a specific, translatable message. */
  private messageFor(err: HttpErrorResponse): string {
    if (this.mode() === 'login') {
      return err.status === 401 ? 'auth.errorLogin' : 'auth.errorGeneric';
    }
    switch (err.status) {
      case 409:
        return 'auth.errorEmailExists';
      case 400:
        return 'auth.errorInvalidInput';
      default:
        return 'auth.errorGeneric';
    }
  }
}
