import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { PrimeNgModule } from '../primeng.module';
import { ScriptaCommonModule } from '../scripta-common.module';
import { GenericCaptionTableComponent } from './generic-caption-table.component';
import { FileUploadModule } from '../file-upload/file-upload.module';

@NgModule({
  declarations: [
    GenericCaptionTableComponent,
  ],
  imports: [
    CommonModule,
    PrimeNgModule,
    ScriptaCommonModule,
    FileUploadModule,
    
  ],
  exports: [
    GenericCaptionTableComponent
  ]
})
export class GenericCaptionTableModule { }
