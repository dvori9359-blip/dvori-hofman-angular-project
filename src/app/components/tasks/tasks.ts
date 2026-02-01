import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { FormsModule } from '@angular/forms'; 
import { ActivatedRoute } from '@angular/router';

// Services
import { TasksService } from '../../services/tasks.service'; 
import { TeamsService } from '../../services/teams.service';

// Models
import { Task, Comment } from '../../models/task.model';
import { User } from '../../models/user.model';
import { Project } from '../../models/project.model';

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [CommonModule, FormsModule], 
  templateUrl: './tasks.html', 
  styleUrls: ['./tasks.css']   
})
export class Tasks implements OnInit {

  tasksList = signal<Task[]>([]);
  teamMembers = signal<User[]>([]); 
  comments = signal<Comment[]>([]);
  projectId: string | null = null;
  selectedTask: Task | null = null;
  
  newCommentText = '';
  isCommentMode = false; 
  showCreateModal = false;
  newTaskTitle = '';
  newTaskStatus: 'Todo' | 'In Progress' | 'Done' = 'Todo';

  private route = inject(ActivatedRoute);
  private tasksService = inject(TasksService);
  private teamsService = inject(TeamsService);

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.projectId = params.get('projectId');
      if (this.projectId) {
        this.loadTasks();
        this.findTeamAndLoadMembers();
      }
    });
  }

  loadTasks(): void {
    if (this.projectId) {
      this.tasksService.getTasks(this.projectId).subscribe({
        next: (data) => this.tasksList.set(data || []),
        error: (err) => console.error('Error loading tasks:', err)
      });
    }
  }

  findTeamAndLoadMembers(): void {
    this.teamsService.getAllProjects().subscribe((projects: Project[]) => {
      const currentProj = projects.find(p => p.id === this.projectId || p._id === this.projectId);
      const teamId = currentProj?.team_id || (currentProj as any)?.teamId;
      
      if (teamId) {
        this.teamsService.getTeamMembers(Number(teamId)).subscribe({
          next: (members) => this.teamMembers.set(members || []),
          error: (err) => console.error('Error loading members:', err)
        });
      }
    });
  }

  createNewTask(): void {
    if (!this.newTaskTitle.trim() || !this.projectId) return;
  
    const taskData: Partial<Task> = { 
      title: this.newTaskTitle, 
      project_id: this.projectId, 
      status: this.newTaskStatus 
    };

    this.tasksService.createTask(taskData).subscribe({
      next: () => {
        this.showCreateModal = false;
        this.newTaskTitle = '';
        this.loadTasks();
      }
    });
  }

  openTaskModal(task: Task, commentMode = false): void {
    this.selectedTask = { ...task };
    this.isCommentMode = commentMode;

    const tId = task.id || task._id; 
    if (tId) {
      this.tasksService.getComments(tId).subscribe(c => this.comments.set(c || []));
    }
  }

  saveTaskChanges(): void {
    if (!this.selectedTask) return;
    
    const tId = this.selectedTask.id || this.selectedTask._id;
    if (!tId) return;
    const { id, _id, ...updates } = this.selectedTask;

    this.tasksService.updateTask(tId, updates).subscribe({
      next: () => {
        this.selectedTask = null;
        this.loadTasks();
      }
    });
  }

  sendComment(): void {
    if (!this.newCommentText.trim() || !this.selectedTask) return;
    
    const tId = this.selectedTask.id || this.selectedTask._id;
    if (tId) {
      this.tasksService.addComment(tId, this.newCommentText).subscribe(res => {
        this.comments.update(old => [...old, res]);
        this.newCommentText = '';
      });
    }
  }

  deleteTask(taskId: string | undefined): void {
    if (!taskId) return;
    if (confirm('האם למחוק משימה זו?')) {
      this.tasksService.deleteTask(taskId).subscribe(() => {
        this.selectedTask = null;
        this.loadTasks();
      });
    }
  }

  getTasksByStatus(status: string): Task[] {
    return this.tasksList().filter(t => t.status?.toLowerCase() === status.toLowerCase());
  }

  closeModals(): void {
    this.showCreateModal = false;
    this.selectedTask = null;
    this.isCommentMode = false;
  }
}