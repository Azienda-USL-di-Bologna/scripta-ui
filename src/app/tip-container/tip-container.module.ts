import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TipContainerComponent } from './tip-container.component';
import { TipModule } from '@bds/common-components';
import { GenericCaptionTableModule } from '../generic-caption-table/generic-caption-table.module';
import { PrimeNgModule } from '../primeng.module';
import { ScriptaCommonModule } from '../scripta-common.module';
import { TipCaptionComponent } from './tip-caption/tip-caption.component';



@NgModule({
  declarations: [
    TipContainerComponent,
    TipCaptionComponent
  ],
  imports: [
    TipModule,
    GenericCaptionTableModule,
    CommonModule,
    PrimeNgModule,
    ScriptaCommonModule
  ],
  exports: [
    TipModule,
    GenericCaptionTableModule
  ]
})
export class TipContainerModule { }