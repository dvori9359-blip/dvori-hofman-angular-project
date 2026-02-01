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
  selectedUserIdToAdd: number | null = null;

  private teamsService = inject(TeamsService);
  private router = inject(Router);

  ngOnInit() { this.loadAllProjects(); }

  loadAllProjects() {
    this.teamsService.getAllProjects().subscribe(data => this.projects.set(data));
  }

  filteredProjects = computed(() => {
    const term = this.searchTerm().toLowerCase();
    return this.projects().filter(p => p.name.toLowerCase().includes(term));
  });

  onDeleteProject(projectId: any, event: Event) {
    event.stopPropagation();
    if (confirm('למחוק פרויקט זה?')) {
      this.teamsService.deleteProject(Number(projectId)).subscribe(() => {
        this.projects.update(list => list.filter(p => p.id !== projectId && p._id !== projectId));
      });
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
      this.teamsService.getTeamMembers(this.selectedTeamIdForManage).subscribe(data => this.currentTeamMembers.set(data));
    }
  }
}