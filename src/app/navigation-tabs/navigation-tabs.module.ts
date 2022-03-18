import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { PrimeNgModule } from "../primeng.module";
import { ScriptaCommonModule } from "../scripta-common.module";
import { NavigationTabsRoutingModule } from "./navigation-tabs-routings.module";
import { NavigationTabsComponent } from "./navigation-tabs.component";
import { NavigationTabsService } from "./navigation-tabs.service";
import { TabWrapperComponent } from "./tab-wrapper.component";
import { DocsListComponent } from "../docs-list-container/docs-list/docs-list.component";
import { ArchiviListComponent } from "../archivi-list-container/archivi-list/archivi-list.component";
import { TabDirective } from "./tab.directive";
import { ArchivioComponent } from "../archivio/archivio.component";
import { ArchivioTreeComponent } from "../archivio/archivio-tree/archivio-tree.component";
import { DocsListContainerComponent } from "../docs-list-container/docs-list-container.component";
import { GenericCaptionTableComponent } from "../generic-caption-table/generic-caption-table.component";
import { ArchiviListContainerComponent } from "../archivi-list-container/archivi-list-container.component";
import { DettaglioArchivioComponent } from "../archivio/dettaglio-archivio/dettaglio-archivio.component";

@NgModule({
  imports: [
    CommonModule,
    NavigationTabsRoutingModule,
    PrimeNgModule,
    ScriptaCommonModule
  ],
  declarations: [
    NavigationTabsComponent,
    TabWrapperComponent,
    GenericCaptionTableComponent,
    DocsListComponent,
    DocsListContainerComponent,
    ArchiviListComponent,
    ArchiviListContainerComponent,
    ArchivioComponent,
    ArchivioTreeComponent,
    TabDirective,
    DettaglioArchivioComponent
  ],
  entryComponents: [
    DocsListContainerComponent,
    ArchiviListContainerComponent,
    ArchivioComponent
  ],
  providers: [
    NavigationTabsService
  ]
})
export class NavigationTabsModule { }
