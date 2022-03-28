import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { DOCS_LIST_ROUTE, ARCHIVI_LIST_ROUTE, ARCHIVIO_ROUTE } from "src/environments/app-constants";
import { NavigationTabsComponent } from "./navigation-tabs.component";

const routes: Routes = [
  {
    path: "",
    component: NavigationTabsComponent,
    /* children: [
      {
        path: DOCS_LIST_ROUTE, 
        loadChildren: () => import("../docs-list-container/docs-list-container.module").then(m => m.DocsListContainerModule)
      },
      {
        path: ARCHIVI_LIST_ROUTE,
        loadChildren: () => import("../archivi-list-container/archivi-list-container.module").then(m => m.ArchiviListContainerModule)
      },
      {
        path: ARCHIVIO_ROUTE,
        loadChildren: () => import("../archivio/archivio.module").then(m => m.ArchivioModule)
      }
    ] */
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class NavigationTabsRoutingModule { }
