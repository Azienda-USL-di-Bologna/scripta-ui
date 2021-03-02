import { NgModule } from "@angular/core";
import { InputTextareaModule } from "primeng-lts/inputtextarea";
import { ButtonModule } from "primeng-lts/button";
import { MessageService } from "primeng-lts/api";
import { ToastModule } from "primeng-lts/toast";
import { DialogService } from "primeng-lts/dynamicdialog";
import { DialogModule } from "primeng-lts/dialog";
import { ToolbarModule } from "primeng-lts/toolbar";

@NgModule({
  declarations: [
  ],
  imports: [
    ButtonModule,
    InputTextareaModule,
    ToastModule,
    DialogModule,
    ToolbarModule
  ],
  exports: [
    ButtonModule,
    InputTextareaModule,
    ToastModule,
    DialogModule,
    ToolbarModule
  ],
  providers: [MessageService, DialogService]
})
export class PrimeNgModule { }
