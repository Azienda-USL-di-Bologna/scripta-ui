import { AfterViewInit, Component, Input, ViewChild } from '@angular/core';
import { ArchivioDetail } from '@bds/ng-internauta-model';
import { ArchiviListComponent } from '../archivi-list-container/archivi-list/archivi-list.component';
import { DocsListComponent } from '../docs-list-container/docs-list/docs-list.component';
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
  }

  @ViewChild("archivilist") public archivilist: ArchiviListComponent;
  @ViewChild("doclist") public doclist: DocsListComponent;
  @ViewChild("dettaglioarchivio") public dettaglioarchivio: DettaglioArchivioComponent;

  public captionConfiguration: CaptionConfiguration;
  public referenceTableComponent: CaptionReferenceTableComponent;
  public selectButtonItems: SelectButtonItem[];
  public selectedButtonItem: SelectButtonItem;

  constructor() {}
  
  ngAfterViewInit(): void {
    this.buildSelectButtonItems();
    this.selectedButtonItem = this.selectButtonItems[0];
    this.captionConfiguration = new CaptionConfiguration(true, true, true, true);
    this.referenceTableComponent = this.archivilist;
    //console.log(this.archivilist)
  }

  /**
   * Gestione del cambio di contenuto richiesto dall'utente
   * Può voler vedere i sottoarchivi, i documenti o il dettaglio dell'archivio
   * @param event 
   */
  public onSelectButtonItemSelection(event: any): void {
    switch (event.option.id) {
      case SelectButton.SOTTOARCHIVI:
        this.captionConfiguration = new CaptionConfiguration(true, true, true, true);
        this.referenceTableComponent = this.archivilist;
        break;
      case SelectButton.DOCUMENTI:
        this.captionConfiguration = new CaptionConfiguration(true, true, true, true);
        this.referenceTableComponent = this.doclist;
        break;
      case SelectButton.DETTAGLIO:
        this.captionConfiguration = new CaptionConfiguration(false, true, false, false);
        this.referenceTableComponent = {} as CaptionReferenceTableComponent;
        break;
    }
  }

  /**
   * Calcolo la lista di selectButton che vogliamo vedere.
   * In particolare se l'archivio aperto è un inserto allora
   * non sarà presente l'opzione sottoarchvi.
   */
  public buildSelectButtonItems(): void {
    this.selectButtonItems = [];
    this.selectButtonItems.push(
      {
        id: SelectButton.SOTTOARCHIVI,
        label: "Archivi figli"
      },
      {
        id: SelectButton.DOCUMENTI,
        label: "Documenti"
      },
      {
        id: SelectButton.DETTAGLIO,
        label: "Dettaglio"
      }
    );
  }
}

export enum SelectButton {
  SOTTOARCHIVI = "SOTTOARCHIVI",
  DOCUMENTI = "DOCUMENTI",
  DETTAGLIO = "DETTAGLIO"
}
