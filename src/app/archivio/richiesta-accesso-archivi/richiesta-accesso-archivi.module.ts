import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { PrimeNgModule } from "src/app/primeng.module";
import { RichiestaAccessoArchiviComponent } from "./richiesta-accesso-archivi.component";

@NgModule({
    imports: [
      CommonModule,
      PrimeNgModule,
      
    ],
    declarations: [
      RichiestaAccessoArchiviComponent,
    ],
    exports: [
      RichiestaAccessoArchiviComponent,
    ],
    providers: []
  })
  export class RichiestaAccessoArchiviModule { }
  