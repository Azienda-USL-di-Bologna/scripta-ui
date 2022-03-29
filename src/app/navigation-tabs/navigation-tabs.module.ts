import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { PrimeNgModule } from "../primeng.module";
import { ScriptaCommonModule } from "../scripta-common.module";
import { NavigationTabsRoutingModule } from "./navigation-tabs-routings.module";
import { NavigationTabsComponent } from "./navigation-tabs.component";
import { NavigationTabsService } from "./navigation-tabs.service";
import { TabWrapperComponent } from "./tab-wrapper.component";
import { TabDirective } from "./tab.directive";
import { ArchiviListContainerModule } from "../archivi-list-container/archivi-list-container.module";
import { DocsListContainerModule } from "../docs-list-container/docs-list-container.module";
import { ArchivioModule } from "../archivio/archivio.module";

@NgModule({
  imports: [
    CommonModule,
    NavigationTabsRoutingModule,
    PrimeNgModule,
    ScriptaCommonModule,
    ArchiviListContainerModule,
    DocsListContainerModule,
    ArchivioModule
  ],
  declarations: [
    NavigationTabsComponent,
    TabWrapperComponent,
    TabDirective,
    /* GenericCaptionTableComponent,
    DocsListComponent,
    DocsListContainerComponent,
    ArchiviListComponent,
    ArchiviListContainerComponent,
    ArchivioComponent,
    ArchivioTreeComponent,
    DettaglioArchivioComponent */
  ],
  /* entryComponents: [
    DocsListContainerComponent,
    ArchiviListContainerComponent,
    ArchivioComponent
  ], */
  providers: [
    NavigationTabsService
  ]
})
export class NavigationTabsModule { }
