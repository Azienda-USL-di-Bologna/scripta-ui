import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { PrimeNgModule } from "../../primeng.module";
import { ScriptaCommonModule } from "../../scripta-common.module";
import { DettaglioArchivioComponent } from "../dettaglio-archivio/dettaglio-archivio.component";
import { ResponsabiliComponent } from "./responsabili/responsabili.component";
import { PermessiStrutturaComponent } from './permessi-struttura/permessi-struttura.component';
import { PermessiPersonaComponent } from './permessi-persona/permessi-persona.component';

@NgModule({
  imports: [
    CommonModule,
    PrimeNgModule,
    ScriptaCommonModule
  ],
  declarations: [
    DettaglioArchivioComponent,
    ResponsabiliComponent,
    PermessiStrutturaComponent,
    PermessiPersonaComponent
  ],
  exports: [
    DettaglioArchivioComponent
  ],
  providers: [
  ]
})
export class DettaglioArchivioModule { }
