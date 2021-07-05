import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { PrimeNgModule } from "../primeng.module";
import { ScriptaCommonModule } from "../scripta-common.module";
import { DocsListRoutingModule } from "./docs-list-routings.module";
import { DocsListComponent } from "./docs-list.component";
import { ExtendedDocListService } from "./extended-doc-list.service";



@NgModule({
  imports: [
    CommonModule,
    DocsListRoutingModule,
    PrimeNgModule,
    ScriptaCommonModule
  ],
  declarations: [
    DocsListComponent
  ],
  providers: [
    ExtendedDocListService
  ]
})
export class DocsListModule { }
