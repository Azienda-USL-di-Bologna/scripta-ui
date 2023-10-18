import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { RefreshLoggedUserGuard, LoginGuard, NoLoginGuard, JwtLoginComponent, LoggedOutPageComponent } from "@bds/jwt-login";
import { LOGIN_ROUTE, LOGGED_OUT_ROUTE, DOC_ROUTE, HOME_ROUTE, NAVIGATION_TABS_ROUTE } from "src/environments/app-constants";
import { PageNotFoundComponent } from "@bds/common-components";
import { LottiListComponent } from './doc/trasparenza/lotti-list/lotti-list.component';

const routes: Routes = [
  { path: "", redirectTo: NAVIGATION_TABS_ROUTE, pathMatch: "full" },
  { path: HOME_ROUTE, redirectTo: NAVIGATION_TABS_ROUTE },
  { path: LOGIN_ROUTE, component: JwtLoginComponent, canActivate: [NoLoginGuard], data: {} },
  { path: LOGGED_OUT_ROUTE, component: LoggedOutPageComponent },
  { 
    path: "lotti-list", loadChildren: () => import("./doc/trasparenza/lotti-list/lotti-list.module").then(m => m.LottiListModule), 
    component: LottiListComponent, 
    canActivate: [RefreshLoggedUserGuard, LoginGuard]
  },
  { path: DOC_ROUTE, loadChildren: () => import("./doc/doc.module").then(m => m.DocModule), canActivate: [RefreshLoggedUserGuard, LoginGuard] },
  { path: NAVIGATION_TABS_ROUTE, loadChildren: () => import("./navigation-tabs/navigation-tabs.module").then(m => m.NavigationTabsModule), canActivate: [RefreshLoggedUserGuard, LoginGuard] },
  { path: "**", component: PageNotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
