import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { PrimeNgModule } from "../primeng.module";
import { ScriptaCommonModule } from "../scripta-common.module";
import { ArchivioComponent } from "./archivio.component";
import { ArchivioRoutingModule } from "./archivio-routings.module";
import { ArchivioTreeComponent } from "./archivio-tree/archivio-tree.component";
import { GenericCaptionTableModule } from "../generic-caption-table/generic-caption-table.module";
import { ArchiviListModule } from "../archivi-list-container/archivi-list/archivi-list.module";
import { DocsListModule } from "../docs-list-container/docs-list/docs-list.module";
import { RichiestaAccessoArchiviComponent } from "./richiesta-accesso-archivi/richiesta-accesso-archivi.component"
import { DettaglioArchivioModule } from "./dettaglio-archivio/dettaglio-archivio.module";
import { BlackboxPermessiService } from "@bds/internauta-model";
import { DocDetailAndPreviewModule } from "../docs-list-container/doc-detail-and-preview/doc-detail-and-preview.module";
import { CommonComponentsModule } from "@bds/common-components";

@NgModule({
  imports: [
    CommonModule,
    CommonComponentsModule,
    ArchivioRoutingModule,
    PrimeNgModule,
    ScriptaCommonModule,
    GenericCaptionTableModule,
    DocsListModule,
    DocDetailAndPreviewModule,
    ArchiviListModule,
    DettaglioArchivioModule
  ],
  declarations: [
    ArchivioComponent,
    ArchivioTreeComponent,
    RichiestaAccessoArchiviComponent
  ],
  exports: [
  ],
  providers: [
    BlackboxPermessiService
  ]
})
export class ArchivioModule { }
