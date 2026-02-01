import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TeamsService } from '../../services/teams.service';
import { Project } from '../../models/project.model';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-all-projects',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './all-projects.html',
  styleUrl: './all-projects.css',
})
export class AllProjects implements OnInit {

  projects = signal<Project[]>([]);
  searchTerm = signal('');
  
 
  showTeamModal = false;
  selectedTeamIdForManage: number | null = null;
  allUsersList = signal<User[]>([]);
  currentTeamMembers = signal<User[]>([]);
  selectedUserIdToAdd: string | number | null = null;

  alertMessage = signal<string>(''); 

  private teamsService = inject(TeamsService);
  private router = inject(Router);

  ngOnInit(): void { 
    this.loadAllProjects(); 
  }

  loadAllProjects(): void {
    this.teamsService.getAllProjects().subscribe({
      next: (data) => this.projects.set(data || []),
      error: (err) => console.error('Failed to load all projects', err)
    });
  }


  filteredProjects = computed(() => {
    const term = this.searchTerm().toLowerCase();
    return this.projects().filter(p => p.name.toLowerCase().includes(term));
  });

  enterProject(projectId: string | number | undefined): void {
    if (projectId) {
      this.router.navigate(['/tasks', projectId]);
    }
  }

  onDeleteProject(projectId: string | number | undefined, event: Event): void {
    event.stopPropagation();
    if (!projectId) return;

    if (confirm('האם אתה בטוח שברצונך למחוק פרויקט זה?')) {
      this.teamsService.deleteProject(Number(projectId)).subscribe({
        next: () => {
          this.projects.update(list => list.filter(p => p.id !== projectId && p._id !== projectId));
        },
        error: (err) => console.error('Delete failed', err)
      });
    }
  }

  openManageTeamModal(project: Project, event: Event): void {
    event.stopPropagation();
    const teamId = project.team_id || (project as any).teamId;
    
    if (teamId) {
      this.selectedTeamIdForManage = Number(teamId);
      this.showTeamModal = true;
      this.alertMessage.set(''); 
      this.loadAllUsers();
      this.loadCurrentTeamMembers();
    }
  }

  loadAllUsers(): void {
    this.teamsService.getAllUsers().subscribe(data => this.allUsersList.set(data || []));
  }

  loadCurrentTeamMembers(): void {
    if (this.selectedTeamIdForManage) {
      this.teamsService.getTeamMembers(this.selectedTeamIdForManage).subscribe({
        next: (data) => this.currentTeamMembers.set(data || []),
        error: (err) => console.error('Failed to load members', err)
      });
    }
  }

  addMemberToProjectTeam(): void {
    if (!this.selectedUserIdToAdd || !this.selectedTeamIdForManage) {
      this.alertMessage.set('נא לבחור משתמש');
      return;
    }
    
    this.teamsService.addMemberToTeam(this.selectedTeamIdForManage, Number(this.selectedUserIdToAdd)).subscribe({
      next: () => {
        this.alertMessage.set('המשתמש נוסף בהצלחה!');
        this.loadCurrentTeamMembers();
        this.selectedUserIdToAdd = null;
      },
      error: () => this.alertMessage.set('שגיאה בהוספת המשתמש')
    });
  }

  closeModal(): void {
    this.showTeamModal = false;
    this.selectedTeamIdForManage = null;
    this.alertMessage.set('');
  }
}