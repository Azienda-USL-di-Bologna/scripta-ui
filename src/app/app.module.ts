import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { PeisComponent } from './i-doc/peis/peis.component';
import { InputTextareaModule } from 'primeng-lts/inputtextarea';
import {InputTextModule} from 'primeng-lts/inputtext';
import { FormsModule } from '@angular/forms';
import { MittenteComponent } from './mittente/mittente.component';
import { DestinatariComponent } from './destinatari/destinatari.component';
import { AllegatiComponent } from './allegati/allegati.component';
import { IDocComponent } from './i-doc/i-doc.component';
import { ButtonModule } from 'primeng-lts/button';
import { MessageService } from 'primeng-lts/api';
import { ToastModule } from 'primeng-lts/toast';
import { PrimengPluginModule, ProfiloComponent } from '@bds/primeng-plugin';
import { Documento, Registro, DocumentoRegistro } from '@bds/ng-internauta-model';
import { NtJwtLoginComponent, NtJwtLoginModule } from '@bds/nt-jwt-login';
import { loginModuleConfig } from './config/module-config';
import { RouterModule } from '@angular/router';
import { NtCommunicatorModule } from '@bds/nt-communicator';
import { HomeComponent } from './home/home.component';
import { DialogService } from 'primeng-lts/dynamicdialog';
import { DialogModule } from 'primeng-lts/dialog';
import { DatePipe } from '@angular/common';


/* Registro la data italiana */
import { LOCALE_ID } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeIt from '@angular/common/locales/it';
import localeItExtra from '@angular/common/locales/extra/it';


registerLocaleData(localeIt, 'it-IT', localeItExtra);

@NgModule({
  declarations: [
    AppComponent,
    PeisComponent,
    MittenteComponent,
    DestinatariComponent,
    AllegatiComponent,
    IDocComponent,
    HomeComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ButtonModule,
    FormsModule,
    InputTextareaModule,
    ToastModule,
    BrowserAnimationsModule,
    PrimengPluginModule,
    NtJwtLoginModule.forRoot(loginModuleConfig),
    NtCommunicatorModule,
    DialogModule

  ],
  providers: [MessageService, DialogService, DatePipe, { provide: LOCALE_ID, useValue: 'it-IT' }, ],
  bootstrap: [AppComponent],
  entryComponents: [ProfiloComponent]
})
export class AppModule { }
