import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../environments/environment'; 
import { Team } from '../models/team.model';
import { User } from '../models/user.model';
import { Project } from '../models/project.model';

@Injectable({ providedIn: 'root' })
export class TeamsService {

  private apiUrl = environment.apiUrl;
  private projectsUrl = `${this.apiUrl}/projects`; 
  private teamsUrl = `${this.apiUrl}/teams`; 
  private usersUrl = `${this.apiUrl}/users`; 
  
  private http = inject(HttpClient); 

  // --- קריאות לצוותים ---

  getTeams(): Observable<Team[]> {
    return this.http.get<Team[]>(this.teamsUrl); 
  }

  createTeam(name: string): Observable<Team> {
    return this.http.post<Team>(this.teamsUrl, { name }); 
  }

  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.usersUrl);
  }

  getTeamMembers(teamId: number): Observable<User[]> {
    return this.http.get<User[]>(`${this.teamsUrl}/${teamId}/members`);
  }

  addMemberToTeam(teamId: number, userId: number): Observable<any> {
    return this.http.post(`${this.teamsUrl}/${teamId}/members`, { userId });
  }

  removeMemberFromTeam(teamId: number, userId: number): Observable<any> {
    return this.http.delete(`${this.teamsUrl}/${teamId}/members/${userId}`); 
  }

  // --- קריאות לפרויקטים ---

  getAllProjects(): Observable<Project[]> {
    return this.http.get<Project[]>(this.projectsUrl);
  }

  getProjectsByTeam(teamId: number): Observable<Project[]> {
    return this.http.get<Project[]>(this.projectsUrl).pipe(
      map(projects => projects.filter(p => p.team_id == teamId.toString())) 
    );
  }

  createProject(teamId: number, name: string): Observable<Project> {
    const payload = { name: name };
    console.log('Trying Alternative Path...');

    return this.http.post<Project>(this.projectsUrl, { 
      ...payload,
      teamId: teamId, 
      team_id: teamId 
    } as any);
  }

  deleteProject(projectId: number): Observable<void> {
    return this.http.delete<void>(`${this.projectsUrl}/${projectId}`); 
  }
}