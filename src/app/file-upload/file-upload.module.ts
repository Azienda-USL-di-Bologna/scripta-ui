import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileUploadComponent } from './file-upload.component';
import { PrimeNgModule } from '../primeng.module';
import { ScriptaCommonModule } from '../scripta-common.module';



@NgModule({
  declarations: [FileUploadComponent],
  imports: [
    CommonModule,
    PrimeNgModule,
    ScriptaCommonModule,
    

  ],
  providers: [],
  exports: [
    FileUploadComponent
  ]
})
export class FileUploadModule { }
