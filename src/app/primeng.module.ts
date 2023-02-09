import { NgModule } from "@angular/core";
import { ButtonModule } from "primeng/button";
import { InputTextareaModule } from "primeng/inputtextarea";
import { ToolbarModule } from "primeng/toolbar";
import { InputTextModule } from "primeng/inputtext";
import { DialogModule } from "primeng/dialog";
import { DialogService } from "primeng/dynamicdialog";
import { ToastModule } from "primeng/toast";
import { ConfirmationService, MessageService } from "primeng/api";
import { InputNumberModule } from "primeng/inputnumber";
import { AccordionModule } from "primeng/accordion";
import { CalendarModule } from "primeng/calendar";
import { AutoCompleteModule } from "primeng/autocomplete";
import { TableModule } from "primeng/table";
import { FileUploadModule } from 'primeng/fileupload';
import { TooltipModule } from 'primeng/tooltip';
import { BlockUIModule } from 'primeng/blockui';
import { MultiSelectModule } from 'primeng/multiselect';
import { CheckboxModule } from 'primeng/checkbox';
import { TabMenuModule } from 'primeng/tabmenu';
import { ProgressSpinnerModule } from "primeng/progressspinner";
import { SelectButtonModule } from 'primeng/selectbutton';
import { ConfirmDialogModule } from "primeng/confirmdialog";
import { ConfirmPopupModule } from "primeng/confirmpopup";
import { DropdownModule } from 'primeng/dropdown';
import { TabViewModule } from 'primeng/tabview';
import { SplitterModule } from 'primeng/splitter';
import { TreeModule } from 'primeng/tree';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { MenuModule } from 'primeng/menu';
import { TieredMenuModule } from 'primeng/tieredmenu';
import { MessageModule } from 'primeng/message';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { TreeSelectModule } from 'primeng/treeselect';
import {TriStateCheckboxModule} from 'primeng/tristatecheckbox';

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
    ProgressSpinnerModule,
    ConfirmDialogModule,
    ConfirmPopupModule,
    SelectButtonModule,
    DropdownModule,
    TabViewModule,
    SplitterModule,
    TreeModule,
    BreadcrumbModule,
    MenuModule,
    TieredMenuModule,
    MessageModule,
    OverlayPanelModule,
    TreeSelectModule,
    TriStateCheckboxModule
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
    ProgressSpinnerModule,
    SelectButtonModule,
    ConfirmDialogModule,
    ConfirmPopupModule,
    DropdownModule,
    TabViewModule,
    SplitterModule,
    TreeModule,
    BreadcrumbModule,
    MenuModule,
    TieredMenuModule,
    MessageModule,
    OverlayPanelModule,
    TreeSelectModule,
    TriStateCheckboxModule
  ],
  providers: [MessageService, DialogService, ConfirmationService]
})
export class PrimeNgModule { }
