import { NgModule } from "@angular/core";
import { InputTextareaModule } from "primeng-lts/inputtextarea";
import { ButtonModule } from "primeng-lts/button";
import { MessageService } from "primeng-lts/api";
import { ToastModule } from "primeng-lts/toast";
import { DialogService } from "primeng-lts/dynamicdialog";
import { DialogModule } from "primeng-lts/dialog";
import { ToolbarModule } from "primeng-lts/toolbar";
import { InputTextModule } from "primeng-lts/inputtext";
import { AccordionModule } from 'primeng-lts/accordion';

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
    AccordionModule
  ],
  exports: [
    ButtonModule,
    InputTextareaModule,
    ToastModule,
    DialogModule,
    ToolbarModule,
    InputTextModule,
    AccordionModule
  ],
  providers: [MessageService, DialogService]
})
export class PrimeNgModule { }
