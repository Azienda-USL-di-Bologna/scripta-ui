import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { PrimeNgModule } from '../primeng.module';
import { ScriptaCommonModule } from '../scripta-common.module';
import { GenericCaptionTableComponent } from './generic-caption-table.component';

@NgModule({
  declarations: [
    GenericCaptionTableComponent
  ],
  imports: [
    CommonModule,
    PrimeNgModule,
    ScriptaCommonModule
  ],
  exports: [
    GenericCaptionTableComponent
  ]
})
export class GenericCaptionTableModule { }
