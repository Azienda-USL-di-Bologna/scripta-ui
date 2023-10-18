import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { PrimeNgModule } from 'src/app/primeng.module';
import { LottiListComponent } from './lotti-list.component';

@NgModule({
  imports: [
    CommonModule,
    PrimeNgModule,
  ],
  declarations: [
    LottiListComponent
  ],
  providers: [
  ],
  exports: [
    LottiListComponent
  ]
})
export class LottiListModule { }
