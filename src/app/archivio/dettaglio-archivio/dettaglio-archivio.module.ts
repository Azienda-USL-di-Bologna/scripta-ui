import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { PrimeNgModule } from "../primeng.module";
import { ScriptaCommonModule } from "../scripta-common.module";
import { ArchivioComponent } from "./archivio.component";
import { ArchivioRoutingModule } from "./archivio-routings.module";
import { DettaglioArchivioComponent } from "./dettaglio-archivio/dettaglio-archivio.component";
import { ArchivioTreeComponent } from "./archivio-tree/archivio-tree.component";
import { GenericCaptionTableModule } from "../generic-caption-table/generic-caption-table.module";
import { DocsListModule } from "src/app/docs-list-container/docs-list/docs-list.module";


@NgModule({
  imports: [
    CommonModule,
    PrimeNgModule,
    ScriptaCommonModule,
    
  ],
  declarations: [
    DettaglioArchivioComponent,
  ],
  exports: [
    DettaglioArchivioComponent,
  ],
  providers: []
})
export class DettaglioArchivioModule { }
