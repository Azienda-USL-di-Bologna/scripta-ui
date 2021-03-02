import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { RefreshLoggedUserGuard, LoginGuard, NoLoginGuard, NtJwtLoginComponent, LoggedOutPageComponent } from "@bds/nt-jwt-login";
import { HomeComponent } from "./home/home.component";
import { LOGIN_ROUTE, LOGGED_OUT_ROUTE, DOC_ROUTE, HOME_ROUTE } from "src/environments/app-constants";
import { PageNotFoundComponent } from "@bds/common-components";
import { DocComponent } from "./doc/doc.component";


const routes: Routes = [
    {path: "", redirectTo: DOC_ROUTE, pathMatch: "full"},
    {path: HOME_ROUTE, component: HomeComponent},
    {path: LOGIN_ROUTE, component: NtJwtLoginComponent, canActivate: [NoLoginGuard], data: {}},
    {path: LOGGED_OUT_ROUTE, component: LoggedOutPageComponent},
    {path: DOC_ROUTE, component: DocComponent, canActivate: [RefreshLoggedUserGuard, LoginGuard]},
    {path: "**", component: PageNotFoundComponent }
];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
