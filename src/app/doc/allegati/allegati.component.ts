import { HttpEvent, HttpEventType } from '@angular/common/http';
import { Component, OnInit, Input, EventEmitter, Output, AfterViewInit, ViewChild } from '@angular/core';
import { Form } from '@angular/forms';
import { Doc, ImportazioniOrganigramma, Allegato, TipoAllegato } from '@bds/ng-internauta-model';
import { MessageService } from 'primeng-lts/api';
import { FileUpload } from 'primeng-lts/fileupload';
import { UtilityService } from 'src/app/services/utility.service';


@Component({
  selector: 'allegati',
  templateUrl: './allegati.component.html',
  styleUrls: ['./allegati.component.scss']
})
export class AllegatiComponent implements OnInit {

  public _doc: Doc;
  public allegati: Allegato[] = [];
  public selectedAllegato: Allegato;

  progress: number = 0;
  public refreshTable: boolean = false;
  display: boolean = false;
  public selectedTipo: string;

  uploadedFiles: File[] = [];
  @ViewChild("fubauto") fileUploadInput: FileUpload;
  
  @Input() set doc(value: Doc) {
    this._doc = value;
    this.allegati = this._doc.allegati;

  }

  constructor(private messageService: MessageService,
    private utilityService:UtilityService)
   { }
  

  ngOnInit(): void {
  }
  
  
  onUpload(event: any) {
    console.log("formDataformDataformData", event);
    let formData: FormData = this.buildFormData(event);
    this.utilityService.uploadAllegato(formData).subscribe((event: HttpEvent<any>) => {
      switch (event.type) {
        case HttpEventType.Sent:
          this.progress = 5;
          this.setProgressBarWidth(this.progress);
          // console.log("Request has been made! progress is:", this.progress);
          break;
        case HttpEventType.ResponseHeader:
          this.progress = this.progress + 5;
          this.setProgressBarWidth(this.progress);
          // console.log("Response header has been received!  progress is: ", this.progress);
          if (!event.ok && !(event.status === 200)) {
            this.messageService.add({
              severity: "error", summary: `Error code ${event.status}`, detail: "Backend Error, I dati passati per l'importazione sono assenti o non corretti."
            });
          }
          break;
        case HttpEventType.UploadProgress:
          this.progress = this.progress + Math.round((event.loaded / event.total * 100) - 20);
          this.setProgressBarWidth(this.progress);
          // console.log(`Uploaded! progress is: ${this.progress}%`);
          break;
        case HttpEventType.Response:
          // console.log("backend response event is: ", event);
          const res: ImportazioniOrganigramma = event.body;
          this.progress = this.progress + 10;
          this.setProgressBarWidth(this.progress);
          // console.log("Response from the backend, progress is: ", this.progress);
          this.refreshTable = true;
          setTimeout(() => {
            this.progress = 0;
            this.setProgressBarWidth(this.progress);
            this.onCloseFileUploadDialog();
            // console.log("Response from the backend, progress is: ", this.progress);

            const endString = (res.version as unknown as string).substr(0, res.dataInserimentoRiga.toString().length);
            const endTime = new Date(endString).getTime();
            const startTime = new Date(res.dataInserimentoRiga).getTime();
            const executionTime = endTime - startTime;
            const showTime = this.msToTime(executionTime);
          
          this.refreshTable = false;
        }, 7000);
    }});
            
      // for(let file of event.files) {
      //     this.uploadedFiles.push(file);
      // }

    this.messageService.add({ severity: 'info', summary: 'File Uploaded', detail: '' });
  }

  private buildFormData(event:any): FormData {
    this.uploadedFiles = event.files;
    const formData: FormData = new FormData();
    formData.append("idDoc", this._doc.id.toString());
    formData.append("numeroProposta", "6");
    this.uploadedFiles.forEach((file: File) => {
      formData.append("files", file);
    });
    return formData;
  }

  setProgressBarWidth(progress: number) {
    const progressBar = document.querySelector("div.p-progressbar-value.p-progressbar-value-animate");
    // console.log("update progressBar width", progressBar);
    progressBar.setAttribute("style", `width: ${progress}%; display: block;`);
  }

  onCloseFileUploadDialog() {
    this.display = false;
    this.selectedTipo = null;
    this.fileUploadInput.clear();
  }

  private msToTime(duration:any) {
    const milliseconds = duration < 1000 ? duration :  Math.floor((duration % 1000) / 100),
      seconds = Math.floor((duration / 1000) % 60),
      minutes = Math.floor((duration / (1000 * 60)) % 60),
      hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

    const h = (hours < 10) ? "0" + hours : hours,
    m = (minutes < 10) ? "0" + minutes : minutes,
    s = (seconds < 10) ? "0" + seconds : seconds;

    return h + ":" + m + ":" + s + "." + milliseconds;
  }
}
