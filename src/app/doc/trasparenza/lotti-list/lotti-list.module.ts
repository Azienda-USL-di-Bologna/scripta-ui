import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { PrimeNgModule } from 'src/app/primeng.module';
import { LottiListComponent } from './lotti-list.component';
import { LottiDetailComponent } from '../lotti-detail/lotti-detail.component';
import { BoxParticipantiAggiudicatariComponent } from '../box-participanti-aggiudicatari/box-participanti-aggiudicatari.component';
import { ScriptaCommonModule } from 'src/app/scripta-common.module';
import { ComponenteService, GruppoLottoService, LottoService } from "@bds/internauta-model";

@NgModule({
  imports: [
    CommonModule,
    PrimeNgModule,
    ScriptaCommonModule
  ],
  declarations: [
    LottiListComponent,
    LottiDetailComponent,
    BoxParticipantiAggiudicatariComponent
  ],
  providers: [
    LottoService,
    ComponenteService,
    GruppoLottoService
  ],
  exports: [
    LottiListComponent,
    LottiDetailComponent,
    BoxParticipantiAggiudicatariComponent
  ]
})
export class LottiListModule { }
