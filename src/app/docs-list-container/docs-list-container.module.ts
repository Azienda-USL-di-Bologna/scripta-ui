import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { GenericCaptionTableModule } from '../generic-caption-table/generic-caption-table.module';
import { PrimeNgModule } from '../primeng.module';
import { ScriptaCommonModule } from '../scripta-common.module';
import { DocDetailAndPreviewModule } from './doc-detail-and-preview/doc-detail-and-preview.module';
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
    ScriptaCommonModule,
    DocDetailAndPreviewModule
  ],
  exports: [
    DocsListModule,
    DocDetailAndPreviewModule,
    GenericCaptionTableModule
  ]
})
export class DocsListContainerModule { }
