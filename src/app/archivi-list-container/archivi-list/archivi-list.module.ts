import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ArchiviListRoutingModule } from "./archivi-list-routing.module";
import { PrimeNgModule } from '../../primeng.module';
import { FormsModule } from '@angular/forms';
import {MatTabsModule} from '@angular/material/tabs';
import { ArchiviListComponent } from './archivi-list.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { CommonComponentsModule, UsersAutocompleteComponent } from '@bds/common-components';

@NgModule({
  declarations: [
    ArchiviListComponent
  ],
  imports: [
    FormsModule,
    CommonModule,
    PrimeNgModule,
    ArchiviListRoutingModule,
    CommonComponentsModule,
    MatTabsModule
    //,UsersAutocompleteComponent
    //NoopAnimationsModule
  ],
  exports: [
    ArchiviListComponent
  ]
})
export class ArchiviListModule { }
