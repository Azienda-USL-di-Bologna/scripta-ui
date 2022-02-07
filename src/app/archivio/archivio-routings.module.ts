import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { ArchivioComponent } from "./archivio.component";

const routes: Routes = [
  {
    path: "",
    component: ArchivioComponent,
    children: []
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ArchivioRoutingModule { }
