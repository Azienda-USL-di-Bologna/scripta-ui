import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { DocRoutingModule } from "./doc-routings.module";
import { DocComponent } from "./doc.component";
import { PrimeNgModule } from "../primeng.module";
import { ScriptaCommonModule } from "../scripta-common.module";
import { ExtendedDocService } from "./extended-doc.service";
import { MittenteComponent} from "./mittente/mittente.component";
import { DestinatariComponent } from "./destinatari/destinatari.component";
import { AllegatiComponent } from "./allegati/allegati.component";
import { ExtendedDestinatariService } from "./destinatari/extended-destinatari.service";
import { ExtendedMittenteService } from "./mittente/extended-mittente.service";
import { ExtendedAllegatoService } from "./allegati/extended-allegato.service";
import { AttoriComponent } from './attori/attori.component';
import { DatiPubblicazioneComponent } from './dati-pubblicazione/dati-pubblicazione.component'
import { ArchivioDocComponent } from './archivio-doc/archivio-doc.component';
import { AttachmentsBoxModule } from "@bds/common-components";
import { DocUtilsService } from "../utilities/doc-utils.service";


@NgModule({
  imports: [
    CommonModule,
    DocRoutingModule,
    PrimeNgModule,
    ScriptaCommonModule,
    AttachmentsBoxModule
  ],
  declarations: [
    DocComponent,
    MittenteComponent,
    DestinatariComponent,
    AllegatiComponent,
    AttoriComponent,
    DatiPubblicazioneComponent,
    ArchivioDocComponent
  ],
  providers: [
    ExtendedDocService,
    ExtendedDestinatariService,
    ExtendedMittenteService,
    ExtendedAllegatoService,
    DocUtilsService
  ],
  exports: [
    DocComponent
  ]
})
export class DocModule { }
