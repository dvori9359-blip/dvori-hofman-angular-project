import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { ActivatedRoute, Router } from '@angular/router'; 
import { FormsModule } from '@angular/forms';
import { TeamsService } from '../../services/teams.service'; 
import { Project } from '../../models/project.model';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule, FormsModule], 
  templateUrl: './projects.html',
  styleUrls: ['./projects.css'], 
})
export class Projects implements OnInit { 
  projectsList = signal<Project[]>([]); 
  currentTeamId: number | null = null;
  showAddModal = false;
  newProjectName = '';

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private teamsService = inject(TeamsService); 

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const teamId = params.get('teamId');
      if (teamId) {
        this.currentTeamId = +teamId; 
        this.loadProjects();
      }
    });
  }

  loadProjects(): void {
    if (this.currentTeamId) {
      this.teamsService.getProjectsByTeam(this.currentTeamId).subscribe({
        next: (data: Project[]) => this.projectsList.set(data || []),
        error: (err) => console.error('Error loading projects:', err)
      });
    }
  }

  createProject(): void {
    if (!this.newProjectName.trim() || this.currentTeamId === null) return;

    this.teamsService.createProject(this.currentTeamId, this.newProjectName).subscribe({
      next: (newProject: Project) => {
        this.projectsList.update((projects) => [...projects, newProject]);
        this.newProjectName = '';
        this.showAddModal = false;
      },
      error: (err) => console.error('Error creating project:', err)
    });
  }

  onDeleteProject(projectId: any, event: Event): void {
    event.stopPropagation(); 
    
    if (confirm('האם אתה בטוח שברצונך למחוק פרויקט זה?')) {
      const idToDelete = Number(projectId);
      this.teamsService.deleteProject(idToDelete).subscribe({
        next: () => {
          this.projectsList.update(pList => pList.filter(p => p.id !== projectId && p._id !== projectId));
        },
        error: (err) => alert('המחיקה נכשלה: ' + (err.error?.message || 'אין הרשאה'))
      });
    }
  }

 enterProject(projectId: string | number | undefined): void {
  if (projectId) {
    this.router.navigate(['/tasks', projectId]);  
  }
}
}