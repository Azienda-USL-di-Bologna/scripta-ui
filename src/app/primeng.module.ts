import { NgModule } from "@angular/core";
import {ButtonModule} from "primeng/button";
import {InputTextareaModule} from "primeng/inputtextarea";
import {ToolbarModule} from "primeng/toolbar";
import { InputTextModule } from "primeng/inputtext";
import {DialogModule} from "primeng/dialog";
import {DialogService} from "primeng/dynamicdialog";
import {ToastModule} from "primeng/toast";
import {MessageService} from "primeng/api";
import {InputNumberModule} from "primeng/inputnumber";
import {AccordionModule} from "primeng/accordion";
import {CalendarModule} from "primeng/calendar";
import {AutoCompleteModule} from "primeng/autocomplete";
import { TableModule } from "primeng/table";
import {FileUploadModule} from 'primeng/fileupload';
import {TooltipModule} from 'primeng/tooltip';
import {BlockUIModule} from 'primeng/blockui';
import {MultiSelectModule} from 'primeng/multiselect';
import {CheckboxModule} from 'primeng/checkbox';
import {TabMenuModule} from 'primeng/tabmenu';
import { ProgressSpinnerModule } from "primeng/progressspinner";

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
    TableModule,
    FileUploadModule,
    TooltipModule,
    BlockUIModule,
    MultiSelectModule,
    CheckboxModule,
    TabMenuModule,
    ProgressSpinnerModule
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
    TableModule,
    FileUploadModule,
    TooltipModule,
    BlockUIModule,
    MultiSelectModule,
    CheckboxModule,
    TabMenuModule,
    ProgressSpinnerModule
  ],
  providers: [MessageService, DialogService]
})
export class PrimeNgModule { }
