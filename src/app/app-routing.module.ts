import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { RefreshLoggedUserGuard, LoginGuard, NoLoginGuard, NtJwtLoginComponent, LoggedOutPageComponent } from "@bds/nt-jwt-login";
import { HomeComponent } from "./home/home.component";
import { LOGIN_ROUTE, LOGGED_OUT_ROUTE, DOC_ROUTE, HOME_ROUTE } from "src/environments/app-constants";
import { PageNotFoundComponent } from "@bds/common-components";
import { MittenteComponent } from "./doc/mittente/mittente.component";

const routes: Routes = [
    {path: "", redirectTo: HOME_ROUTE, pathMatch: "full"},
  { path: HOME_ROUTE, component: HomeComponent },
  { path: "mittente", component: MittenteComponent },//da togliere e mettere per bene
    {path: LOGIN_ROUTE, component: NtJwtLoginComponent, canActivate: [NoLoginGuard], data: {}},
    {path: LOGGED_OUT_ROUTE, component: LoggedOutPageComponent},
    {path: DOC_ROUTE, loadChildren: () => import("./doc/doc.module").then(m => m.DocModule), canActivate: [RefreshLoggedUserGuard, LoginGuard]},
    {path: "**", component: PageNotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
