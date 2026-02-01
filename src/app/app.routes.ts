import { Routes } from '@angular/router';
import { Login } from './components/login/login';
import { Teams } from './components/teams/teams';
import { Projects } from './components/projects/projects';
import { Tasks } from './components/tasks/tasks';
import { Settings } from './components/settings/settings';
import { AllProjects } from './components/all-projects/all-projects'; // <--- וודא שהנתיב לקובץ מדויק
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'teams', component: Teams, canActivate: [authGuard] },
  { path: 'teams/:teamId', component: Projects, canActivate: [authGuard] },
  { path: 'AllProjects', component: AllProjects, canActivate: [authGuard] },
  { path: 'tasks/:projectId', component: Tasks, canActivate: [authGuard] },
  { path: 'settings', component: Settings, canActivate: [authGuard] },
  { path: '**', redirectTo: '/login' }
];