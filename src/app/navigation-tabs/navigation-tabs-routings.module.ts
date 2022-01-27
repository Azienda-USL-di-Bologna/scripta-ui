import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { DOCS_LIST_ROUTE, FASCICOLI_ROUTE } from "src/environments/app-constants";
import { NavigationTabsComponent } from "./navigation-tabs.component";
import { RefreshLoggedUserGuard, LoginGuard } from "@bds/nt-jwt-login";

const routes: Routes = [
  {
    path: "",
    component: NavigationTabsComponent,
    children: [
      {
        path: DOCS_LIST_ROUTE, 
        loadChildren: () => import("../docs-list/docs-list.module").then(m => m.DocsListModule)
      },
      {
        path: FASCICOLI_ROUTE,
        loadChildren: () => import("../archivi-list/archivi-list.module").then(m => m.ArchiviListModule)
      }
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class NavigationTabsRoutingModule { }
