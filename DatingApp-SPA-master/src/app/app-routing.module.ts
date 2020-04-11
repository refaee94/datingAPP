import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { MemberListComponent } from './members/member-list/member-list.component';
import { ListsComponent } from './lists/lists.component';
import { MessagesComponent } from './messages/messages.component';
import { AuthGuard } from './_guards/auth.guard';
import { PreventUnsavedChanges } from './_guards/prevent-unsaved-changes.guard';
import { MemberDetailComponent } from './members/member-detail/member-detail.component';
import { MemberDetailResolver } from './_resolvers/member-detail.resolver';
import { MemberListReslover } from './_resolvers/member-list.resolver';
import { MemberEditComponent } from './members/member-edit/member-edit.component';
import { MemberEditResolver } from './_resolvers/member-edit.resolver';
import { ListsReslover } from './_resolvers/lists.resolver';
import { MessageReslover } from './_resolvers/message.resolver';

const routes: Routes = [
  { path: 'home', component: HomeComponent },
  {
    path: '',
    runGuardsAndResolvers: 'always',
    canActivate: [AuthGuard],
    children: [
      { path: 'members', component: MemberListComponent, resolve: {paginatedResult: MemberListReslover} },
      { path: 'members/:id', component: MemberDetailComponent, resolve: {user: MemberDetailResolver}},
      { path: 'lists', component: ListsComponent, resolve: {paginatedResult: ListsReslover} },
      { path: 'messages', component: MessagesComponent, resolve: {messagePaginatedResult: MessageReslover}},
      { path: 'member/edit', component: MemberEditComponent, resolve: {user: MemberEditResolver}, canDeactivate: [PreventUnsavedChanges]}
    ]
  },
  { path: '**', redirectTo: 'home', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
