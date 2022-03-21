import { AfterViewInit, Component, Input, ViewChild } from '@angular/core';
import { ArchivioDetail, StatoArchivio } from '@bds/ng-internauta-model';
import { ArchiviListComponent } from '../archivi-list-container/archivi-list/archivi-list.component';
import { DocsListComponent } from '../docs-list-container/docs-list/docs-list.component';
import { CaptionArchiviComponent } from '../generic-caption-table/caption-archivi.component';
import { CaptionConfiguration } from '../generic-caption-table/caption-configuration';
import { CaptionReferenceTableComponent } from '../generic-caption-table/caption-reference-table.component';
import { CaptionSelectButtonsComponent } from '../generic-caption-table/caption-select-buttons.component';
import { SelectButtonItem } from '../generic-caption-table/select-button-item';
import { TabComponent } from '../navigation-tabs/tab.component';
import { DettaglioArchivioComponent } from './dettaglio-archivio/dettaglio-archivio.component';

@Component({
  selector: 'app-archivio',
  templateUrl: './archivio.component.html',
  styleUrls: ['./archivio.component.scss']
})
export class ArchivioComponent implements AfterViewInit, TabComponent, CaptionSelectButtonsComponent {
  private _archivio: ArchivioDetail;
  get archivio(): ArchivioDetail { return this._archivio; }
  @Input() set data(data: any) {
    this._archivio = data.archivio;
    this.inizializeAll();
  }

  @ViewChild("archivilist") public archivilist: ArchiviListComponent;
  @ViewChild("doclist") public doclist: DocsListComponent;
  @ViewChild("dettaglioarchivio") public dettaglioarchivio: DettaglioArchivioComponent;

  public captionConfiguration: CaptionConfiguration;
  public referenceTableComponent: CaptionReferenceTableComponent;
  public archiviComponent: CaptionArchiviComponent;
  public selectButtonItems: SelectButtonItem[];
  public selectedButtonItem: SelectButtonItem;

  constructor() {}
  
  ngAfterViewInit(): void {
    console.log(this.archivio.stato)
    this.inizializeAll();
  }

  private inizializeAll(): void{
    this.buildSelectButtonItems(this._archivio);
    if (this.archivio.stato === StatoArchivio.BOZZA) {
      this.selectedButtonItem = this.selectButtonItems.find(x => x.id === SelectButton.DETTAGLIO);
      this.setForDettaglio();
    } else {
      this.selectedButtonItem = this.selectButtonItems.find(x => x.id === SelectButton.SOTTOARCHIVI);
      this.setForSottoarchivi();
    }
  }

  private setForSottoarchivi(): void{
    this.captionConfiguration = new CaptionConfiguration(true, true, true, true, this.archivio?.stato !== StatoArchivio.BOZZA && this.archivio?.livello < 3);
    this.referenceTableComponent = this.archivilist;
    this.archiviComponent = this.archivilist;
  }

  private setForDocumenti(): void{
    this.captionConfiguration = new CaptionConfiguration(true, true, true, true, false);
    this.referenceTableComponent = this.doclist;
    this.archiviComponent = this.archivilist;
  }

  private setForDettaglio(): void{
    this.captionConfiguration = new CaptionConfiguration(false, true, false, false, this.archivio?.stato !== StatoArchivio.BOZZA && this.archivio?.livello < 3);
    this.referenceTableComponent = {} as CaptionReferenceTableComponent;
    this.archiviComponent = this.archivilist;
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

  /**
   * Calcolo la lista di selectButton che vogliamo vedere.
   * In particolare se l'archivio aperto è un inserto allora
   * non sarà presente l'opzione sottoarchvi.
   */
  public buildSelectButtonItems(archivio: ArchivioDetail): void {
    this.selectButtonItems = [];
    if(archivio.livello == 1) {
      this.selectButtonItems.push(
        {
          id: SelectButton.SOTTOARCHIVI,
          label: "Sottofascicoli",
          disabled: this.archivio.stato === StatoArchivio.BOZZA
        },
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
    if(archivio.livello == 2) {
      this.selectButtonItems.push(
        {
          id: SelectButton.SOTTOARCHIVI,
          label: "Inserti",
          disabled: this.archivio.stato === StatoArchivio.BOZZA
        },
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
    if(archivio.livello == 3) {
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

    
  }
}

export enum SelectButton {
  SOTTOARCHIVI = "SOTTOARCHIVI",
  DOCUMENTI = "DOCUMENTI",
  DETTAGLIO = "DETTAGLIO"
}
