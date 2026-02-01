import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TeamsService } from '../../services/teams.service';
import { Project } from '../../models/project.model';

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
  showAddModal = false;
  newProjectName = '';
  
  // ניתן לשנות ל-ID של צוות ברירת מחדל קיים במערכת שלך
  defaultTeamId = 1; 

  private teamsService = inject(TeamsService);
  private router = inject(Router);

  ngOnInit(): void { 
    this.loadAllProjects(); 
  }

  loadAllProjects(): void {
    this.teamsService.getAllProjects().subscribe({
      next: (data) => this.projects.set(data || []),
      error: (err) => console.error('Failed to load projects', err)
    });
  }

  filteredProjects = computed(() => {
    const term = this.searchTerm().toLowerCase();
    return this.projects().filter(p => p.name.toLowerCase().includes(term));
  });

  createProject(): void {
    if (!this.newProjectName.trim()) return;

    this.teamsService.createProject(this.defaultTeamId, this.newProjectName).subscribe({
      next: (newProj) => {
        this.projects.update(list => [...list, newProj]);
        this.newProjectName = '';
        this.showAddModal = false;
      },
      error: (err) => console.error('Creation failed', err)
    });
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

  enterProject(projectId: string | number | undefined): void {
    if (projectId) {
      this.router.navigate(['/tasks', projectId]);
    }
  }
}