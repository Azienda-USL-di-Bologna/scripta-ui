import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { TipComponent } from "@bds/common-components";
import { CODICI_RUOLO } from "@bds/internauta-model";
import { DOCS_LIST_ROUTE, ARCHIVI_LIST_ROUTE, ARCHIVIO_ROUTE, ARCHIVIO_DA_SCRIVANIA_ROUTE, TIP_ROUTE, DOC_DOC_ROUTE } from "src/environments/app-constants";
import { RoleGuard } from "../guards/role-guard";
import { NavigationTabsComponent } from "./navigation-tabs.component";
import { DocsDocsComponent } from "../doc/docs-docs/docs-docs.component";

const routes: Routes = [
  {
    path: "",
    component: NavigationTabsComponent,
    children: [
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
      },
      {
        path: ARCHIVIO_DA_SCRIVANIA_ROUTE,
        loadChildren: () => import("../archivi-list-container/archivi-list-container.module").then(m => m.ArchiviListContainerModule)
      },
      {
        path: TIP_ROUTE,
        component: TipComponent,
        canActivate: [RoleGuard], data: {roles: [CODICI_RUOLO.IP]}
        //loadChildren: () => import("../tip/tip.module").then(m => m.TipModule)
      }
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class NavigationTabsRoutingModule { }
