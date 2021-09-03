import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { PrimeNgModule } from "../primeng.module";
import { ScriptaCommonModule } from "../scripta-common.module";
import { NavigationTabsRoutingModule } from "./navigation-tabs-routings.module";
import { NavigationTabsComponent } from "./navigation-tabs.component";

@NgModule({
  imports: [
    CommonModule,
    NavigationTabsRoutingModule,
    PrimeNgModule,
    ScriptaCommonModule
  ],
  declarations: [
    NavigationTabsComponent
  ],
  providers: []
})
export class NavigationTabsModule { }
