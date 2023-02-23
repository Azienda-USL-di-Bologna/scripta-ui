import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { PrimeNgModule } from "../../primeng.module";
import { ScriptaCommonModule } from "../../scripta-common.module";
import { DocDetailAndPreviewComponent } from "./doc-detail-and-preview.component";
import { AttachmentsBoxModule, VersamentiModule } from "@bds/common-components";
import { DocModule } from "src/app/doc/doc.module";

@NgModule({
  imports: [
    CommonModule,
    PrimeNgModule,
    ScriptaCommonModule,
    AttachmentsBoxModule,
    VersamentiModule,
    DocModule
  ],
  declarations: [
    DocDetailAndPreviewComponent
  ],
  providers: [],
  exports: [
    DocDetailAndPreviewComponent
  ]
})
export class DocDetailAndPreviewModule { }
