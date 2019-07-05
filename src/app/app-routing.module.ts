import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuardService } from 'services/auth-guard.service';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'home',
    loadChildren: './home/home.module#HomePageModule'
  },
  {
    path: 'list',
    loadChildren: './list/list.module#ListPageModule'
  },
  {
    path: 'user-type-selection',
    loadChildren: './user-type-selection/user-type-selection.module#UserTypeSelectionPageModule'
  },
  { path: 'user-and-groups', loadChildren: './user-and-groups/user-and-groups.module#UserAndGroupsPageModule' },
  {
    path: 'resources',
    loadChildren: './resources/resources.module#ResourcesModule',
    canLoad: [AuthGuardService]
  },
  {
    path: 'view-more-activity', loadChildren: './view-more-activity/view-more-activity.module#ViewMoreActivityModule'
  },
  {
    path: 'tabs',
    loadChildren: './tabs/tabs.module#TabsPageModule'
  },
  {
    path: 'settings',
    loadChildren: './settings/settings.module#SettingsPageModule'
  },
  // migration-TODO to be deleted
  { path: 'download-manager', loadChildren: './download-manager/download-manager.module#DownloadManagerPageModule' },
  { path: 'storage-settings', loadChildren: './storage-settings/storage-settings.module#StorageSettingsPageModule' },
  {
    path: 'profile',
    loadChildren: './profile/profile.module#ProfilePageModule'
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes)
  ],
  exports: [RouterModule],
  providers: [ AuthGuardService ],
})
export class AppRoutingModule { }
