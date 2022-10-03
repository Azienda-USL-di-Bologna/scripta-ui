import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { PrimeNgModule } from "../../primeng.module";
import { ScriptaCommonModule } from "../../scripta-common.module";
import { DocDetailAndPreviewComponent } from "./doc-detail-and-preview.component";

@NgModule({
  imports: [
    CommonModule,
    PrimeNgModule,
    ScriptaCommonModule
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
