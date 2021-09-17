import { DatePipe } from "@angular/common";
import { Component, ElementRef, Input, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Azienda, CODICI_RUOLO, DocList, Firmatario, Persona, PersonaService, PersonaVedente, PersonaUsante, Struttura, StrutturaService, UrlsGenerationStrategy } from "@bds/ng-internauta-model";
import { LOCAL_IT } from "@bds/nt-communicator";
import { NtJwtLoginService, UtenteUtilities } from "@bds/nt-jwt-login";
import { buildLazyEventFiltersAndSorts, CsvExtractor } from "@bds/primeng-plugin";
import { AdditionalDataDefinition, FilterDefinition, FilterJsonDefinition, FiltersAndSorts, FILTER_TYPES, PagingConf, SortDefinition, SORT_MODES } from "@nfa/next-sdr";
import { LazyLoadEvent, MessageService } from "primeng/api";
import { AutoComplete } from "primeng/autocomplete";
import { MultiSelect } from "primeng/multiselect";
import { ColumnFilter, Table } from "primeng/table";
import { Subscription } from "rxjs";
import { AppService } from "../app.service";
import { Impostazioni } from "../utilities/utils";
import { ColonnaBds, cols, colsCSV, DocsListMode, StatoDocTraduzioneVisualizzazione, StatoUfficioAttiTraduzioneVisualizzazione, TipologiaDocTraduzioneVisualizzazione } from "./docs-list-constants";
import { ExtendedDocList } from "./extended-doc-list";
import { ExtendedDocListService } from "./extended-doc-list.service";

@Component({
  selector: "docs-list",
  templateUrl: "./docs-list.component.html",
  styleUrls: ["./docs-list.component.scss"]
})
export class DocsListComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription[] = [];
  private loadDocsListSubscription: Subscription;
  private pageConf: PagingConf = { mode: "LIMIT_OFFSET", conf: { limit: 0, offset: 0 } };
  private utenteUtilitiesLogin: UtenteUtilities;
  private resetDocsArrayLenght: boolean = true;
  private storedLazyLoadEvent: LazyLoadEvent;

  @ViewChild("dt") public dataTable: Table;
  @ViewChild("multiSelectAzienda") public multiSelectAzienda: MultiSelect;
  @ViewChild("columnFilterAzienda") public columnFilterAzienda: ColumnFilter;
  @ViewChild("autocompleteIdPersonaRedattrice") public autocompleteIdPersonaRedattrice: AutoComplete;
  @ViewChild("autocompleteidPersonaResponsabileProcedimento") public autocompleteidPersonaResponsabileProcedimento: AutoComplete;
  @ViewChild("autocompleteIdStrutturaRegistrazione") public autocompleteIdStrutturaRegistrazione: AutoComplete;
  @ViewChild("autocompleteFirmatari") public autocompleteFirmatari: AutoComplete;
  @ViewChild("autocompleteSullaScrivaniaDi") public autocompleteSullaScrivaniaDi: AutoComplete;
  @ViewChild("inputGobalFilter") public inputGobalFilter: ElementRef;

  @ViewChildren(ColumnFilter) filterColumns: QueryList<ColumnFilter>

  public docsListMode: DocsListMode;
  public docs: ExtendedDocList[];
  public enumDocsListMode = DocsListMode;
  public totalRecords: number;
  public aziendeFiltrabili: Azienda[] = [];
  public cols: ColonnaBds[] = [];
  public _selectedColumns: any[];
  public rowsNumber: number = 20;
  public tipologiaVisualizzazioneObj = TipologiaDocTraduzioneVisualizzazione;
  public statoVisualizzazioneObj = StatoDocTraduzioneVisualizzazione;
  public statoUfficioAttiVisualizzazioneObj = StatoUfficioAttiTraduzioneVisualizzazione;
  public localIt = LOCAL_IT;
  public mieiDocumenti: boolean = true;
  public filteredPersone: Persona[] = [];
  public filteredStrutture: Struttura[] = [];
  public loading: boolean = false;
  public exportCsvInProgress: boolean = false;

  constructor(
    private messageService: MessageService,
    private docListService: ExtendedDocListService,
    private personaService: PersonaService,
    private strutturaService: StrutturaService,
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
          if (this.docsListMode) {
            this.calcolaAziendeFiltrabili();
          }
          this.loadConfigurationAndSetItUp();
        }
      )
    );

    /* Mi sottoscrivo alla rotta per leggere la modalita dell'elenco documenti
      e faccio partire il caricamento. Ogni volta che la modalità cambia
      rifaccio la loadData */
    this.route.queryParams.subscribe(params => {
      this.docsListMode = params["mode"];
      if (this.utenteUtilitiesLogin) this.calcolaAziendeFiltrabili();
      this.resetAndLoadData();
    });

    this.appService.appNameSelection("Elenco documenti");

  }

  @Input() get selectedColumns(): any[] {
    return this._selectedColumns;
  }

  set selectedColumns(val: any[]) {
    // restore original order
    this._selectedColumns = this.cols.filter(col => val.includes(col));
    this.saveConfiguration();
  }

  /**
   * Gestisco l'evento di cambiamento delle colonne visualizzate.
   * In particolare se ho tolto una colonna che era filtrata, tolgo quel filtro.
   * @param event 
   */
  public onChangeSelectedColumns(event: any): void {
    if (!event.value.some((e: ColonnaBds) => e.field === event.itemValue.field)) {
      // Se itemValue non è dentro l'elenco value allora ho tolto la spunta e quella colonna non è più visibile
      const col = this.filterColumns.find((e: ColumnFilter) => e.field === event.itemValue.filterField);
      if (col.hasFilter()) {
        col.clearFilter();
      }
    }
  }

  /**
   * Questa funzione si occupa di caricare la configurazione personale
   * dell'utente per il componente.
   * Sulla base di questo vengono poi settate le colonne visualizzate
   * ed il filtro "miei documenti"
   */
  private loadConfigurationAndSetItUp(): void {
    this.cols = cols;
    const impostazioni = this.utenteUtilitiesLogin.getImpostazioniApplicazione();
    console.log("sa,",this.utenteUtilitiesLogin.getImpostazioniApplicazione());

    if (impostazioni && impostazioni.impostazioniVisualizzazione && impostazioni.impostazioniVisualizzazione !== "") {
      const settings: Impostazioni = JSON.parse(impostazioni.impostazioniVisualizzazione) as Impostazioni;
      if (settings["scripta.docList"]) {
        this.mieiDocumenti = settings["scripta.docList"].mieiDocumenti;
        this._selectedColumns = this.cols.filter(c => settings["scripta.docList"].selectedColumn.some(e => e === c.field));
      }
    }

    // Configurazione non presente o errata. Uso quella di default.
    if (!this._selectedColumns || this._selectedColumns.length === 0) {
      this._selectedColumns = this.cols.filter(c => c.default);
    }
  }

  /**
   * Salva la configurazione colonne e la configurazione del flag mieiDocumenti
   */
  public saveConfiguration() {
    const impostazioniVisualizzazione = this.utenteUtilitiesLogin.getImpostazioniApplicazione() ? this.utenteUtilitiesLogin.getImpostazioniApplicazione().impostazioniVisualizzazione : null;
    let impostazioniVisualizzazioneObj: Impostazioni;
    if (impostazioniVisualizzazione && impostazioniVisualizzazione !== "") {
      impostazioniVisualizzazioneObj = JSON.parse(impostazioniVisualizzazione) as Impostazioni;
    } else {
      impostazioniVisualizzazioneObj = {
        "scripta.docList": {}
      } as Impostazioni;
    }
    impostazioniVisualizzazioneObj["scripta.docList"].mieiDocumenti = this.mieiDocumenti;
    impostazioniVisualizzazioneObj["scripta.docList"].selectedColumn = this.selectedColumns.map(c => c.field);
    this.utenteUtilitiesLogin.setImpostazioniApplicazione(this.loginService, impostazioniVisualizzazioneObj);
  }

  /**
   * L'utente ha cliccato per aprire un documento.
   * Gestisco l'evento
   * @param doc
   */
  public openDoc(doc: DocList) {
    const isPersonaVedente = doc.personeVedenti.some(p => p.idPersona === this.utenteUtilitiesLogin.getUtente().idPersona.id);
    if (isPersonaVedente) {
      const encodeParams = doc.idApplicazione.urlGenerationStrategy === UrlsGenerationStrategy.TRUSTED_URL_WITH_CONTEXT_INFORMATION ||
        doc.idApplicazione.urlGenerationStrategy === UrlsGenerationStrategy.TRUSTED_URL_WITHOUT_CONTEXT_INFORMATION;
      const addRichiestaParam = true;
      const addPassToken = true;
      this.loginService.buildInterAppUrl(doc.urlComplete, encodeParams, addRichiestaParam, addPassToken, true).subscribe((url: string) => {
        console.log("urlAperto:", url);
      });
    } else {
      this.messageService.add({
        severity: "info",
        summary: "Attenzione",
        detail: `Apertura del documento non consentita`
      });
    }
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
   * Metodo che toglie il sort dalle colonne della tabella.
   * In particolare è usata dagli input dei campi che quando usati ordinano per ranking
   */
  public resetSort() {
    this.dataTable.sortField = null;
    this.dataTable.sortOrder = null;
    this.dataTable.tableService.onSort(null);
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
    this.loading = true;
    this.pageConf.conf = {
      limit: this.storedLazyLoadEvent.rows,
      offset: this.storedLazyLoadEvent.first
    };
    if (this.loadDocsListSubscription) {
      this.loadDocsListSubscription.unsubscribe();
      this.loadDocsListSubscription = null;
    }
    this.loadDocsListSubscription = this.docListService.getData(
        "DocListWithIdApplicazioneAndIdAziendaAndIdPersonaRedattriceAndIdPersonaResponsabileProcedimentoAndIdStrutturaRegistrazione",
        this.buildCustomFilterAndSort(),
        buildLazyEventFiltersAndSorts(this.storedLazyLoadEvent, this.cols, this.datepipe),
        this.pageConf).subscribe((data: any) => {
        console.log(data);
        this.totalRecords = data.page.totalElements;
        this.loading = false;

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
        this.docs = [...this.docs]; // trigger change detection
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
      // doc.fascicolazioniVisualizzazione = null;
      doc.statoUfficioAttiVisualizzazione = doc.statoUfficioAtti;
      doc.idPersonaResponsabileProcedimentoVisualizzazione = null;
      doc.idPersonaRedattriceVisualizzazione = null;
    });
    return extendedDocsList;
  }

  /**
   * Funzione chiamata tipicamente dall'autocomplete per riempire la
   * variabile di opzioni: filteredPersone con le persone che
   * corrispondono al filtro utente. Viene aggiunta la condizione che la persona
   * deve avere un utente nelle aziende visualizzabili dall'utente connesso.
   * NB: Non mi interessa che persone o i suoi utenti non siano attivi.
   * Li cerco lo stesso perché l'utente potrebbe proprio cercare la roba fatta
   * da utenti spenti.
   * @param event
   */
  public filterPersone(event: any ) {
    const filtersAndSorts = new FiltersAndSorts();
    filtersAndSorts.addFilter(new FilterDefinition("descrizione", FILTER_TYPES.string.containsIgnoreCase, event.query));
    this.aziendeFiltrabili.forEach(a => {
      filtersAndSorts.addFilter(new FilterDefinition("utenteList.idAzienda.id", FILTER_TYPES.not_string.equals, a.id));
    });
    this.personaService.getData(null, filtersAndSorts, null)
      .subscribe(res => {
        if (res && res.results) {
          res.results.forEach((persona: any) => {
            persona["descrizioneVisualizzazione"] = persona.descrizione + (persona.idSecondario ? " (" + persona.idSecondario + ")" : "");
          });
          this.filteredPersone = res.results;
        } else {
          this.filteredPersone = [];
        }
    });
  }


  /**
   * Usato per generare la stringa json che serve a filtrare
   * per l'appunto, una colonna json. In questo caso è una persona.
   * NB: Se ne servissero altri (oltre la persona) si può rendere più generica qeusta funzione.
   * @param idPersona
   * @returns
   */
  public buildJsonValueForFilterPersone(idPersona: number): string {
    if (idPersona) {
      const filtroJson: FilterJsonDefinition<PersonaUsante> = new FilterJsonDefinition(true);
      filtroJson.add("idPersona", idPersona);
      return filtroJson.buildJsonString();
    }
    return null;
  }

  /**
   * Funzione chiamata tipicamente dall'autocomplete per riempire la
   * variabile di opzioni: filteredStrutture con le strutture che
   * corrispondono al filtro utente. Viene aggiunta la condizione che la struttura
   * deve appartenere alle aziende visualizzabili dall'utente connesso.
   * NB: Non mi interessa che la struttura non sia attiva
   * @param event
   */
  public filterStrutture(event: any) {
    const filtersAndSorts = new FiltersAndSorts();
    filtersAndSorts.addFilter(new FilterDefinition("nome", FILTER_TYPES.string.containsIgnoreCase, event.query));
    this.aziendeFiltrabili.forEach(a => {
      filtersAndSorts.addFilter(new FilterDefinition("idAzienda.id", FILTER_TYPES.not_string.equals, a.id));
    });
    this.strutturaService.getData("StrutturaWithIdAzienda", filtersAndSorts, null)
      .subscribe(res => {
        if (res && res.results) {
          res.results.forEach((struttura: any) => {
            struttura["descrizioneVisualizzazione"] =
              (!struttura.attiva ? "(disattiva) " : "")
              + struttura.nome
              + (struttura.idCasella ? " (" + struttura.idCasella + ")" : "")
              + (struttura.idCasellaPadre ? " [" + struttura.idCasellaPadre + "]" : "")
              + " - " + struttura.idAzienda.nome;
          });
          this.filteredStrutture = res.results;
        } else {
          this.filteredStrutture = [];
        }
    });
  }

  /**
   * Funzione che si occupa di fare il clear di tutti i filtri della tabella.
   * In particolare quelli delle autocomplete che sono "separati" dal semplice
   * table.reset() vengono fatti a patto che quell'autocomplete esista.
   * @param table
   */
  public clear(): void {
    this.inputGobalFilter.nativeElement.value = "";
    this.dataTable.filters.global = {
      value: null,
      matchMode: null
    };
    // this.autocompleteIdPersonaRedattrice.selectItem(null, false);
    if (this.autocompleteIdPersonaRedattrice) this.autocompleteIdPersonaRedattrice.writeValue(null);
    if (this.autocompleteidPersonaResponsabileProcedimento) this.autocompleteidPersonaResponsabileProcedimento.writeValue(null);
    if (this.autocompleteIdStrutturaRegistrazione) this.autocompleteIdStrutturaRegistrazione.writeValue(null);
    if (this.autocompleteFirmatari) this.autocompleteFirmatari.writeValue(null);
    if (this.autocompleteSullaScrivaniaDi) this.autocompleteSullaScrivaniaDi.writeValue(null);
    this.dataTable.reset();
  }

  /**
   * Metodo che intercetta la ricerca globale. E' solo un passa carte.
   * Di fatto poi scatta l'onLazyLoad
   * @param event 
   * @param matchMode 
   */
  public applyFilterGlobal(event: Event, matchMode: string) {
    this.dataTable.filterGlobal((event.target as HTMLInputElement).value, matchMode);
  }

  /**
   * Questo metodo si occupa di esportare la docList in CSV.
   * Vengono rispettati i filtri.
   * La PageConf è senza limite
   */
  public exportCSV(table: Table) {
    this.exportCsvInProgress = true;
    const tableTemp = {} as Table;
    Object.assign(tableTemp, table);
    const pageConfNoLimit: PagingConf = {
      conf: {
        page: 0,
        size: 999999
      },
      mode: "PAGE"
    };
    this.docListService.getData(
      "DocListWithIdApplicazioneAndIdAziendaAndIdPersonaRedattriceAndIdPersonaResponsabileProcedimentoAndIdStrutturaRegistrazione",
      this.buildCustomFilterAndSort(),
      buildLazyEventFiltersAndSorts(this.storedLazyLoadEvent, this.cols, this.datepipe),
      pageConfNoLimit)
      .subscribe(
        res => {
          if (res && res.results) {
            tableTemp.value = this.setCustomProperties(res.results);
            tableTemp.columns = colsCSV.filter(c => this.selectedColumns.some(e => e.field === c.fieldId));
            const extractor = new CsvExtractor();
            extractor.exportCsv(tableTemp);
          }
          
          this.exportCsvInProgress = false;
        },
        err => {
          this.exportCsvInProgress = false;
        }
    );
  }

  /**
   * Oltre desottoscrivermi dalle singole sottoscrizioni, mi
   * desottoscrivo anche dalla specifica loadDocsListSubscription
   * Che appositamente è separata in quanto viene spesso desottoscritta
   * e risottroscritta.
   */
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
