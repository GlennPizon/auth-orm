import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ListComponent } from './list.component';
import { AddEditComponent } from './add-edit.component';

const routes: Routes = [
    { path: '', component: ListComponent },         // Fixed: Added opening {
    { path: 'add', component: AddEditComponent },   // Fixed: Added opening {
    { path: 'edit/:id', component: AddEditComponent } // Fixed: Added opening {
];

@NgModule({
    imports: [RouterModule.forChild(routes)],  // Fixed: forEach → forChild
    exports: [RouterModule]
})  // Fixed: Added closing )
export class AccountsRoutingModule { }  // Fixed: Added closing }