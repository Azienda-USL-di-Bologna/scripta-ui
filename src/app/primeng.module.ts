import { NgModule } from "@angular/core";
import {ButtonModule} from "primeng-lts/button";
import {InputTextareaModule} from "primeng-lts/inputtextarea";
import {ToolbarModule} from "primeng-lts/toolbar";
import { InputTextModule } from "primeng-lts/inputtext";
import {DialogModule} from "primeng-lts/dialog";
import {DialogService} from "primeng-lts/dynamicdialog";
import {ToastModule} from "primeng-lts/toast";
import {MessageService} from "primeng-lts/api";
import {InputNumberModule} from "primeng-lts/inputnumber";
import {AccordionModule} from "primeng-lts/accordion";
import {CalendarModule} from "primeng-lts/calendar";
import {AutoCompleteModule} from "primeng-lts/autocomplete";
import { TableModule } from "primeng-lts/table";



@NgModule({
  declarations: [
  ],
  imports: [
    ButtonModule,
    InputTextareaModule,
    ToastModule,
    DialogModule,
    ToolbarModule,
    InputTextModule,
    InputNumberModule,
    AutoCompleteModule,
    CalendarModule,
    ButtonModule,
    InputTextModule,
    AccordionModule,
    TableModule
  ],
  exports: [
    ButtonModule,
    InputTextareaModule,
    ToastModule,
    DialogModule,
    ToolbarModule,
    InputTextModule,
    InputNumberModule,
    AutoCompleteModule,
    CalendarModule,
    ButtonModule,
    InputTextModule,
    AccordionModule,
    TableModule
  ],
  providers: [MessageService, DialogService]
})
export class PrimeNgModule { }
