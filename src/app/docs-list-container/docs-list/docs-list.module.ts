import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { PrimeNgModule } from "../../primeng.module";
import { ScriptaCommonModule } from "../../scripta-common.module";
import { DocsListRoutingModule } from "./docs-list-routings.module";
import { DocsListComponent } from "./docs-list.component";
import { ExtendedDocDetailViewService } from "./extended-doc-detail-view.service";
import { ExtendedDocDetailService } from "./extended-doc-detail.service";
import { DocUtilsService } from "src/app/utilities/doc-utils.service";
import { CommonComponentsModule } from "@bds/common-components";
import { DocListService } from "./docs-list.service";

@NgModule({
  imports: [
    CommonModule,
    DocsListRoutingModule,
    PrimeNgModule,
    ScriptaCommonModule,
    CommonComponentsModule
  ],
  declarations: [
    DocsListComponent
  ],
  providers: [
    ExtendedDocDetailService,
    ExtendedDocDetailViewService,
    DocUtilsService,
    DocListService
  ],
  exports: [
    DocsListComponent
  ]
})
export class DocsListModule { }
