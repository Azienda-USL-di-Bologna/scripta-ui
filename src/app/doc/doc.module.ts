import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { DocRoutingModule } from "./doc-routings.module";
import { DocComponent } from "./doc.component";
import { PrimeNgModule } from "../primeng.module";
import { ScriptaCommonModule } from "../scripta-common.module";
import { ExtendedDocService } from "./extended-doc.service";
import {MittenteComponent} from "./mittente/mittente.component";
import {DestinatariComponent} from "./destinatari/destinatari.component";
import {AllegatiComponent} from "./allegati/allegati.component";
import {ExtendedDestinatariService} from "./destinatari/extended-destinatari.service";
import {ExtendedMittenteService} from "./mittente/extended-mittente.service";


@NgModule({
    imports: [
        CommonModule,
        DocRoutingModule,
        PrimeNgModule,
        ScriptaCommonModule
    ],
  declarations: [
      DocComponent,
      MittenteComponent,
      DestinatariComponent,
      AllegatiComponent
  ],
  providers: [
      ExtendedDocService,
      ExtendedDestinatariService,
      ExtendedMittenteService
  ]
})
export class DocModule { }
