import { DatePipe } from '@angular/common';
import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Azienda, CODICI_RUOLO, DocList, PersonaVedente, StatoDoc } from "@bds/ng-internauta-model";
import { LOCAL_IT } from '@bds/nt-communicator';
import { NtJwtLoginService, UtenteUtilities } from '@bds/nt-jwt-login';
import { buildLazyEventFiltersAndSorts } from '@bds/primeng-plugin';
import { AdditionalDataDefinition, FilterDefinition, FilterJsonDefinition, FiltersAndSorts, FILTER_TYPES, PagingConf, SortDefinition, SORT_MODES } from '@nfa/next-sdr';
import { LazyLoadEvent } from 'primeng/api';
import { MultiSelect } from 'primeng/multiselect';
import { ColumnFilter, Table } from 'primeng/table';
import { Subscription } from 'rxjs';
import { AppService } from '../app.service';
import { cols, DocsListMode, StatoDocTraduzioneVisualizzazione, TipologiaDocTraduzioneVisualizzazione } from './docs-list-constants';
import { ExtendedDocList } from './extended-doc-list';
import { ExtendedDocListService } from './extended-doc-list.service';

@Component({
  selector: 'docs-list',
  templateUrl: './docs-list.component.html',
  styleUrls: ['./docs-list.component.scss']
})
export class DocsListComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription[] = [];
  private loadDocsListSubscription: Subscription;
  private pageConf: PagingConf = { mode: "LIMIT_OFFSET", conf: { limit: 0, offset: 0 } };
  private utenteUtilitiesLogin: UtenteUtilities;
  private resetDocsArrayLenght: boolean = true;
  private storedLazyLoadEvent: LazyLoadEvent;
  private docsListMode: DocsListMode;

  @ViewChild("dt") private dataTable: Table;
  @ViewChild("multiSelectAzienda") private multiSelectAzienda: MultiSelect;
  @ViewChild("columnFilterAzienda") private columnFilterAzienda: ColumnFilter;

  public docs: ExtendedDocList[];
  public enumDocsListMode = DocsListMode;
  public totalRecords: number;
  public aziendeFiltrabili: Azienda[] = [];
  public cols: any[] = [];
  public _selectedColumns: any[];
  public rowsNumber: number = 20;
  public tipologiaVisualizzazioneObj = TipologiaDocTraduzioneVisualizzazione;
  public statoVisualizzazioneObj = StatoDocTraduzioneVisualizzazione;
  public localIt = LOCAL_IT;
  public mieiDocumenti: boolean = true;
  
  constructor(
    private docListService: ExtendedDocListService,
    private loginService: NtJwtLoginService,
    private datepipe: DatePipe,
    private route: ActivatedRoute,
    private appService: AppService
  ) { }

  ngOnInit(): void {
    this.subscriptions.push(
      this.loginService.loggedUser$.subscribe(
        (utenteUtilities: UtenteUtilities) => {
          this.utenteUtilitiesLogin = utenteUtilities;
          if (this.docsListMode) this.calcolaAziendeFiltrabili();
          // this.aziendeFiltrabili = this.utenteUtilitiesLogin.getUtente().aziendeAttive;
        }
      )
    );
    
    /* Mi sottoscrivo alla rotta per leggere la modalita dell'elenco documenti 
      e faccio partire il caricamento. Ogni volta che la modalità cambia
      rifaccio la loadData */
    this.route.queryParams.subscribe(params => {
      this.docsListMode = params['mode'];
      if (this.utenteUtilitiesLogin) this.calcolaAziendeFiltrabili();
      this.resetAndLoadData();
    });
    
    this.appService.appNameSelection("Elenco documenti");
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
   * Questo metodo si occupa di riempire l'array delle aziende filtrabili
   * Nel caso del tab Registrazioni il filtro si fa stringente se l'utente 
   * non è SD o CI ma è solo OS o MOS.
   */
  private calcolaAziendeFiltrabili() {
    this.aziendeFiltrabili = [];
    if (this.docsListMode !== DocsListMode.REGISTRAZIONI
        || this.utenteUtilitiesLogin.hasRole(CODICI_RUOLO.SD)) {
      this.aziendeFiltrabili = this.utenteUtilitiesLogin.getUtente().aziendeAttive;
    } else if (this.utenteUtilitiesLogin.hasRole(CODICI_RUOLO.OS)
        || this.utenteUtilitiesLogin.hasRole(CODICI_RUOLO.MOS)) {
      /* Se entro qui allora sono nel tab registrazioni e non sono SD ma
          sono OS/MOS e quindi ho diritto di vedere comunque il tab.
          In particolare le aziende che posso vedere in questo tab sono solo quelle dove sono
          OS/MOS. Questo di cui parlo è un filtro solo frontend.
      */
      let codiceAziendeOSMOS: string[] = [];
      if (this.utenteUtilitiesLogin.getUtente().ruoliUtentiPersona[CODICI_RUOLO.OS]) {
        codiceAziendeOSMOS = codiceAziendeOSMOS.concat(this.utenteUtilitiesLogin.getUtente().ruoliUtentiPersona[CODICI_RUOLO.OS]["GENERALE"]);
      }
      if (this.utenteUtilitiesLogin.getUtente().ruoliUtentiPersona[CODICI_RUOLO.MOS]) {
        codiceAziendeOSMOS = codiceAziendeOSMOS.concat(this.utenteUtilitiesLogin.getUtente().ruoliUtentiPersona[CODICI_RUOLO.MOS]["GENERALE"]);
      }
      this.aziendeFiltrabili = this.utenteUtilitiesLogin.getUtente().aziendeAttive.filter(a => codiceAziendeOSMOS.indexOf(a.codice) != -1);
      // Svuoto l'eventuale filtro nel caso fosse stato usato
      if (this.multiSelectAzienda && this.columnFilterAzienda) {
        this.multiSelectAzienda.value = [];
        this.columnFilterAzienda.clearFilter();
      }
    }
  }

  /**
   * Metodo chiamato dalla tabella.
   * Calcola il pageconf, salva i filtri e chiama la loadData
   * @param event 
   */
  public onLazyLoad(event: LazyLoadEvent): void {
    console.log("event lazload", event);

    if (event.first === 0 && event.rows === this.rowsNumber) {
      event.rows = event.rows * 2;
      this.resetDocsArrayLenght = true;
    }

    console.log(`Chiedo ${this.pageConf.conf.limit} righe con offset di ${this.pageConf.conf.offset}`);
    this.storedLazyLoadEvent = event;
    this.loadData();
  }

  /**
   * Metodo chiamato dal frontend quando l'utente cambia valore al flag mieiDocumenti
   * Risetta la configurazione pagine e chiama la laoddata
   */
  public resetAndLoadData() {
    this.resetDocsArrayLenght = true;
    if (!!!this.storedLazyLoadEvent) {
      this.storedLazyLoadEvent = {};
    }
    this.storedLazyLoadEvent.first = 0;
    this.storedLazyLoadEvent.rows = this.rowsNumber * 2;
    this.loadData();
  }

  /**
   * Questo metodo costruisce filtri e sorting non provenienti dalla p-table
   * In particolare si occupa di impostare i giusti filtri a seconda
   * del tab selezionato (docsListMode)
   * @returns 
   */
  private buildCustomFilterAndSort(): FiltersAndSorts {
    const filterAndSort = new FiltersAndSorts();

    switch (this.docsListMode) {
      case DocsListMode.ELENCO_DOCUMENTI:
        const filtroJson: FilterJsonDefinition<PersonaVedente> = new FilterJsonDefinition(true);
        filtroJson.add("idPersona", this.utenteUtilitiesLogin.getUtente().idPersona.id);

        if (this.mieiDocumenti) {
          filtroJson.add("mioDocumento", true);
        }

        filterAndSort.addFilter(new FilterDefinition("personeVedenti", FILTER_TYPES.not_string.equals, filtroJson.buildJsonString()));
        filterAndSort.addSort(new SortDefinition("dataCreazione", SORT_MODES.desc));
        break;
      case DocsListMode.IFIRMARIO:
        filterAndSort.addAdditionalData(new AdditionalDataDefinition("OperationRequested", "VisualizzaTabIFirmario"));
        filterAndSort.addSort(new SortDefinition("dataCreazione", SORT_MODES.desc));
        break;
      case DocsListMode.IFIRMATO:
        filterAndSort.addAdditionalData(new AdditionalDataDefinition("OperationRequested", "VisualizzaTabIFirmato"));
        filterAndSort.addSort(new SortDefinition("dataRegistrazione", SORT_MODES.desc));
        break;
      case DocsListMode.REGISTRAZIONI:
        filterAndSort.addAdditionalData(new AdditionalDataDefinition("OperationRequested", "VisualizzaTabRegistrazioni"));
        filterAndSort.addSort(new SortDefinition("dataRegistrazione", SORT_MODES.desc));
        break;
    }

    return filterAndSort;
  }

  /**
   * Builda i filtri della tabella. Aggiunge eventuali altri filtri.
   * Carica i docs per la lista.
   * @param event 
   */
  private loadData(): void {
    this.pageConf.conf = {
      limit: this.storedLazyLoadEvent.rows,
      offset: this.storedLazyLoadEvent.first
    };
    if (this.loadDocsListSubscription) { 
      this.loadDocsListSubscription.unsubscribe();
      this.loadDocsListSubscription = null;
    }
    this.loadDocsListSubscription = this.docListService.getData(
			"DocListWithIdAzienda", 
      this.buildCustomFilterAndSort(), 
      buildLazyEventFiltersAndSorts(this.storedLazyLoadEvent, this.cols, this.datepipe), 
      this.pageConf
		).subscribe((data: any) => {
      console.log(data);
      this.totalRecords = data.page.totalElements;

      if (this.resetDocsArrayLenght) {
        /* Ho bisogno di far capire alla tabella quanto l'array docs è virtualmente grande
          in questo modo la scrollbar sarà sufficientemente lunga per scrollare fino all'ultimo elemento
          ps:a quanto pare la proprietà totalRecords non è sufficiente. */
        this.resetDocsArrayLenght = false;
        this.dataTable.resetScrollTop();
        this.docs = Array.from({length: this.totalRecords});
      }

      if (this.pageConf.conf.offset === 0 && data.page.totalElements < this.pageConf.conf.limit) {
        /* Questo meccanismo serve per cancellare i risultati di troppo della tranche precedente. 
        Se entro qui probabilmente ho fatto una ricerca */
        Array.prototype.splice.apply(this.docs, [0, this.docs.length, ...this.setCustomProperties(data.results)]);
      } else {
        Array.prototype.splice.apply(this.docs, [this.storedLazyLoadEvent.first, this.storedLazyLoadEvent.rows, ...this.setCustomProperties(data.results)]);
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
      doc.oggettoVisualizzazione = doc.oggetto;
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
    if (this.loadDocsListSubscription) {
      this.loadDocsListSubscription.unsubscribe();
    }
  }
}
