import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.html',
  styleUrls: ['./settings.css']
})
export class Settings implements OnInit {
  public authService = inject(AuthService);
  
  tempName = '';
  previewUrl: string | null = null;
  alertMessage = signal<string | null>(null);

  ngOnInit() {
    const user = this.authService.currentUser(); 
    if (user) {
      this.tempName = user.name;
      // אין צורך ב-Casting יותר!
      this.previewUrl = user.profileImage || null; 
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file && file.size <= 500 * 1024) {
      const reader = new FileReader();
      reader.onload = () => this.previewUrl = reader.result as string;
      reader.readAsDataURL(file);
    } else {
      alert('הקובץ גדול מדי (מקסימום 500KB)');
    }
  }

  saveProfile() {
    const current = this.authService.currentUser();
    if (current && this.tempName.trim()) {
      const updatedData: User = { 
        ...current, 
        name: this.tempName, 
        profileImage: this.previewUrl || undefined 
      };
      this.authService.updateUser(updatedData);
      this.alertMessage.set('הפרופיל עודכן בהצלחה!');
      setTimeout(() => this.alertMessage.set(null), 3000);
    }
  }
}