import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Task, Comment } from '../models/task.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class TasksService {
  private apiUrl = `${environment.apiUrl}/tasks`;
  private commentsUrl = `${environment.apiUrl}/comments`;
  private http = inject(HttpClient);

  getTasks(projectId: string): Observable<Task[]> {
    const params = new HttpParams().set('projectId', projectId);
    return this.http.get<Task[]>(this.apiUrl, { params });
  }

  createTask(task: Partial<Task>): Observable<Task> {
    return this.http.post<Task>(this.apiUrl, task);
  }

  updateTask(taskId: string, updates: Partial<Task>): Observable<Task> {
    return this.http.patch<Task>(`${this.apiUrl}/${taskId}`, updates);
  }

  deleteTask(taskId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${taskId}`);
  }

  getComments(taskId: string): Observable<Comment[]> {
    const params = new HttpParams().set('taskId', taskId);
    return this.http.get<Comment[]>(this.commentsUrl, { params });
  }

  addComment(taskId: string | number, text: string): Observable<Comment> {
    return this.http.post<Comment>(this.commentsUrl, { taskId, body: text });
  }
}