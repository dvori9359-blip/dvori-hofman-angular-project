import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login {
  private authService = inject(AuthService);
  private router = inject(Router);

  name = ''; 
  email = '';
  password = '';
  isRegister = false;
  errorMessage = '';
  isLoading = false;

  toggleMode(): void {
    this.isRegister = !this.isRegister;
    this.errorMessage = '';
    this.name = '';
  }

  onSubmit(): void {
    if (!this.email || !this.password || (this.isRegister && !this.name)) {
      this.errorMessage = 'נא למלא את כל השדות';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    
    const authObs = this.isRegister 
      ? this.authService.register({ name: this.name, email: this.email, password: this.password })
      : this.authService.login({ email: this.email, password: this.password });

    authObs.subscribe({
      next: () => {
        this.router.navigate(['/teams']);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || (this.isRegister ? 'שגיאה בהרשמה' : 'שגיאה בהתחברות');
        this.isLoading = false;
      },
      complete: () => this.isLoading = false
    });
  }
}