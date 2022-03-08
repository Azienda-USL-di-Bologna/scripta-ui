import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { PrimeNgModule } from "../../primeng.module";
import { ScriptaCommonModule } from "../../scripta-common.module";
import { DocsListRoutingModule } from "./docs-list-routings.module";
import { DocsListComponent } from "./docs-list.component";
import { ExtendedDocDetailViewService } from "./extended-doc-detail-view.service";
import { ExtendedDocDetailService } from "./extended-doc-detail.service";

@NgModule({
  imports: [
    CommonModule,
    DocsListRoutingModule,
    PrimeNgModule,
    ScriptaCommonModule
  ],
  declarations: [
    //DocsListComponent
  ],
  providers: [
    ExtendedDocDetailService,
    ExtendedDocDetailViewService
  ]
})
export class DocsListModule { }
