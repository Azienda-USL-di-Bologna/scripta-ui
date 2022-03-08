import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { PrimeNgModule } from "../primeng.module";
import { ScriptaCommonModule } from "../scripta-common.module";
import { ArchivioComponent } from "./archivio.component";
import { ArchivioRoutingModule } from "./archivio-routings.module";
import { DettaglioArchivioComponent } from "./dettaglio-archivio/dettaglio-archivio.component";

@NgModule({
  imports: [
    CommonModule,
    ArchivioRoutingModule,
    PrimeNgModule,
    ScriptaCommonModule
  ],
  declarations: [
    ArchivioComponent,
    DettaglioArchivioComponent
  ],
  providers: []
})
export class ArchivioModule { }
