import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ArchiviListRoutingModule } from "./archivi-list-routing.module";
import { PrimeNgModule } from '../../primeng.module';
import { FormsModule } from '@angular/forms';
import { ArchiviListComponent } from './archivi-list.component';

@NgModule({
  declarations: [
    ArchiviListComponent
  ],
  imports: [
    FormsModule,
    CommonModule,
    PrimeNgModule,
    ArchiviListRoutingModule
  ],
  exports: [
    ArchiviListComponent
  ]
})
export class ArchiviListModule { }
