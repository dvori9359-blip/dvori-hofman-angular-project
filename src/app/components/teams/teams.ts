import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { Router } from '@angular/router'; 
import { TeamsService } from '../../services/teams.service'; 
import { FormsModule } from '@angular/forms'; 
import { Team } from '../../models/team.model';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-teams',
  standalone: true,
  imports: [CommonModule, FormsModule], 
  templateUrl: './teams.html',
  styleUrls: ['./teams.css'], 
})
export class Teams implements OnInit { 
  teamsList = signal<Team[]>([]);
  showTeamModal = false; 
  allUsersList = signal<User[]>([]); 
  currentTeamMembers = signal<User[]>([]); 
  selectedTeamIdForManage: number | null = null; 
  selectedUserIdToAdd: number | null = null; 
  alertMessage = signal<string | null>(null); 

  private router = inject(Router); 
  private teamsService = inject(TeamsService); 

  ngOnInit() {
    this.loadTeams(); 
  }

  loadTeams() {
    this.teamsService.getTeams().subscribe({
      next: (data: Team[]) => this.teamsList.set(data), 
      error: (err) => console.error(err)
    });
  }

  onSelectTeam(teamId: any) {
    if (teamId) {
      this.router.navigate(['/teams', teamId]); 
    }
  }

  openManageTeamModal(teamId: any, event: Event) {
    event.stopPropagation(); 
    this.selectedTeamIdForManage = Number(teamId);
    this.showTeamModal = true;
    this.teamsService.getAllUsers().subscribe(data => this.allUsersList.set(data));
    this.loadCurrentTeamMembers();
  }

  loadCurrentTeamMembers() {
    if (this.selectedTeamIdForManage) {
      this.teamsService.getTeamMembers(this.selectedTeamIdForManage).subscribe(data => 
        this.currentTeamMembers.set(data) 
      );
    }
  }

  addMemberToTeam() {
    if (this.selectedTeamIdForManage && this.selectedUserIdToAdd) {
      this.teamsService.addMemberToTeam(this.selectedTeamIdForManage, this.selectedUserIdToAdd).subscribe({
        next: () => {
          this.alertMessage.set('החבר נוסף בהצלחה!'); 
          this.loadTeams(); 
          this.loadCurrentTeamMembers();
          this.selectedUserIdToAdd = null;
        },
        error: () => this.alertMessage.set('שגיאה בהוספת חבר')
      });
    }
  }

  removeMember(userId: any) {
    if (!this.selectedTeamIdForManage) return;
    if (confirm('האם להסיר את החבר מהצוות?')) {
      this.teamsService.removeMemberFromTeam(this.selectedTeamIdForManage, Number(userId)).subscribe({
        next: () => {
          this.loadTeams(); 
          this.loadCurrentTeamMembers(); 
        },
        error: () => this.alertMessage.set('שגיאה בהסרת חבר')
      });
    }
  }

  createNewTeam(name: string) {
    if (!name) return;
    this.teamsService.createTeam(name).subscribe({
      next: () => this.loadTeams(),
      error: (err) => console.error(err)
    });
  }
}