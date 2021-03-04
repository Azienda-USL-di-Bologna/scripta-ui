import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { DocRoutingModule } from "./doc-routings.module";
import { DocComponent } from "./doc.component";
import { PrimeNgModule } from "../primeng.module";
import { ScriptaCommonModule } from "../scripta-common.module";
import { ExtendedDocService } from "./extended-doc.service";
import {MittenteComponent} from "./mittente/mittente.component";


@NgModule({
    imports: [
        CommonModule,
        DocRoutingModule,
        PrimeNgModule,
        ScriptaCommonModule
    ],
  declarations: [
      DocComponent,
      MittenteComponent
  ],
  providers: [ExtendedDocService]
})
export class DocModule { }
