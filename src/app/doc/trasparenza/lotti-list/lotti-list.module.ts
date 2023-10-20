import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { PrimeNgModule } from 'src/app/primeng.module';
import { LottiListComponent } from './lotti-list.component';
import { LottiDetailComponent } from '../lotti-detail/lotti-detail.component';
import { BoxParticipantiAggiudicatariComponent } from '../box-participanti-aggiudicatari/box-participanti-aggiudicatari.component';
import { ScriptaCommonModule } from 'src/app/scripta-common.module';

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
  ],
  exports: [
    LottiListComponent,
    LottiDetailComponent,
    BoxParticipantiAggiudicatariComponent
  ]
})
export class LottiListModule { }
