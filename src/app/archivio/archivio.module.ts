import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { PrimeNgModule } from "../primeng.module";
import { ScriptaCommonModule } from "../scripta-common.module";
import { ArchivioComponent } from "./archivio.component";
import { ArchivioRoutingModule } from "./archivio-routings.module";

@NgModule({
  imports: [
    CommonModule,
    ArchivioRoutingModule,
    PrimeNgModule,
    ScriptaCommonModule
  ],
  declarations: [
    ArchivioComponent
  ],
  providers: []
})
export class ArchivioModule { }
