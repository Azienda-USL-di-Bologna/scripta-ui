import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { PrimeNgModule } from "../primeng.module";
import { ScriptaCommonModule } from "../scripta-common.module";
import { NavigationTabsRoutingModule } from "./navigation-tabs-routings.module";
import { NavigationTabsComponent } from "./navigation-tabs.component";
import { NavigationTabsService } from "./navigation-tabs.service";
import { TabWrapperComponent } from "./tab-wrapper.component";
import { DocsListComponent } from "../docs-list/docs-list.component";
import { ArchiviListComponent } from "../archivi-list/archivi-list.component";
import { TabDirective } from "./tab.directive";

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
    DocsListComponent,
    ArchiviListComponent,
    TabDirective
  ],
  entryComponents: [
    DocsListComponent,
    ArchiviListComponent
  ],
  providers: [
    NavigationTabsService
  ]
})
export class NavigationTabsModule { }
