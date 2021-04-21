import { HttpEvent, HttpEventType } from '@angular/common/http';
import { Component, OnInit, Input, ViewChild, OnDestroy } from '@angular/core';
import { Doc, Allegato, BaseUrls, BaseUrlType, ENTITIES_STRUCTURE, TipoDettaglioAllegato, DettaglioAllegato } from '@bds/ng-internauta-model';
import { UtilityFunctions } from '@bds/nt-communicator';
import { BatchOperation, BatchOperationTypes, FilterDefinition, FiltersAndSorts, FILTER_TYPES, NextSdrEntity, SortDefinition, SORT_MODES } from '@nfa/next-sdr';
import { MessageService } from 'primeng-lts/api';
import { FileUpload } from 'primeng-lts/fileupload';
import { Subscription } from 'rxjs';
import { ExtendedAllegatoService } from './extended-allegato.service';

@Component({
  selector: 'allegati',
  templateUrl: './allegati.component.html',
  styleUrls: ['./allegati.component.scss']
})
export class AllegatiComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription[] = [];
  private actualPrincipale: Allegato;
  
  public _doc: Doc;
  public selectedAllegato: Allegato;
  public progress: number = 0;
  public refreshTable: boolean = false;
  public display: boolean = false;
  public selectedTipo: string;
  public uploadedFiles: File[] = [];
  

  @ViewChild("fubauto") fileUploadInput: FileUpload;
  
  @Input() set doc(value: Doc) {
    this._doc = value;
    this.setInitialData();
  }

  constructor(
    private messageService: MessageService,
    private allegatoService: ExtendedAllegatoService)
   { }
  
  ngOnInit(): void {
  }

  /**
   * Assegna il valore ad alcune proprietà chiave della classe
   */
  private setInitialData(): void {
    if (this._doc.allegati.length > 0) {
      this.actualPrincipale = this._doc.allegati.find(a => a.principale);
      this.selectedAllegato = this.actualPrincipale;
    }
  }
  
  /**
   * Funzione che gestisce l'upload degli allegati
   * @param event 
   */
  public onUpload(event: any): void {
    console.log("formDataformDataformData", event);
    let formData: FormData = this.buildFormData(event);
    this.subscriptions.push(this.allegatoService.uploadAllegato(formData).subscribe((event: HttpEvent<any>) => {
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
              severity: "error", 
              summary: `Error code ${event.status}`, 
              detail: "Backend Error, I dati passati per l'importazione sono assenti o non corretti."
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
          const res: Allegato[] = event.body;
          this._doc.allegati = res;
          if (this._doc.allegati.length > 0) {
            this.actualPrincipale = this._doc.allegati.find(a => a.principale);
          }
          this.progress = this.progress + 10;
          this.setProgressBarWidth(this.progress);
          // console.log("Response from the backend, progress is: ", this.progress);
          this.refreshTable = true;
          setTimeout(() => {
            this.progress = 0;
            this.setProgressBarWidth(this.progress);
            this.onCloseFileUploadDialog();          
          this.refreshTable = false;
        }, 7000);
    }}));

    this.messageService.add({ severity: 'info', summary: 'File Uploaded', detail: '' });
  }

  private buildFormData(event :any ): FormData {
    this.uploadedFiles = event.files;
    const formData: FormData = new FormData();
    formData.append("idDoc",this._doc.id.toString());
    formData.append("numeroProposta", "6");
    this.uploadedFiles.forEach((file: File) => {
      formData.append("files", file);
    });
    return formData;
  }

  private setProgressBarWidth(progress: number): void {
    const progressBar = document.querySelector("div.p-progressbar-value.p-progressbar-value-animate");
    // console.log("update progressBar width", progressBar);
    progressBar.setAttribute("style", `width: ${progress}%; display: block;`);
  }

  public onCloseFileUploadDialog(): void {
    this.display = false;
    this.selectedTipo = null;
    this.fileUploadInput.clear();
  }

  /**
   * Metodo che si occupa di far partire lo scaricamento di un allegato
   */
  public onDownloadAttachment(allegato: Allegato): void {
    this.allegatoService.downloadAttachment(allegato).subscribe(
      response =>
        UtilityFunctions.downLoadFile(response, allegato.getDettaglioByTipoDettaglioAllegato(TipoDettaglioAllegato.ORIGINALE).mimeType, allegato.nome + "." + allegato.getDettaglioByTipoDettaglioAllegato(TipoDettaglioAllegato.ORIGINALE).estensione, false)
    );
  }

  /**
   * Metodo che si occupa di far partire lo scaricamento di uno zip contenente tutti gli allegati
   */
  public downloadAllAttachments(): void {
    this.allegatoService.downloadAllAttachments(this._doc).subscribe(
      response => 
        UtilityFunctions.downLoadFile(response, "application/zip", "allegati.zip")

    );
  }

  /**
   * Effettuo la load degli allegati del documento e risetto la lista.
   * Metodo da chiamare quando si vuole ricaricare la lista degli allegati.
   */
  private loadAllegati() {
    const filters: FiltersAndSorts = new FiltersAndSorts();
    filters.addFilter(new FilterDefinition("idDoc", FILTER_TYPES.not_string.equals, this._doc.id));
    filters.addSort(new SortDefinition("numeroAllegato", SORT_MODES.asc));
    this.allegatoService.getData(null, filters, null, null).subscribe(
      (res: any) => {
        this._doc.allegati = [...res.results];
        this.setInitialData();
      }
    );
  }

  /**
   * Metodo chiamato dall'html per cancellare un allegato.
   */
  public onDeleteAttachment(allegato: Allegato, rowIndex: number): void {
    this.allegatoService.deleteHttpCall(allegato.id).subscribe(
      res => {
        this.messageService.add({
          severity:'success', 
          summary:'Allegato', 
          detail:'Allegato eliminato con successo'
        });
        // La delete può far scattare la rinumerazione degli allegati e quindi ricarico l'intera lista.
        this.loadAllegati();
      }
    );
  }

  /**
   * Allegato principale selezionato, salvo sul db
   * Eventualmente setto non principale il precedente.
   * @param event 
   */
  public onRowSelect(event: any): void {
    const batchOperations: BatchOperation[] = [];
    if (this.selectedAllegato) {
      batchOperations.push({
        operation: BatchOperationTypes.UPDATE,
        entityPath: BaseUrls.get(BaseUrlType.Scripta) + "/" + ENTITIES_STRUCTURE.scripta.allegato.path,
        id: this.selectedAllegato.id,
        entityBody: {
          version: this.selectedAllegato.version,
          principale: true
        } as NextSdrEntity,
      } as BatchOperation);
      if (this.actualPrincipale) {
        batchOperations.push({
          operation: BatchOperationTypes.UPDATE,
          entityPath: BaseUrls.get(BaseUrlType.Scripta) + "/" + ENTITIES_STRUCTURE.scripta.allegato.path,
          id: this.actualPrincipale.id,
          entityBody: {
            version: this.actualPrincipale.version,
            principale: false
          } as NextSdrEntity,
        } as BatchOperation);
      } 
      this.subscriptions.push(
        this.allegatoService.batchHttpCall(batchOperations).subscribe(
          (res: BatchOperation[]) => {
            this.messageService.add({
              severity:'success', 
              summary:'Allegato', 
              detail:'Allegato principale impostato con successo'
            });
            // Aggiorno i campi su vecchio principale
            if (this.actualPrincipale) {
              this.actualPrincipale.principale = false;
              this.actualPrincipale.version = (res.find(b => 
                (b.entityBody as Allegato).id === this.actualPrincipale.id
                ).entityBody as Allegato).version;
            }
            // Aggiorno i campi sul nuovo principale
            this.selectedAllegato.principale = true;
            this.selectedAllegato.version = (res.find(b => 
              (b.entityBody as Allegato).id === this.selectedAllegato.id
              ).entityBody as Allegato).version;
            // Setto l'actualPrincipale al nuovo principale
            this.actualPrincipale = this.selectedAllegato;
        })
      );
    }
  }

  /**
   * Allegato principale deselezionato, salvo sul db.
   */
  public onRowUnselect(): void {
    if (this.actualPrincipale) {
      this.subscriptions.push(
        this.allegatoService.patchHttpCall({
          version: this.actualPrincipale.version,
          principale: false
        }, this.actualPrincipale.id, null, null).subscribe(
          (allegato: Allegato) => {
            this.actualPrincipale.version = allegato.version;
            this.actualPrincipale.principale = false;
            this.messageService.add({
              severity:'success', 
              summary:'Allegato', 
              detail:'Allegato principale deselezionato'
            });
            this.actualPrincipale = null;
          }
        )
      );
    }
  }

  /**
   * Mi desottoscrivo dalla varie sottoscrizioni
   */
  ngOnDestroy(): void {
    this.subscriptions.forEach((s: Subscription) => s.unsubscribe());
    this.subscriptions = [];
  }

  public getDettaglioByTipoDettaglioAllegato(allegato:Allegato, tipo : string ): DettaglioAllegato {
       return allegato.dettagliAllegatiList.find(dettaglioAllegato => (dettaglioAllegato.caratteristica == tipo));
     }
}
