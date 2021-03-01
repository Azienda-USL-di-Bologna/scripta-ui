import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PeisComponent } from './i-doc/peis/peis.component';
import { MittenteComponent } from './mittente/mittente.component';
import { DestinatariComponent } from './destinatari/destinatari.component';
import { AllegatiComponent } from './allegati/allegati.component';
import { IDocComponent } from './i-doc/i-doc.component';
import { RefreshLoggedUserGuard, LoginGuard, NoLoginGuard, NtJwtLoginComponent, LoggedOutPageComponent } from '@bds/nt-jwt-login';
import { HomeComponent } from './home/home.component';
import { LOGIN_ROUTE, LOGGED_OUT_ROUTE, IDOCX_ROUTE, HOME_ROUTE } from 'src/environments/app-constants';
import { PageNotFoundComponent } from '@bds/common-components';


const routes: Routes = [
    {path: '', redirectTo: IDOCX_ROUTE, pathMatch: 'full'},
    {path: IDOCX_ROUTE, component: IDocComponent, canActivate: [RefreshLoggedUserGuard, LoginGuard]},
    {path: HOME_ROUTE, component: HomeComponent},
    {path: LOGIN_ROUTE, component: NtJwtLoginComponent, canActivate: [NoLoginGuard], data: {}},
    {path: LOGGED_OUT_ROUTE, component: LoggedOutPageComponent},
    {path: '**', component: PageNotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
