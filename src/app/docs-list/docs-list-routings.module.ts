import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { DocsListComponent } from "./docs-list.component";

const routes: Routes = [
  {
    path: "",
    component: DocsListComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DocsListRoutingModule { }
