import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { PrimeNgModule } from "../primeng.module";
import { ScriptaCommonModule } from "../scripta-common.module";
import { ArchivioComponent } from "./archivio.component";
import { ArchivioRoutingModule } from "./archivio-routings.module";
import { DettaglioArchivioComponent } from "./dettaglio-archivio/dettaglio-archivio.component";
import { ArchivioTreeComponent } from "./archivio-tree/archivio-tree.component";
import { GenericCaptionTableModule } from "../generic-caption-table/generic-caption-table.module";
import { ArchiviListModule } from "../archivi-list-container/archivi-list/archivi-list.module";
import { DocsListModule } from "../docs-list-container/docs-list/docs-list.module";
import { RichiestaAccessoArchiviComponent } from "./richiesta-accesso-archivi/richiesta-accesso-archivi.component"
@NgModule({
  imports: [
    CommonModule,
    ArchivioRoutingModule,
    PrimeNgModule,
    ScriptaCommonModule,
    GenericCaptionTableModule,
    DocsListModule,
    ArchiviListModule,
  ],
  declarations: [
    ArchivioComponent,
    DettaglioArchivioComponent,
    ArchivioTreeComponent,
    RichiestaAccessoArchiviComponent,
  ],
  exports: [
  ],
  providers: []
})
export class ArchivioModule { }
