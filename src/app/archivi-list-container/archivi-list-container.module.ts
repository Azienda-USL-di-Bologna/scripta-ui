import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { GenericCaptionTableModule } from '../generic-caption-table/generic-caption-table.module';
import { PrimeNgModule } from '../primeng.module';
import { ScriptaCommonModule } from '../scripta-common.module';
import { ArchiviListContainerComponent } from './archivi-list-container.component';
import { ArchiviListModule } from './archivi-list/archivi-list.module';

@NgModule({
  declarations: [
    ArchiviListContainerComponent
  ],
  imports: [
    ArchiviListModule,
    GenericCaptionTableModule,
    CommonModule,
    PrimeNgModule,
    ScriptaCommonModule
  ],
  exports: [
    ArchiviListModule,
    GenericCaptionTableModule,
  ]
})
export class ArchiviListContainerModule { }
