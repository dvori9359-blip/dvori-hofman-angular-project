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

  createProject(name: string): void {
    if (!name.trim()) {
      alert('Please enter a project name');
      return;
    }
    if (!this.currentTeamId) {
      console.error('Missing Team ID');
      return;
    }

    this.teamsService.createProject(this.currentTeamId, name).subscribe({
      next: (newProject: Project) => {
        console.log('Project created successfully:', newProject);
        this.projectsList.update((projects) => [...projects, newProject]);
      },
      error: (err) => {
        console.error('Server Error:', err);
        const msg = err.error?.message || JSON.stringify(err.error) || 'Unknown Error';
        alert('Failed to save project: ' + msg);
      }
    });
  }

  onDeleteProject(projectId: any, event: Event): void {
    event.stopPropagation(); 
    if (confirm('Are you sure you want to delete this project?')) {
      const idToDelete = Number(projectId); 
      this.teamsService.deleteProject(idToDelete).subscribe({
        next: () => {
          this.projectsList.update(pList => pList.filter(p => (p.id || p._id) !== projectId));
        },
        error: (err) => alert('Deletion failed')
      });
    }
  }

  enterProject(projectId: string | number | undefined): void {
    if (projectId) {
      this.router.navigate(['/tasks', projectId]);  
    }
  }
}