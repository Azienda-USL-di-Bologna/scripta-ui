import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { GenericCaptionTableModule } from '../generic-caption-table/generic-caption-table.module';
import { PrimeNgModule } from '../primeng.module';
import { ScriptaCommonModule } from '../scripta-common.module';
import { DocsListContainerComponent } from './docs-list-container.component';
import { DocsListModule } from './docs-list/docs-list.module';

@NgModule({
  declarations: [
    DocsListContainerComponent
  ],
  imports: [
    DocsListModule,
    GenericCaptionTableModule,
    CommonModule,
    PrimeNgModule,
    ScriptaCommonModule
  ],
  exports: [
    DocsListModule,
    GenericCaptionTableModule
  ]
})
export class DocsListContainerModule { }
