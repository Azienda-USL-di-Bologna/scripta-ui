import { AfterViewInit, Component, Input, OnInit, ViewChild } from '@angular/core';
import { Archivio, ArchivioDetail, ENTITIES_STRUCTURE, PermessoArchivio, StatoArchivio } from '@bds/ng-internauta-model';
import { MenuItem } from 'primeng/api';
import { ArchiviListComponent } from '../archivi-list-container/archivi-list/archivi-list.component';
import { DocsListComponent } from '../docs-list-container/docs-list/docs-list.component';
import { CaptionConfiguration } from '../generic-caption-table/caption-configuration';
import { CaptionReferenceTableComponent } from '../generic-caption-table/caption-reference-table.component';
import { CaptionSelectButtonsComponent } from '../generic-caption-table/caption-select-buttons.component';
import { NewArchivoButton } from '../generic-caption-table/new-archivo-button';
import { SelectButtonItem } from '../generic-caption-table/select-button-item';
import { TabComponent } from '../navigation-tabs/tab.component';
import { DettaglioArchivioComponent } from './dettaglio-archivio/dettaglio-archivio.component';
import { RichiestaAccessoArchiviComponent } from './richiesta-accesso-archivi/richiesta-accesso-archivi.component';
import { ExtendedArchivioService } from './extended-archivio.service';

@Component({
  selector: 'app-archivio',
  templateUrl: './archivio.component.html',
  styleUrls: ['./archivio.component.scss']
})
export class ArchivioComponent implements OnInit, AfterViewInit, TabComponent, CaptionSelectButtonsComponent {
  private _archivio: Archivio | ArchivioDetail;
  public captionConfiguration: CaptionConfiguration;
  public referenceTableComponent: CaptionReferenceTableComponent;
  public selectButtonItems: SelectButtonItem[];
  public selectedButtonItem: SelectButtonItem;
  public tipiDisponibili : String[];
  public permessiArchivio : PermessoArchivio[] = [];
  public colsResponsabili : any[];
  public newArchivoButton: NewArchivoButton;

  get archivio(): Archivio | ArchivioDetail { return this._archivio; }
  @Input() set data(data: any) {
    this.extendedArchivioService.getByIdHttpCall(
      data.archivio.id,
      ENTITIES_STRUCTURE.scripta.archivio.customProjections.CustomArchivioWithIdAziendaAndIdMassimarioAndIdTitolo)
      .subscribe((res: Archivio) => {
        this._archivio = res;
        console.log("Archivio nell'archivio component: ", this._archivio);
        setTimeout(() => {
          this.inizializeAll();
        }, 0); 
    });
  }

  private _archivilist: ArchiviListComponent;
  public get archivilist() {return this._archivilist}
  @ViewChild('archivilist') set archivilist(content: ArchiviListComponent) {
    if (content) {
      this._archivilist = content;
    }
  }
  private _doclist: DocsListComponent;
  public get doclist() {return this._doclist}
  @ViewChild('doclist') set doclist(content: DocsListComponent) {
    if (content) {
      this._doclist = content;
    }
  }
  private _dettaglioarchivio: DettaglioArchivioComponent;
  public get dettaglioarchivio() {return this._dettaglioarchivio}
  @ViewChild('dettaglioarchivio') set dettaglioarchivio(content: DettaglioArchivioComponent) {
    if (content) {
      this._dettaglioarchivio = content;
    }
  }

  private _richiestaaccessoarchivi: RichiestaAccessoArchiviComponent;
  public get richiestaaccessoarchivi() {return this._richiestaaccessoarchivi}
  @ViewChild('richiestaaccessoarchivi') set richiestaaccessoarchivi(content: RichiestaAccessoArchiviComponent) {
    if (content) {
      this._richiestaaccessoarchivi = content;
    }
  }

  constructor(private extendedArchivioService: ExtendedArchivioService) {
  }

  ngOnInit(): void {
  }
  
  ngAfterViewInit(): void {
    /* console.log(this.archivio.stato)*/
    //this.inizializeAll(); 
  }

  private inizializeAll(): void {
    this.buildSelectButtonItems(this.archivio);
    this.buildNewArchivioButton(this.archivio);
    if (this.archivio.stato === StatoArchivio.BOZZA) {
      this.selectedButtonItem = this.selectButtonItems.find(x => x.id === SelectButton.DETTAGLIO);
      this.setForDettaglio();
    } else {
      if(this.archivio.livello === 3){
        this.selectedButtonItem = this.selectButtonItems.find(x => x.id === SelectButton.DOCUMENTI);
        this.setForDocumenti();
      }else{
        this.selectedButtonItem = this.selectButtonItems.find(x => x.id === SelectButton.SOTTOARCHIVI);
        this.setForSottoarchivi();
      }
      
    }
  }

  private setForSottoarchivi(): void {
    this.captionConfiguration = new CaptionConfiguration(true, true, true, false, this.archivio?.stato !== StatoArchivio.BOZZA && this.archivio?.livello < 3);
    this.referenceTableComponent = this.archivilist;
  }

  private setForDocumenti(): void {
    this.captionConfiguration = new CaptionConfiguration(true, true, true, true, false);
    this.referenceTableComponent = this.doclist;
  }

  private setForDettaglio(): void {
    this.captionConfiguration = new CaptionConfiguration(false, true, false, false, this.archivio?.stato !== StatoArchivio.BOZZA && this.archivio?.livello < 3);
    this.referenceTableComponent = {} as CaptionReferenceTableComponent;
  }

  /**
   * Gestione del cambio di contenuto richiesto dall'utente
   * Può voler vedere i sottoarchivi, i documenti o il dettaglio dell'archivio
   * @param event 
   */
  public onSelectButtonItemSelection(event: any): void {
    switch (event.option.id) {
      case SelectButton.SOTTOARCHIVI:
        this.setForSottoarchivi();
        break;
      case SelectButton.DOCUMENTI:
        this.setForDocumenti();
        break;
      case SelectButton.DETTAGLIO:
        this.setForDettaglio();
        break;
    }
  }

  public onUpdateArchivio(event: any): void {

  }

  /**
   * Calcolo la lista di selectButton che vogliamo vedere.
   * In particolare se l'archivio aperto è un inserto allora
   * non sarà presente l'opzione sottoarchvi.
   */
  public buildSelectButtonItems(archivio: Archivio | ArchivioDetail): void {
    this.selectButtonItems = [];
    switch (archivio.livello) {
      case 1:
        this.selectButtonItems.push(
          {
            id: SelectButton.SOTTOARCHIVI,
            label: "Sottofascicoli",
            disabled: this.archivio.stato === StatoArchivio.BOZZA
          }
        );
      break;
      case 2:
        this.selectButtonItems.push(
          {
            id: SelectButton.SOTTOARCHIVI,
            label: "Inserti",
            disabled: this.archivio.stato === StatoArchivio.BOZZA
          }
        );
      break;
    }
    
    this.selectButtonItems.push(
      {
        id: SelectButton.DOCUMENTI,
        label: "Documenti",
        disabled: this.archivio.stato === StatoArchivio.BOZZA
      },
      {
        id: SelectButton.DETTAGLIO,
        label: "Dettaglio"
      }
    );
  }

  /**
   * 
   * @param archivio 
   */
  public buildNewArchivioButton(archivio: Archivio | ArchivioDetail): void {
    const aziendaItem: MenuItem = {
      label: this.archivio.idAzienda.nome,
      disabled: false,
      command: () => this.archivilist.newArchivio(this.archivio.idAzienda.id)
    } as MenuItem;

    switch (archivio.livello) {
      case 1:
        this.newArchivoButton = {
          tooltip: "Crea nuovo sottofascicolo",
          livello: 1,
          aziendeItems: [aziendaItem]
        };
      break;
      case 2:
        this.newArchivoButton ={
          tooltip: "Crea nuovo inserto",
          livello: 2 ,
          aziendeItems: [aziendaItem]
        };
      break;
    }
  }
}

export enum SelectButton {
  SOTTOARCHIVI = "SOTTOARCHIVI",
  DOCUMENTI = "DOCUMENTI",
  DETTAGLIO = "DETTAGLIO"
}
