import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { DOCS_LIST_ROUTE, ARCHIVI_LIST_ROUTE, ARCHIVIO_ROUTE } from "src/environments/app-constants";
import { NavigationTabsComponent } from "./navigation-tabs.component";

const routes: Routes = [
  {
    path: "",
    component: NavigationTabsComponent,
    children: [
      {
        path: DOCS_LIST_ROUTE, 
        loadChildren: () => import("../docs-list-container/docs-list/docs-list.module").then(m => m.DocsListModule)
      },
      {
        path: ARCHIVI_LIST_ROUTE,
        loadChildren: () => import("../archivi-list-container/archivi-list/archivi-list.module").then(m => m.ArchiviListModule)
      },
      {
        path: ARCHIVIO_ROUTE,
        loadChildren: () => import("../archivio/archivio.module").then(m => m.ArchivioModule)
      }
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class NavigationTabsRoutingModule { }
