import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { LazyLoadEvent } from 'primeng/api';
import { Azienda, DocList, TipologiaDoc } from "@bds/ng-internauta-model";
import { ExtendedDocListService } from './extended-doc-list.service';
import { FiltersAndSorts, PagingConf, SortDefinition, SORT_MODES } from '@nfa/next-sdr';
import { ExtendedDocList } from './extended-doc-list';
import { DatePipe } from '@angular/common';
import { cols } from './docs-list-constants';
import { buildLazyEventFiltersAndSorts } from '@bds/primeng-plugin';
import { Subscription } from 'rxjs';
import { NtJwtLoginService, UtenteUtilities } from '@bds/nt-jwt-login';


@Component({
  selector: 'docs-list',
  templateUrl: './docs-list.component.html',
  styleUrls: ['./docs-list.component.scss']
})
export class DocsListComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription[] = [];
  private pageConf: PagingConf = { mode: "LIMIT_OFFSET", conf: { limit: 0, offset: 0 } };
  private utenteUtilitiesLogin: UtenteUtilities;

  public docs: ExtendedDocList[] = [];
  public totalRecords: number;
  public aziendeAttivePersonaConnessa: Azienda[] = [];
  public cols: any[] = [];
  public _selectedColumns: any[];
  public rowsNumber: number = 20;

  public mieiDocumenti: boolean = true;

  constructor(
    private docListService: ExtendedDocListService,
    private loginService: NtJwtLoginService,
    private datepipe: DatePipe
  ) { }

  ngOnInit(): void {
    this.subscriptions.push(
      this.loginService.loggedUser$.subscribe(
        (utenteUtilities: UtenteUtilities) => {
          this.utenteUtilitiesLogin = utenteUtilities;
          this.aziendeAttivePersonaConnessa = this.utenteUtilitiesLogin.getUtente().aziendeAttive;
        }
      )
    );
    this.cols = cols;
    this._selectedColumns = this.cols;
  }

  @Input() get selectedColumns(): any[] {
    return this._selectedColumns;
  }

  set selectedColumns(val: any[]) {
    // restore original order
    this._selectedColumns = this.cols.filter(col => val.includes(col));
  }

  /**
   * 
   * @param event 
   */
  public onLazyLoad(event: LazyLoadEvent): void {
    console.log("event lazload", event);
    this.pageConf.conf = {
      limit: (event.first === 0 && event.rows === this.rowsNumber) ? event.rows * 2 : event.rows,
      offset: event.first
    };
    console.log(`Chiedo ${this.pageConf.conf.limit} righe con offset di ${this.pageConf.conf.offset}`);
    this.loadData(event);
  }

  /**
   * 
   * @param event 
   */
  private loadData(event: any): void {
    const lazyLoadFiltersAndSorts = buildLazyEventFiltersAndSorts(event, this.cols, this.datepipe);
    const sort = new FiltersAndSorts();
    sort.addSort(new SortDefinition("id", SORT_MODES.asc));
    this.docListService.getData(
			"DocListWithIdAzienda", sort, lazyLoadFiltersAndSorts, this.pageConf
		).subscribe((data: any) => {
      console.log(data);
      this.totalRecords = data.page.totalElements;
      if (this.pageConf.conf.offset === 0 && data.page.totalElements < this.pageConf.conf.limit) {
        // Questo meccanismo serve per cancellare i risultati di troppo della tranche precedente. 
        // Se entro qui probabilmente ho fatto una ricerca
        Array.prototype.splice.apply(this.docs, [0, this.docs.length, ...this.setCustomProperties(data.results)]);
      } else {
        Array.prototype.splice.apply(this.docs, [event.first, event.rows, ...this.setCustomProperties(data.results)]);
      }
      this.docs = [...this.docs]; //trigger change detection
    });
  }

  /**
   * Parso DocList[] facendolo diventare ExtendedDocList[] con le 
   * proprietà utili alla visualizzazione popolate 
   * @param docsList 
   * @returns 
   */
  private setCustomProperties(docsList: DocList[]): ExtendedDocList[] {
    const extendedDocsList: ExtendedDocList[] = docsList as ExtendedDocList[];
    extendedDocsList.forEach((doc: ExtendedDocList) => {
      Object.setPrototypeOf(doc, ExtendedDocList.prototype);
      doc.tipologiaVisualizzazioneAndCodiceRegistro = doc;
      doc.registrazioneVisualizzazione = null; // Qui sto passando null. Ma è un trucco, in realtà sto settando i valori.
      doc.propostaVisualizzazione = null;
      doc.statoVisualizzazione = doc.stato;
      doc.fascicolazioniVisualizzazione = null;
    });
    return extendedDocsList;
  }

  public ngOnDestroy(): void {
    if (this.subscriptions) {
      this.subscriptions.forEach(
        s => s.unsubscribe()
      );
    }
    this.subscriptions = [];
  }
}
