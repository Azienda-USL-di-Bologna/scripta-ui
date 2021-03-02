import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { InputTextareaModule } from "primeng-lts/inputtextarea";
import { FormsModule } from "@angular/forms";
import { MittenteComponent } from "./mittente/mittente.component";
import { DestinatariComponent } from "./destinatari/destinatari.component";
import { AllegatiComponent } from "./allegati/allegati.component";
import { DocComponent } from "./doc/doc.component";
import { ButtonModule } from "primeng-lts/button";
import { MessageService } from "primeng-lts/api";
import { ToastModule } from "primeng-lts/toast";
import { PrimengPluginModule, ProfiloComponent } from "@bds/primeng-plugin";
import { NtJwtLoginModule } from "@bds/nt-jwt-login";
import { loginModuleConfig } from "./config/module-config";
import { NtCommunicatorModule } from "@bds/nt-communicator";
import { HomeComponent } from "./home/home.component";
import { DialogService } from "primeng-lts/dynamicdialog";
import { DialogModule } from "primeng-lts/dialog";
import { DatePipe } from "@angular/common";

/* Registro la data italiana */
import { LOCALE_ID } from "@angular/core";
import { registerLocaleData } from "@angular/common";
import localeIt from "@angular/common/locales/it";
import localeItExtra from "@angular/common/locales/extra/it";
import { PrimeNgModule } from "./primeng.module";


registerLocaleData(localeIt, "it-IT", localeItExtra);

@NgModule({
  declarations: [
    AppComponent,
    MittenteComponent,
    DestinatariComponent,
    AllegatiComponent,
    DocComponent,
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
    DialogModule,
    PrimeNgModule
  ],
  providers: [MessageService, DialogService, DatePipe, { provide: LOCALE_ID, useValue: "it-IT" }, ],
  bootstrap: [AppComponent],
  entryComponents: [ProfiloComponent]
})
export class AppModule { }
