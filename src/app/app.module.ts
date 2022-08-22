import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { PrimengPluginModule } from "@bds/primeng-plugin";
import { CommonComponentsModule, ProfiloComponent } from "@bds/common-components";
import { JwtLoginModule } from "@bds/jwt-login";
import { loginModuleConfig } from "./config/module-config";
import { CommonToolsModule } from "@bds/common-tools";
import { HomeComponent } from "./home/home.component";
import { DatePipe, TitleCasePipe } from "@angular/common";


/* Registro la data italiana */
import { LOCALE_ID } from "@angular/core";
import { registerLocaleData } from "@angular/common";
import localeIt from "@angular/common/locales/it";
import localeItExtra from "@angular/common/locales/extra/it";
import { PrimeNgModule } from "./primeng.module";
import { ScriptaCommonModule } from "./scripta-common.module";

registerLocaleData(localeIt, "it-IT", localeItExtra);

@NgModule({
    declarations: [
        AppComponent,
        HomeComponent
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        AppRoutingModule,
        PrimengPluginModule,
        JwtLoginModule.forRoot(loginModuleConfig),
        PrimeNgModule,
        ScriptaCommonModule,
        CommonComponentsModule,
        CommonToolsModule
    ],
    providers: [
        DatePipe,
        TitleCasePipe,
        { provide: LOCALE_ID, useValue: "it-IT" },
    ],
    bootstrap: [AppComponent],
    exports: [CommonComponentsModule]
})
export class AppModule { }
