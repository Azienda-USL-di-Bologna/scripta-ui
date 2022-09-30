import { DatePipe } from "@angular/common";
import { Component, Input, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { CODICI_RUOLO, Persona, ArchivioDoc, ArchivioDocService, PersonaService, PersonaUsante, Struttura, StrutturaService, UrlsGenerationStrategy, DocDetailView, PersonaVedenteService, Archivio, PermessoArchivio, ArchivioService, ArchivioDetailViewService, DocDetail } from "@bds/internauta-model";
import { JwtLoginService, UtenteUtilities } from "@bds/jwt-login";
import { buildLazyEventFiltersAndSorts } from "@bds/primeng-plugin";
import { AdditionalDataDefinition, FilterDefinition, FilterJsonDefinition, FiltersAndSorts, FILTER_TYPES, NextSDREntityProvider, PagingConf, SortDefinition, SORT_MODES } from "@bds/next-sdr";
import { ConfirmationService, LazyLoadEvent, MessageService } from "primeng/api";
import { AutoComplete } from "primeng/autocomplete";
import { Dropdown } from "primeng/dropdown";
import { Calendar } from "primeng/calendar";
import { ColumnFilter, Table } from "primeng/table";
import { Subscription } from "rxjs";
import { first } from 'rxjs/operators'
import { DOCS_LIST_ROUTE } from "src/environments/app-constants";
import { Impostazioni } from "../../utilities/utils";
import { cols, colsCSV, DocsListMode, StatoDocDetailPerFiltro, StatoUfficioAttiTraduzioneVisualizzazione, TipologiaDocTraduzioneVisualizzazione } from "./docs-list-constants";
import { ExtendedDocDetailView } from "./extended-doc-detail-view";
import { ExtendedDocDetailService } from "./extended-doc-detail.service";
import { ExtendedDocDetailViewService } from "./extended-doc-detail-view.service";
import { MultiSelect } from "primeng/multiselect";
import { TabComponent } from "../../navigation-tabs/tab.component";
import { CaptionReferenceTableComponent } from '../../generic-caption-table/caption-reference-table.component';
import { CaptionSelectButtonsComponent } from '../../generic-caption-table/caption-select-buttons.component';
import { SelectButtonItem } from "../../generic-caption-table/select-button-item";
import { DecimalePredicato } from "@bds/internauta-model";
import { ColonnaBds, CsvExtractor } from "@bds/common-tools";
import { NavigationTabsService } from "../../navigation-tabs/navigation-tabs.service";
import { AppService } from "src/app/app.service";

@Component({
  selector: "docs-list",
  templateUrl: "./docs-list.component.html",
  styleUrls: ["./docs-list.component.scss"]
})
export class DocsListComponent implements OnInit, OnDestroy, TabComponent, CaptionReferenceTableComponent, CaptionSelectButtonsComponent {
  @Input() data: any;
  private subscriptions: Subscription[] = [];
  private loadDocsListSubscription: Subscription;
  private pageConf: PagingConf = { mode: "LIMIT_OFFSET_NO_COUNT", conf: { limit: 0, offset: 0 } };
  private utenteUtilitiesLogin: UtenteUtilities;
  private resetDocsArrayLenght: boolean = true;
  private storedLazyLoadEvent: LazyLoadEvent;
  private lastAziendaFilterValue: number[];
  //private lastStatoFilterValue: string[];
  private lastDataCreazioneFilterValue: Date[];

  @ViewChild("dt") public dataTable: Table;
  @ViewChild("dropdownAzienda") public dropdownAzienda: Dropdown;
  @ViewChild("multiselectStati") public multiselectStati: MultiSelect;
  @ViewChild("columnFilterAzienda") public columnFilterAzienda: ColumnFilter;
  @ViewChild("autocompleteIdPersonaRedattrice") public autocompleteIdPersonaRedattrice: AutoComplete;
  @ViewChild("autocompleteidPersonaResponsabileProcedimento") public autocompleteidPersonaResponsabileProcedimento: AutoComplete;
  @ViewChild("autocompletearchiviDocList") public autocompletearchiviDocList: AutoComplete;
  @ViewChild("autocompleteIdStrutturaRegistrazione") public autocompleteIdStrutturaRegistrazione: AutoComplete;
  @ViewChild("autocompleteFirmatari") public autocompleteFirmatari: AutoComplete;
  @ViewChild("autocompleteSullaScrivaniaDi") public autocompleteSullaScrivaniaDi: AutoComplete;
  //@ViewChild("inputGobalFilter") public inputGobalFilter: ElementRef;
  @ViewChild("calendarcreazione") public calendarcreazione: Calendar;
  @ViewChild("columnFilterDataCreazione") public columnFilterDataCreazione: ColumnFilter;

  @ViewChildren(ColumnFilter) filterColumns: QueryList<ColumnFilter>;

  public docsListMode: DocsListMode;
  public dataMinimaCreazione: Date = new Date("2000-01-01");
  public dataMassimaCreazione: Date = new Date("2030-12-31");
  public annoDiRicerca: Date;
  public docs: ExtendedDocDetailView[];
  public enumDocsListMode = DocsListMode;
  public totalRecords: number;
  public aziendeFiltrabili: ValueAndLabelObj[] = [];
  public cols: ColonnaBds[] = [];
  public _selectedColumns: ColonnaBds[] = [];
  public rowsNumber: number = 20;
  public tipologiaVisualizzazioneObj = TipologiaDocTraduzioneVisualizzazione;
  public statoVisualizzazioneObj = StatoDocDetailPerFiltro;
  // public statoVisualizzazioneObj = StatoDocTraduzioneVisualizzazione;
  public statoUfficioAttiVisualizzazioneObj = StatoUfficioAttiTraduzioneVisualizzazione;
  public mieiDocumenti: boolean = true;
  public filteredPersone: Persona[] = [];
  public filteredArchivi: Archivio[] = [];
  public filteredStrutture: Struttura[] = [];
  public loading: boolean = false;
  public initialSortField: string = "dataCreazione";
  public exportCsvInProgress: boolean = false;
  public selectButtonItems: SelectButtonItem[];
  public selectedButtonItem: SelectButtonItem = {
    title: "",
    label: "Miei documenti", 
    // icon: "pi pi-fw pi-list", 
    routerLink: ["./" + DOCS_LIST_ROUTE], 
    queryParams: {"mode": DocsListMode.MIEI_DOCUMENTI}
  };
  public isSegretario: boolean = false;
  private serviceForGetData: NextSDREntityProvider = null;
  private projectionFotGetData: string = null;
  public filtriPuliti: boolean = true;
  private mandatoryColumns: string[] = [];
  public selectableColumns: ColonnaBds[] = [];
  public filteredTipologia: any[];
  public filteredStati: any[];
  public filteredStatoUfficioAtti: any[];
  public aziendeFiltrabiliFiltered: any[];
  public loggedUserCanRestoreArchiviation: boolean = false;
  public loggedUserCanDeleteArchiviation: boolean = false;

  private _archivio: Archivio;
  get archivio(): Archivio { return this._archivio; }
  @Input() set archivio(archivio: Archivio) {
    this._archivio = archivio; 
    if (this.loadDocsListSubscription) {
      this.loadData();
    }
  }

  constructor(
    private messageService: MessageService,
    private docDetailService: ExtendedDocDetailService,
    private docDetailViewService: ExtendedDocDetailViewService,
    private personaVedenteSerice: PersonaVedenteService,
    private personaService: PersonaService,
    private archivioDetailViewService: ArchivioDetailViewService,
    private strutturaService: StrutturaService,
    private loginService: JwtLoginService,
    private datepipe: DatePipe,
    private route: ActivatedRoute,
    private confirmationService: ConfirmationService,
    private archivioDocService: ArchivioDocService,
    private navigationTabsService: NavigationTabsService,
    private appService: AppService,
  ) { }

  ngOnInit(): void {
    this.cols = cols.map(a => {return {...a}})
    this.docsListMode = this.route.snapshot.queryParamMap.get('mode') as DocsListMode || DocsListMode.MIEI_DOCUMENTI;
    if (!Object.values(DocsListMode).includes(this.docsListMode)) {
      this.docsListMode = DocsListMode.MIEI_DOCUMENTI;
    }
    //this.router.navigate([], { relativeTo: this.route, queryParams: { view: NavViews.DOCUMENTI, mode: this.docsListMode } }); 
    
    this.subscriptions.push(
      this.loginService.loggedUser$.pipe(first()).subscribe(
        (utenteUtilities: UtenteUtilities) => {
          this.utenteUtilitiesLogin = utenteUtilities;
          this.isSegretario = this.utenteUtilitiesLogin.getUtente().struttureDelSegretario && this.utenteUtilitiesLogin.getUtente().struttureDelSegretario.length > 0;
          this.calcDocListModeItem();
          this.selectedButtonItem = this.selectButtonItems.filter(element => element.queryParams.mode === this.docsListMode)[0];
          if (this.docsListMode) {
            this.calcolaAziendeFiltrabili();
          }
        
          if (!!!this.archivio) { 
            this.loadConfigurationAndSetItUp();
          } else { 
            this.setColumnsPerDetailArchivio();

            const bit = this.archivio.permessiEspliciti.find((permessoArchivio: PermessoArchivio) => permessoArchivio.fk_idPersona.id === this.utenteUtilitiesLogin.getUtente().idPersona.id)?.bit;
            this.loggedUserCanRestoreArchiviation = bit >= DecimalePredicato.VICARIO;
            this.loggedUserCanDeleteArchiviation = bit >= DecimalePredicato.ELIMINA;
          }
        }
      )
    );

    /* this.subscriptions.push(
      this.confirmatationService.requireConfirmation$.subscribe((confirmation: Confirmation) => {
        if (confirmation === null) {
          console.log(this.dropdownAzienda);
          console.log(this.filterAzienda);
        }
      })
    ); */

    /* Mi sottoscrivo alla rotta per leggere la modalita dell'elenco documenti
      e faccio partire il caricamento. Ogni volta che la modalità cambia
      rifaccio la loadData */
    /* this.route.queryParams.subscribe(params => {
      //this.docsListMode = params["mode"];
      if (this.utenteUtilitiesLogin) this.calcolaAziendeFiltrabili();
      this.resetPaginationAndLoadData();
    }); */
  }

  /**
   * Costruisco i tab per l'EDI
   */
  public calcDocListModeItem(): void {
    this.selectButtonItems = [];
    this.selectButtonItems.push(
      {
        title: "Tutti i documenti che posso vedere",
        label: "Visibili", 
        // icon: "pi pi-fw pi-list", 
        routerLink: ["./" + DOCS_LIST_ROUTE], 
        queryParams: {"mode": DocsListMode.DOCUMENTI_VISIBILI}
      },
      {
        title: "",
        label: "Miei  documenti", 
        // icon: "pi pi-fw pi-list", 
        routerLink: ["./" + DOCS_LIST_ROUTE], 
        queryParams: {"mode": DocsListMode.MIEI_DOCUMENTI}
      },
    )
    
    if (this.isSegretario) {
      this.selectButtonItems.push({
          label: "Firmario", 
          title: "Le proposte in scrivania dei responsabili",
          // icon: "pi pi-fw pi-user-edit", 
          routerLink: ["./" + DOCS_LIST_ROUTE], 
          queryParams: {"mode": DocsListMode.IFIRMARIO}
      });
      this.selectButtonItems.push({
        label: "Firmati", 
        title: "Registrati dai responsabili",
        // icon: "pi pi-fw pi-user-edit", 
        routerLink: ["./" + DOCS_LIST_ROUTE], 
        queryParams: {"mode": DocsListMode.IFIRMATO}
      });
    }

    if (this.utenteUtilitiesLogin.hasRole(CODICI_RUOLO.SD)
        || this.utenteUtilitiesLogin.hasRole(CODICI_RUOLO.OS)
        || this.utenteUtilitiesLogin.hasRole(CODICI_RUOLO.MOS)) {
      this.selectButtonItems.push({
        title: "",
        label: "Registrazioni", 
        // icon: "pi pi-fw pi-list", 
        routerLink: ["./" + DOCS_LIST_ROUTE], 
        queryParams: {"mode": DocsListMode.REGISTRAZIONI}
      }); 
    }
  }

  /**
   * Questa funzione gestisce il click del cambio tab
   */
  public onSelectButtonItemSelection(event: any): void {
    this.docsListMode = event.option.queryParams.mode;

    // TODO: Se viene velocizzato il tab ifirmato allora si può cancellare questo if e togliere il setimeout
    if (this.docsListMode === DocsListMode.IFIRMATO) {
      this.initialSortField = "dataCreazione";
      //this.initialSortField = "dataRegistrazione";
    }
    /* setTimeout(() => {
      this.router.navigate([], { relativeTo: this.route, queryParams: event.option.queryParams });
    }, 0); */
    if (this.utenteUtilitiesLogin) this.calcolaAziendeFiltrabili();
    this.resetPaginationAndLoadData();
  }

  @Input() get selectedColumns(): any[] {
    return this._selectedColumns;
  }

  set selectedColumns(colsSelected: ColonnaBds[]) {
    // restore original order
    // this._selectedColumns = this.cols.filter(col => val.includes(col));
    if (this._selectedColumns.length > colsSelected.length) {
      this._selectedColumns = this._selectedColumns.filter(sc => colsSelected.includes(sc));
    } else if (this._selectedColumns.length < colsSelected.length) {
      this._selectedColumns.push(colsSelected.find(cs => !this._selectedColumns.includes(cs)));
    }
    if (!this.archivio) {
      this.saveConfiguration();
    }
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
   * L'utente ha cambiato l'ordine delle colonne.
   * Salvo il nuovo ordine sul db.
   * @param event 
   */
  public onColReorder(event: any): void {
    this.saveConfiguration();
  }

  /**
   * Questa funzione si occupa di caricare la configurazione personale
   * dell'utente per il componente.
   * Sulla base di questo vengono poi settate le colonne visualizzate
   * ed il filtro "miei documenti"
   */
  private loadConfigurationAndSetItUp(): void {
    this.cols[this.cols.findIndex(c => c.field === "idArchivi")].header = "Fascicolazioni";
    this.mandatoryColumns = ["dataCreazione"];
    if (this.aziendeFiltrabili.length > 1) {
      this.mandatoryColumns.push("idAzienda");
    }
    // this.selectableColumns = cols.filter(e => !this.mandatoryColumns.includes(e.field));
    this.selectableColumns = cols.map(e => {
      if (this.mandatoryColumns.includes(e.field)) {
        e.selectionDisabled = true;
      }
      return e;
    });
    const impostazioni = this.utenteUtilitiesLogin.getImpostazioniApplicazione();
    if (impostazioni && impostazioni.impostazioniVisualizzazione && impostazioni.impostazioniVisualizzazione !== "") {
      const settings: Impostazioni = JSON.parse(impostazioni.impostazioniVisualizzazione) as Impostazioni;
      if (settings["scripta.docList"]) {
        this.mieiDocumenti = settings["scripta.docList"].mieiDocumenti;
        this._selectedColumns = [];
        //this._selectedColumns = this.cols.filter(c => settings["scripta.docList"].selectedColumn.some(e => e === c.field) || this.mandatoryColumns.includes(c.field));
        settings["scripta.docList"].selectedColumn.forEach(c => {
          this._selectedColumns.push(this.cols.find(e => e.field === c));
        });
        // Aggiungo le colonne obbligatorie nel caso mancassero
        this.mandatoryColumns.forEach(mc => {
          if (!this._selectedColumns.some(sc => sc.field === mc)) {
            this._selectedColumns.push(this.cols.find(c => c.field === mc));
          }
        });
      }
    }
    // Configurazione non presente o errata. Uso quella di default.
    if (!this._selectedColumns || this._selectedColumns.length === 0) {
      this._selectedColumns = this.cols.filter(c => c.default);
    }
  }

  public setColumnsPerDetailArchivio(): void {
    const colonneDaVisualizzare = ["registrazione", "dataRegistrazione", "oggetto", "tipologia", "idArchivi"];
    this.cols[this.cols.findIndex(c => c.field === "idArchivi")].header = "Altre fascicolazioni"; // Modifica custom all'header delle fascicolazioni.
    // this._selectedColumns = this.cols.filter(c => colonneDaVisualizzare.includes(c.field));
    this._selectedColumns = [];
    colonneDaVisualizzare.forEach(c => {
      this._selectedColumns.push(this.cols.find(e => e.field === c));
    })
    console.log(this._selectedColumns);

    this.selectableColumns = cols.map(e => {
      if (colonneDaVisualizzare.includes(e.field)) {
        e.selectionDisabled = true;
      }
      return e;
    });
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
  public openDoc(doc: DocDetailView) {
    const filtersAndSorts = new FiltersAndSorts();
    filtersAndSorts.addFilter(new FilterDefinition("idPersona.id", FILTER_TYPES.not_string.equals, this.utenteUtilitiesLogin.getUtente().idPersona.id));
    filtersAndSorts.addFilter(new FilterDefinition("idDocDetail.id", FILTER_TYPES.not_string.equals, doc.id));
    this.personaVedenteSerice.getData("PersonaVedenteWithPlainFields", filtersAndSorts, null)
      .subscribe(res => {
        if (res && res.results) {
          if (res.results.length > 0) {
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
              key: "docsListToast",
              detail: `Apertura del documento non consentita`
            });
          }
        }
      });
  }

  /**
   * Questo metodo si occupa di riempire l'array delle aziende filtrabili
   * Nel caso del tab Registrazioni il filtro si fa stringente se l'utente
   * non è SD o CI ma è solo OS o MOS.
   * 
   * NB: Nell'oggetto ValueAndLabelObj la proprietà value è un array
   * Questo permette se serve di inserire la voce per tutte le aziende.
   */
  private calcolaAziendeFiltrabili() {
    this.aziendeFiltrabili = [];
    if (this.docsListMode !== DocsListMode.REGISTRAZIONI
      || this.utenteUtilitiesLogin.hasRole(CODICI_RUOLO.SD)) {
      this.aziendeFiltrabili = this.utenteUtilitiesLogin.getUtente().aziendeAttive
        .map(a => {
          return {value: [a.id], label: a.nome} as ValueAndLabelObj;
        });
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
      this.aziendeFiltrabili = this.utenteUtilitiesLogin.getUtente().aziendeAttive
        .filter(a => codiceAziendeOSMOS.indexOf(a.codice) != -1)
        .map(a => {
          return {value: [a.id], label: a.nome} as ValueAndLabelObj;
        });
    }
    if (this.aziendeFiltrabili.length > 1) {
      this.aziendeFiltrabili.push({
        value: this.aziendeFiltrabili.map(e => e.value[0]),
        label: "Tutte"
      } as ValueAndLabelObj);
    }
    // Svuoto l'eventuale filtro nel caso fosse stato usato e reimposto il default
    /* if (this.dropdownAzienda && this.columnFilterAzienda) {
      this.dropdownAzienda.value = [];
      this.columnFilterAzienda.clearFilter();
      this.dropdownAzienda.value = this.aziendeFiltrabili.find(a => a.value[0] === this.utenteUtilitiesLogin.getUtente().idPersona.fk_idAziendaDefault.id);
      this.columnFilterAzienda.applyFilter();
    } */
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

    if (this.filtriPuliti) {
      this.filtriPuliti = false;
      if(!!!this.archivio){
        this.resetCalendarToInitialValues();
        this.dataTable.filters["dataCreazione"] = { value: this.calendarcreazione.value, matchMode: "is" };
      }

      if (this.dropdownAzienda) {
        const value = this.aziendeFiltrabili.find(a => a.value[0] === this.utenteUtilitiesLogin.getUtente().idPersona.fk_idAziendaDefault.id).value;
        this.dropdownAzienda.writeValue(value);
        this.lastAziendaFilterValue = value;
        this.dataTable.filters["idAzienda.id"] = { value: this.dropdownAzienda.value, matchMode: "in" };
      }
      // if (this.multiselectStati) {
      //   const value = this.aziendeFiltrabili.find(a => a.value[0] === this.utenteUtilitiesLogin.getUtente().idPersona.fk_idAziendaDefault.id).value;
      //   this.dropdownAzienda.writeValue(value);
      //   this.lastAziendaFilterValue = value;
      //   this.dataTable.filters["idAzienda.id"] = { value: this.dropdownAzienda.value, matchMode: "in" };
      // }
    }

    this.loadData();
  }

  /**
   * Metodo che toglie il sort dalle colonne della tabella.
   * In particolare è usata dagli input dei campi che quando usati ordinano per ranking
   */
  public removeSort(): void {
    this.dataTable.sortField = null;
    this.dataTable.sortOrder = null;
    this.dataTable.tableService.onSort(null); 
  }

  /**
   * Metodo che reimposta il sort di default. Cioè al campo definito in initialSortField
   */
  public resetSort(): void {
    this.dataTable.sortField = this.initialSortField;
    this.dataTable.sortOrder = this.dataTable.defaultSortOrder;
    this.dataTable.sortSingle();
  }

  /**
   * Metodo chiamato quando l'utente cambia tab
   * Risetta la configurazione pagine e chiama la laoddata
   * Mantiene i filtri
   */
  public resetPaginationAndLoadData(): void {
    this.resetDocsArrayLenght = true;
    if (!!!this.storedLazyLoadEvent) {
      this.storedLazyLoadEvent = {};
    }
    this.storedLazyLoadEvent.first = 0;
    this.storedLazyLoadEvent.rows = this.rowsNumber * 2;

    if (this.dropdownAzienda) {
      this.dataTable.filters["idAzienda.id"] = { value: this.dropdownAzienda.value, matchMode: "in" };
    }

    this.loadData();
  }

  /**
   * Questa funzione si occupa di ristabilire il filtro iniziale sulla data creazione.
   * Questo filtro serve per usare la partizione specifica dell'anno corrente
   */
  private resetCalendarToInitialValues() {
    const oggi = new Date();

    switch (oggi.getMonth()) {
      case 0:
        // Gennaio
        this.calendarcreazione.writeValue([
          new Date(new Date().getFullYear() - 1, 10, 1),
          new Date(new Date().getFullYear(), 11, 31)
        ]);
        break;
      case 1:
        // Febbrario
        this.calendarcreazione.writeValue([
          new Date(new Date().getFullYear() - 1, 11, 1),
          new Date(new Date().getFullYear(), 11, 31)
        ]);
        break
      default:
        this.calendarcreazione.writeValue([
          new Date(new Date().getFullYear(), 0, 1),
          new Date(new Date().getFullYear(), 11, 31)
        ]);
    }
    this.lastDataCreazioneFilterValue = this.calendarcreazione.value;
  }

  /**
   * Questo metodo costruisce filtri e sorting non provenienti dalla p-table
   * In particolare si occupa di impostare i giusti filtri a seconda
   * del tab selezionato (docsListMode)
   * @returns
   */
  private buildCustomFilterAndSort(): FiltersAndSorts {
    const filterAndSort = new FiltersAndSorts();
    if (!!this.archivio) {
      this.docsListMode = null;
      this.initialSortField = "dataRegistrazione";
      this.serviceForGetData = this.docDetailService;
      this.projectionFotGetData = "CustomDocDetailForDocList";
      // filterAndSort.addFilter(new FilterDefinition("idArchivi", FILTER_TYPES.not_string.equals, this.archivio.id));
      filterAndSort.addFilter(new FilterDefinition("idAzienda.id", FILTER_TYPES.not_string.equals, this.archivio.idAzienda.id));
      filterAndSort.addAdditionalData(new AdditionalDataDefinition("OperationRequested", "FilterForArchiviContent"));
      filterAndSort.addAdditionalData(new AdditionalDataDefinition("idArchivio", this.archivio.id.toString()));
    }
    switch (this.docsListMode) {
      case DocsListMode.DOCUMENTI_VISIBILI:
        filterAndSort.addFilter(new FilterDefinition("idPersona.id", FILTER_TYPES.not_string.equals, this.utenteUtilitiesLogin.getUtente().idPersona.id));
        this.initialSortField = "dataCreazione";
        this.serviceForGetData = this.docDetailViewService;
        this.projectionFotGetData = "CustomDocDetailViewForDocList";
        break;
      case DocsListMode.MIEI_DOCUMENTI:
        /* const filtroJson: FilterJsonDefinition<PersonaVedente> = new FilterJsonDefinition(true);
        filtroJson.add("idPersona", this.utenteUtilitiesLogin.getUtente().idPersona.id);
        if (this.mieiDocumenti) {filtroJson.add("mioDocumento", true);} 
        filterAndSort.addFilter(new FilterDefinition("personeVedenti", FILTER_TYPES.not_string.equals, filtroJson.buildJsonString()));*/
        filterAndSort.addFilter(new FilterDefinition("idPersona.id", FILTER_TYPES.not_string.equals, this.utenteUtilitiesLogin.getUtente().idPersona.id));
        filterAndSort.addFilter(new FilterDefinition("mioDocumento", FILTER_TYPES.not_string.equals, true));
        this.initialSortField = "dataCreazione";
        this.serviceForGetData = this.docDetailViewService;
        this.projectionFotGetData = "CustomDocDetailViewForDocList";
        break;
      case DocsListMode.IFIRMARIO:
        filterAndSort.addAdditionalData(new AdditionalDataDefinition("OperationRequested", "VisualizzaTabIFirmario"));
        this.initialSortField = "dataCreazione";
        this.serviceForGetData = this.docDetailService;
        this.projectionFotGetData = "CustomDocDetailForDocList";
        break;
      case DocsListMode.IFIRMATO:
        filterAndSort.addAdditionalData(new AdditionalDataDefinition("OperationRequested", "VisualizzaTabIFirmato"));
        this.initialSortField = "dataRegistrazione";
        this.serviceForGetData = this.docDetailService;
        this.projectionFotGetData = "CustomDocDetailForDocList";
        break;
      case DocsListMode.REGISTRAZIONI:
        filterAndSort.addAdditionalData(new AdditionalDataDefinition("OperationRequested", "VisualizzaTabRegistrazioni"));
        this.initialSortField = "dataRegistrazione";
        this.serviceForGetData = this.docDetailService;
        this.projectionFotGetData = "CustomDocDetailForDocList";
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
    const filtersAndSorts: FiltersAndSorts = this.buildCustomFilterAndSort();
    this.loadDocsListSubscription = this.serviceForGetData.getData(
      this.projectionFotGetData,
      filtersAndSorts,
      buildLazyEventFiltersAndSorts(this.storedLazyLoadEvent, this.cols, this.datepipe),
      this.pageConf).subscribe({
        next: (data: any) => {
          console.log(data);
          this.totalRecords = data.page.totalElements;
          this.loading = false;

          if (this.resetDocsArrayLenght) {
            /* Ho bisogno di far capire alla tabella quanto l'array docs è virtualmente grande
              in questo modo la scrollbar sarà sufficientemente lunga per scrollare fino all'ultimo elemento
              ps:a quanto pare la proprietà totalRecords non è sufficiente. */
            this.resetDocsArrayLenght = false;
            this.dataTable.resetScrollTop();
            this.docs = Array.from({ length: this.totalRecords });
          }

          if (this.pageConf.conf.offset === 0 && data.page.totalElements < this.pageConf.conf.limit) {
            /* Questo meccanismo serve per cancellare i risultati di troppo della tranche precedente.
            Se entro qui probabilmente ho fatto una ricerca */
            Array.prototype.splice.apply(this.docs, [0, this.docs.length, ...this.setCustomProperties(data.results)]);
          } else {
            Array.prototype.splice.apply(this.docs, [this.storedLazyLoadEvent.first, this.storedLazyLoadEvent.rows, ...this.setCustomProperties(data.results)]);
          }
          this.docs = [...this.docs]; // trigger change detection
        },
        error: (err) => {
          if(err.error.message == "Persona senza permesso su Archivio"){
            this.loading = false;  
          }
          
          this.messageService.add({
            severity: "warn",
            key : "docsListToast",
            summary: "Attenzione",
            detail: `Si è verificato un errore nel caricamento, contattare Babelcare`
          });
        }
      });
  }

  /**
   * Parso DocList[] facendolo diventare ExtendedDocList[] con le
   * proprietà utili alla visualizzazione popolate
   * @param docsList
   * @returns
   */
  private setCustomProperties(docsList: DocDetailView[]): ExtendedDocDetailView[] {
    const extendedDocsList: ExtendedDocDetailView[] = docsList as ExtendedDocDetailView[];
    extendedDocsList.forEach((doc: ExtendedDocDetailView) => {
      Object.setPrototypeOf(doc, ExtendedDocDetailView.prototype);
      if (this.archivio) {
        doc.archiviation = doc.archiviDocList?.find(archivioDoc => archivioDoc.idArchivio.id === this.archivio.id);
      }
      doc.oggettoVisualizzazione = doc.oggetto;
      doc.tipologiaVisualizzazioneAndCodiceRegistro = doc;
      doc.registrazioneVisualizzazione = null; // Qui sto passando null. Ma è un trucco, in realtà sto settando i valori.
      doc.propostaVisualizzazione = null;
      doc.statoVisualizzazione = doc.stato;
      doc.statoUfficioAttiVisualizzazione = doc.statoUfficioAtti;
      doc.idPersonaResponsabileProcedimentoVisualizzazione = null;
      doc.idPersonaRedattriceVisualizzazione = null;
      doc.archiviDocListFiltered = doc.archiviDocList;
      doc.fascicolazioniVisualizzazione = null; // vale per il campo archiviDocList
      doc.eliminabile = this.isEliminabile(doc);
      doc.destinatariVisualizzazione = null;
      doc.firmatariVisualizzazione = null;
      doc.sullaScrivaniaDiVisualizzazione = null;
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
  public filterPersone(event: any) {
    const filtersAndSorts = new FiltersAndSorts();
    filtersAndSorts.addFilter(new FilterDefinition("descrizione", FILTER_TYPES.string.containsIgnoreCase, event.query));
    this.aziendeFiltrabili.forEach(a => {
      if ((typeof a.value) === "number")
        filtersAndSorts.addFilter(new FilterDefinition("utenteList.idAzienda.id", FILTER_TYPES.not_string.equals, a.value));
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
   * Funzione chiamata tipicamente dall'autocomplete per riempire la
   * variabile di opzioni: filteredArchivi con gli archivi che
   * corrispondono al filtro utente. L'utente deve avere un permesso minimo di 
   * VISUALIZZA sull'archivio
   * @param event
   */
   public filterArchivi(event: any) {
    const filtersAndSorts = new FiltersAndSorts();
    filtersAndSorts.addFilter(new FilterDefinition("idPersona.id", FILTER_TYPES.not_string.equals, this.utenteUtilitiesLogin.getUtente().idPersona.id));
    this.aziendeFiltrabili.forEach(a => {
      if ((typeof a.value) === "number")
        filtersAndSorts.addFilter(new FilterDefinition("idAzienda.id", FILTER_TYPES.not_string.equals, a.value));
    });
    filtersAndSorts.addFilter(new FilterDefinition("tscol", FILTER_TYPES.not_string.equals, event.query));
    filtersAndSorts.addSort(new SortDefinition("ranking", SORT_MODES.desc));
    filtersAndSorts.addAdditionalData(new AdditionalDataDefinition("OperationRequested", "FilterBitPermessoMinimo"));
    filtersAndSorts.addAdditionalData(new AdditionalDataDefinition("BitPermessoMinimo", DecimalePredicato.VISUALIZZA.toString()));
    this.archivioDetailViewService.getData(null, filtersAndSorts, null)
      .subscribe(res => {
        if (res && res.results) {
          res.results.forEach((archivio: any) => {
            archivio["descrizioneVisualizzazione"] = "[" + archivio.numerazioneGerarchica + "] " + archivio.oggetto;
          });
          this.filteredArchivi = res.results;
        } else {
          this.filteredArchivi = [];
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
      if ((typeof a.value) === "number")
        filtersAndSorts.addFilter(new FilterDefinition("idAzienda.id", FILTER_TYPES.not_string.equals, a.value));
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
    //this.inputGobalFilter.nativeElement.value = "";
    if (this.autocompleteIdPersonaRedattrice) this.autocompleteIdPersonaRedattrice.writeValue(null);
    if (this.autocompleteidPersonaResponsabileProcedimento) this.autocompleteidPersonaResponsabileProcedimento.writeValue(null);
    if (this.autocompletearchiviDocList) this.autocompletearchiviDocList.writeValue(null);
    if (this.autocompleteIdStrutturaRegistrazione) this.autocompleteIdStrutturaRegistrazione.writeValue(null);
    if (this.autocompleteFirmatari) this.autocompleteFirmatari.writeValue(null);
    if (this.autocompleteSullaScrivaniaDi) this.autocompleteSullaScrivaniaDi.writeValue(null); 
    this.myDatatableReset();
  }

  /**
   * this.dataTable.reset(); fa un po' troppa roba e non riesco a gestirlo.
   * Quindi il reset me lo faccio io a mano.
   */
  public myDatatableReset() {
    this.filtriPuliti = true;
    for (const key in this.dataTable.filters) {
      (this.dataTable.filters as any)[key]["value"] = null;
    }
    this.dataTable.filteredValue = null;
    this.dataTable.first = 0;
    this.resetSort();
  }

  /**
   * Metodo che intercetta la ricerca globale. E' solo un passa carte.
   * Di fatto poi scatta l'onLazyLoad
   * @param event
   * @param matchMode
   */
  public applyFilterGlobal(event: Event, matchMode: string): void {
    const stringa: string = (event.target as HTMLInputElement).value;
    if (!!!stringa || stringa === "") {
      this.resetSort();
    }
    this.dataTable.filterGlobal(stringa, matchMode);
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
      mode: "PAGE_NO_COUNT"
    };
    const filtersAndSorts: FiltersAndSorts = this.buildCustomFilterAndSort();
    this.serviceForGetData.getData(
      this.projectionFotGetData,
      filtersAndSorts,
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
   * Questo serve per vedere se è una proposta ed è sulla scrivania dell'utente 
   * in modo da potergliela far eliminare 
   * (questo controllo viene fatto anche lato inDE)
   */
  public isEliminabile(doc: ExtendedDocDetailView): boolean {
    if (doc.numeroRegistrazione || !doc.sullaScrivaniaDi) {
      return false;
    }
    return doc.sullaScrivaniaDi.some(p => p.idPersona === this.utenteUtilitiesLogin.getUtente().idPersona.id);
  }

  /**
   * Chiede la conferma dell'eliminazione della proposta
   */
  public confermaEliminaProposta(doc: ExtendedDocDetailView, event: Event): void {
    this.confirmationService.confirm({
      key: "confirm-popup",
      target: event.target,
      message: "Stai eliminando questa proposta e i suoi eventuali allegati, vuoi proseguire?",
      accept: () => {
        this.loading = true;
        this.docDetailService.eliminaProposta(doc).subscribe(
          res => {
            this.cancellaDaElenco(doc);
            console.log(res);
          },
          err => {
            this.messageService.add({
              severity: "warn",
              key : "docsListToast",
              summary: "Attenzione",
              detail: `Si è verificato un errore nell'eliminazione della proposta, contattare Babelcare`
            });
          }
        );
      }
    });
  }

  /**
   * La chiamo per poter rimuovere dall'elenco documenti la proposta che ho 
   * cancellato, senza necessariamente dover ricaricare la pagina
   */
  public cancellaDaElenco(docToDelete: ExtendedDocDetailView): void {
    this.resetPaginationAndLoadData();
    this.messageService.add({
      severity: "success",
      key: "docsListToast",
      detail: `Proposta eliminata con successo`
    });
  }

  /**
   * Questa funzione gestisce l'utilizzo dei pulsanti custom dei calendari
   * @param calendar 
   * @param command 
   * @param event 
   */
  public handleCalendarButtonEvent(calendar: Calendar, command: string, event: Event, filterCallback: (value: Date[]) => {}) {
    if (command === "doFilter" || command === "onClickOutside") { // pulsante OK
      calendar.hideOverlay();
    } else if (command === "setToday") { // pulsante OGGI
      calendar.writeValue([new Date(), null]);
      calendar.hideOverlay();
    } else if (command === "clear") { // pulsante SVUOTA
      calendar.onClearButtonClick(event);
    }
    if (calendar.inputId === "calendarcreazione") {
      this.lastDataCreazioneFilterValue = calendar.value;
    }
    filterCallback(calendar.value);
  }

  /**
   * Funzione apposita per il calendario della data creazione.
   * Vogliamo chiedere all'utente se vuole continuare nel caso abbia scelto un
   * intervallo di date troppo grande (> 2 anni)
   * @param calendar 
   * @param command 
   * @param event 
   */
   needToAsk = false;
   public askConfirmAndHandleCalendarCreazioneEvent(calendar: Calendar, command: string, event: Event, filterCallback: (value: Date[]) => {}) {
     //add this check becaus when we click on confirmation button it takas it as click outside
     if (this.needToAsk) {
       this.needToAsk = false;
       return;
     }
     if (command === "onClickOutside") {
       calendar.writeValue(this.lastDataCreazioneFilterValue);
       return;
     }
     console.log(calendar);
     if (command === "clear" || !!!calendar.value || calendar.value[0] === null) {
       // Sto cercando su tutti gli anni
       this.needToAsk = true;
     } else {
        if (calendar.value[1] !== null && ((calendar.value[1].getYear() - calendar.value[0].getYear()) > 1)) {
         // Se la differenza degli anni è maggiore di 1 allora sto cercando su almeno 3 anni.
         this.needToAsk = true;
       }
     }
 
     if (this.needToAsk) {
       setTimeout(() => {
         this.confirmationService.confirm({
           key: "confirm-popup",
           target: event.target,
           message: "La ricerca potrebbe risultare lenta. Vuoi procedere?",
           icon: 'pi pi-exclamation-triangle',
           accept: () => {
             // L'utente conferma di voler cercare su tutte le sue aziende. faccio quindi partire il filtro
             this.handleCalendarButtonEvent(calendar, command, event, filterCallback);
           },
           reject: () => {
             // L'utente ha cambaito idea. Non faccio nulla
             // repopulate with old value
             calendar.writeValue(this.lastDataCreazioneFilterValue);
           }
         });
       }, 0);
     } else {
       this.handleCalendarButtonEvent(calendar, command, event, filterCallback);
     }
   }
  /**
   * Gestione custom del filtro per azienda scelto dall'utente. In particolare devo gestire il caso
   * in cui l'utente scelga l'opzione "Tutte le aziende" per avvisarlo di possibili rallentamenti.
   * @param filterCallback 
   * @param value 
   * @param filteraziendacontainer 
   */
  public filterAzienda(filterCallback: (value: number[]) => {}, value: number[], filteraziendacontainer: any) {
    if (value.length === 1) {
      // L'utente ha scelto un unica azienda. Faccio quindi partire il filtro.
      this.lastAziendaFilterValue = value;
      filterCallback(value);
    } else {
      setTimeout(() => {
        // Il confirm-popup non mi da l'opportunità di gestire il click "fuori" dal popup.
        // Sarebbe come se l'utente facesse reject, ma il reject non parte.
        // Allora innanzitutto rimetto subito il valore vecchio, e solo nel caso di accept
        // andrò a inserire il valore nuovo.
        this.dropdownAzienda.writeValue(this.lastAziendaFilterValue);
        this.confirmationService.confirm({
          key: "confirm-popup",
          target: filteraziendacontainer,
          message: "La ricerca potrebbe risultare lenta. Vuoi procedere?",
          icon: 'pi pi-exclamation-triangle',
          accept: () => {
            // L'utente conferma di voler cercare su tutte le sue aziende. faccio quindi partire il filtro
            this.dropdownAzienda.writeValue(value);
            this.lastAziendaFilterValue = value;
            filterCallback(value);
          },
          reject: () => {
            // L'utente ha cambaito idea. Non faccio nulla
          }
        });
      }, 0);
    }
  }

 /**
  * Il filtro dello stato è un array di array. Questo perche
  * vogliamo raggruppare più filtri sotto lo stesso filtro "padre"
  * quindi una volta selezionato devo normalizzare l'array da dare 
  * in pasto al filterCallback
  */
  public filterStato(filterCallback: (value: any) => {}, value: any) {
    let array: string[] = [];
    value.forEach((labelStato: string) => { 
      StatoDocDetailPerFiltro.forEach((mappa: any) => {
        if (mappa.nome === labelStato) {
          array = array.concat(mappa.value);
        }
      });
    });
    filterCallback(array);
 }

/**
  * Serve a calcolare se l'utente è accessibile 
  * per capire cosa mostrargli nell'html
  */
 public isAccessibile(): boolean {
  return this.utenteUtilitiesLogin.getUtente().idPersona.accessibilita;
 }

 /**
  * Filtering per gli autocomplete della versione accessibile
  */
 public filterTipologia(event:any) {
  let filtered: any[] = [];
  let query = event.query;
  for (let i = 0; i < this.tipologiaVisualizzazioneObj.length; i++) {
    let tipologia = this.tipologiaVisualizzazioneObj[i];
    if (tipologia.nome.toLowerCase().indexOf(query.toLowerCase()) == 0) {
      filtered.push(tipologia);
    }
  }
  this.filteredTipologia = filtered;
}

  public filterStatoAccessibile(event:any) {
    let filtered: any[] = [];
    let query = event.query;
    for (let i = 0; i < this.statoVisualizzazioneObj.length; i++) {
      let stato = this.statoVisualizzazioneObj[i];
      if (stato.nome.toLowerCase().indexOf(query.toLowerCase()) == 0) {
        filtered.push(stato);
      }
    }
    this.filteredStati = filtered;
  }

  public filterStatoUfficioAtti(event:any) {
    let filtered: any[] = [];
    let query = event.query;
    for (let i = 0; i < this.statoUfficioAttiVisualizzazioneObj.length; i++) {
      let stato = this.statoUfficioAttiVisualizzazioneObj[i];
      if (stato.nome.toLowerCase().indexOf(query.toLowerCase()) == 0) {
        filtered.push(stato);
      }
    }
    this.filteredStatoUfficioAtti = filtered;
  }

  public filterAziendaAccessibile(event:any) {
    let filtered: any[] = [];
    let query = event.query;
    for (let i = 0; i < this.aziendeFiltrabili.length; i++) {
      let azienda = this.aziendeFiltrabili[i];
      if (azienda.label.toLowerCase().indexOf(query.toLowerCase()) == 0) {
        filtered.push(azienda);
      }
    }
    this.aziendeFiltrabiliFiltered = filtered;
  }

  /**
   * Preso in ingresso un doc, prendo l'archivioDoc e lo aggiorno 
   * togliendo idPersonaEliminazione e dataEliminazione
   * NB: Dentro archiviation c'è l'archivioDoc su cui sto lavorando
   * @param doc 
   */
  public restoreArchiviation(doc: ExtendedDocDetailView): void {
    const archivioDocToUpdate: ArchivioDoc = new ArchivioDoc();
    archivioDocToUpdate.dataEliminazione = null;
    archivioDocToUpdate.idPersonaEliminazione = null;
    archivioDocToUpdate.version = doc.archiviation.version;
    archivioDocToUpdate.id = doc.archiviation.id;
    this.subscriptions.push(this.archivioDocService.patchHttpCall(archivioDocToUpdate, archivioDocToUpdate.id)
      .subscribe(
        res => {
          doc.archiviation.dataEliminazione = res.dataEliminazione;
          doc.archiviation.idPersonaEliminazione = res.idPersonaEliminazione;
          doc.archiviation.version = res.version;
          this.messageService.add({
            severity: "success",
            key: "docsListToast",
            detail: `Fascicolazione ripristinata con successo`
          });
        }
      )
    );
  }

  /**
   * Preso in ingresso un doc, ne faccio l'eliminazione logica.
   * - Se ho un PDD però devo controllare che il doc abbia almeno un altra fascicolazione non eliminata logicamente
   * NB: Dentro archiviation c'è l'archivioDoc su cui sto lavorando
   * @param doc 
   */
  public deleteArchiviation(doc: ExtendedDocDetailView, rowIndex: number, iconaEliminazioneArchiviazione: any): void {
    if (["PROTOCOLLO_IN_USCITA", "PROTOCOLLO_IN_ENTRATA", "DETERMINA", "DELIBERA"].includes(doc.tipologia)
      && !doc.archiviDocList.some(archivioDoc => !archivioDoc.dataEliminazione && archivioDoc.id !== doc.archiviation.id)) {
      // Ho un PDD ma non ha altre archiviazioni non eliminate logicamente oltre quella che si sta provando a cancellare. Non posso far procedere
      this.messageService.add({
        severity: "warn",
        key: "docsListToast",
        detail: `Il documento deve essere presente in almeno un altro fascicolo prima di poter eliminare questa fasciolazione`
      });
      return;
    } else {
      // Procediamo con l'eliminazione logica. Prima chiediamo conferma:
      this.confirmationService.confirm({
        key: "confirm-popup",
        target: iconaEliminazioneArchiviazione,
        message: `Stai per eliminare logicamente la fascicolazione di ${doc.registrazioneVisualizzazione ? doc.registrazioneVisualizzazione : doc.oggettoVisualizzazione}. Vuoi procedere?`,
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
          // L'utente conferma di voler cercare su tutte le sue aziende. faccio quindi partire il filtro
          const archivioDocToUpdate: ArchivioDoc = new ArchivioDoc();
          archivioDocToUpdate.dataEliminazione = new Date();
          archivioDocToUpdate.idPersonaEliminazione = { id: this.utenteUtilitiesLogin.getUtente().idPersona.id } as Persona;
          archivioDocToUpdate.version = doc.archiviation.version;
          archivioDocToUpdate.id = doc.archiviation.id;
          this.subscriptions.push(this.archivioDocService.patchHttpCall(archivioDocToUpdate, archivioDocToUpdate.id)
            .subscribe(
              res => {
                doc.archiviation.dataEliminazione = res.dataEliminazione;
                doc.archiviation.idPersonaEliminazione = res.idPersonaEliminazione;
                doc.archiviation.version = res.version;
                this.messageService.add({
                  severity: "success",
                  key: "docsListToast",
                  detail: `Fascicolazione eliminata logicamente con successo`
                });
              }
            )
          );
        },
        reject: () => { /* L'utente ha cambaito idea. Non faccio nulla */ }
      });
    }
  }
  
  /**
   * Apre il tab per l'archivio corrisondente alla fasciolazione
   * @param f 
   */
  public openArchive(archivioDoc: ArchivioDoc, doc: ExtendedDocDetailView) {
    this.navigationTabsService.addTabArchivio(archivioDoc.idArchivio);
		this.appService.appNameSelection("Fascicolo "+ archivioDoc.idArchivio.numerazioneGerarchica + " [" + archivioDoc.idArchivio.idAzienda.aoo + "]");
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

/* export interface DocListModeItem {
  label: string;
  title: string;
  // icon: string;
  routerLink: string[];
  queryParams: any;
} */

export interface ValueAndLabelObj {
  value: number[];
  label: string;
}