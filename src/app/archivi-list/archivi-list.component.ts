import { Component, ElementRef, Input, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { ArchivioDetailService, ArchivioDetailView, Azienda, Persona, PersonaService, Struttura, StrutturaService, Vicario } from '@bds/ng-internauta-model';
import { AppService } from '../app.service';
import { NtJwtLoginService, UtenteUtilities } from "@bds/nt-jwt-login";
import { Subscription } from 'rxjs';
import { ARCHIVI_LIST_ROUTE } from 'src/environments/app-constants';
import { ArchiviListMode, cols, colsCSV, TipoArchivioTraduzioneVisualizzazione, StatoArchivioTraduzioneVisualizzazione } from './archivi-list-constants';
import { ActivatedRoute, Router } from '@angular/router';
import { ValueAndLabelObj } from '../docs-list/docs-list.component';
import { AdditionalDataDefinition, FilterDefinition, FilterJsonDefinition, FiltersAndSorts, FILTER_TYPES, NextSDREntityProvider, PagingConf } from '@nfa/next-sdr';
import { ColumnFilter, Table } from 'primeng/table';
import { Impostazioni } from '../utilities/utils';
import { ConfirmationService, LazyLoadEvent, MessageService } from 'primeng/api';
import { ArchiviListService } from './archivi-list.service';
import { Calendar } from 'primeng/calendar';
import { Dropdown } from 'primeng/dropdown';
import { buildLazyEventFiltersAndSorts, ColonnaBds, CsvExtractor } from '@bds/primeng-plugin';
import { ExtendedArchiviView } from './extendend-archivi-view';
import { NavViews } from '../navigation-tabs/navigation-tabs-contants';
import { TabComponent } from '../navigation-tabs/tab.component';
import { NavigationTabsService } from '../navigation-tabs/navigation-tabs.service';
import { AutoComplete } from 'primeng/autocomplete';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-archivi-list',
  templateUrl: './archivi-list.component.html',
  styleUrls: ['./archivi-list.component.scss']
})
export class ArchiviListComponent implements OnInit, TabComponent, OnDestroy {
  @Input() data: any;
  @ViewChildren(ColumnFilter) filterColumns: QueryList<ColumnFilter>;

  @ViewChild("columnFilterAzienda") public columnFilterAzienda: ColumnFilter;
  @ViewChild("calendarcreazione") public calendarcreazione: Calendar;
  @ViewChild("dropdownAzienda") public dropdownAzienda: Dropdown;
  @ViewChild("autocompleteIdPersonaResponsabile") public autocompleteIdPersonaResponsabile: AutoComplete;
  @ViewChild("autocompleteIdPersonaCreazione") public autocompleteIdPersonaCreazione: AutoComplete;
  @ViewChild("autocompleteIdStruttura") public autocompleteIdStruttura: AutoComplete;
  @ViewChild("autocompleteVicari") public autocompleteVicari: AutoComplete;
  @ViewChild("dt") public dataTable: Table;
  @ViewChild("columnFilterDataCreazione") public columnFilterDataCreazione: ColumnFilter;
  @ViewChild("inputGobalFilter") public inputGobalFilter: ElementRef;

  private projection = "ArchivioDetailWithIdAziendaAndIdPersonaCreazioneAndIdPersonaResponsabileAndIdStrutturaAndIdVicari";

  public j = JSON;
  public archivi: ExtendedArchiviView[] = [];
  public archiviListMode: ArchiviListMode;
  private utenteUtilitiesLogin: UtenteUtilities;
  private subscriptions: Subscription[] = [];
  private archiviListModeItem: ArchiviListModeItem[];
  private displayArchiviListModeItem: boolean = true;
  private hasChildrens: boolean = false;
  public aziendeFiltrabili: ValueAndLabelObj[] = [];
  public exportCsvInProgress: boolean = false;
  public selectableColumns: ColonnaBds[] = [];
  private mandatoryColumns: string[] = [];
  public rowsNumber: number = 20;
  public totalRecords: number;
  public loading: boolean = false;
  public initialSortField: string = "dataCreazione";
  public filtriPuliti: boolean = true;
  private storedLazyLoadEvent: LazyLoadEvent;
  private loadArchiviListSubscription: Subscription;
  private serviceToGetData: NextSDREntityProvider = null;
  private projectionToGetData: string = null;
  private lastDataCreazioneFilterValue: Date[];
  private lastAziendaFilterValue: number[];
  public tipoVisualizzazioneObj = TipoArchivioTraduzioneVisualizzazione;
  public statoVisualizzazioneObj = StatoArchivioTraduzioneVisualizzazione;
  public aziendeFiltrabiliFiltered: any[];
  public filteredTipo: any[];
  public filteredStati: any[];
  public filteredPersone: Persona[] = [];
  public filteredStrutture: Struttura[] = [];
  private resetArchiviArrayLenght: boolean = true;
  public dataMinimaCreazione: Date = new Date("2000-01-01");
  public dataMassimaCreazione: Date = new Date("2030-12-31");
  private pageConf: PagingConf = { mode: "LIMIT_OFFSET_NO_COUNT", conf: { limit: 0, offset: 0 } };
  public selectedArchiviListMode: ArchiviListModeItem = {
    title: "Tutti gli archivi che posso vedere",
    label: "Visibili",
    routerLink: ["./" + ARCHIVI_LIST_ROUTE],
    queryParams: { "mode": ArchiviListMode.VISIBILI }
  };
  public cols: ColonnaBds[] = [];
  public _selectedColumns: ColonnaBds[];
  private childrenId: number[] = [];


  @Input() set archiviListModeItem1(value: ArchiviListModeItem[]) {
    this.archiviListModeItem = [];
    this.archiviListModeItem = value;
    this.displayArchiviListModeItem = false;
  }

  @Input() set archivioPadre(value: number[]) {
    this.childrenId = value;
    this.hasChildrens = true;
    this.loadData();
  }

  constructor(
    private appService: AppService,
    private loginService: NtJwtLoginService,
    private route: ActivatedRoute,
    private router: Router,
    private messageService: MessageService,
    private archiviListService: ArchiviListService,
    private confirmationService: ConfirmationService,
    private archivioDetailService: ArchivioDetailService,
    private navigationTabsService: NavigationTabsService,
    private strutturaService: StrutturaService,
    private personaService: PersonaService,
    private datepipe: DatePipe
  ) { }

  ngOnInit(): void {
    this.serviceToGetData = this.archiviListService;
    this.appService.appNameSelection("Elenco Fascicoli");
    this.archiviListMode = this.route.snapshot.queryParamMap.get('mode') as ArchiviListMode || ArchiviListMode.VISIBILI;
    if (!Object.values(ArchiviListMode).includes(this.archiviListMode)) {
      this.archiviListMode = ArchiviListMode.VISIBILI;
    }
    this.router.navigate([], { relativeTo: this.route, queryParams: { view: NavViews.FASCICOLI, mode: this.archiviListMode } });

    this.subscriptions.push(
      this.loginService.loggedUser$.subscribe(
        (utenteUtilities: UtenteUtilities) => {
          this.utenteUtilitiesLogin = utenteUtilities;
          if (this.displayArchiviListModeItem) {
            this.calcArchiviListModeItem();
            this.selectedArchiviListMode = {
              title: "Tutti gli archivi che posso vedere",
              label: "Visibili",
              routerLink: ["./" + ARCHIVI_LIST_ROUTE],
              queryParams: { "mode": ArchiviListMode.VISIBILI }
            };
          }
          // this.selectedArchiviListMode = this.archiviListModeItem.filter(element => element.queryParams.mode === this.archiviListMode)[0];
          if (this.archiviListMode) {
            this.calcAziendeFiltrabili();
          }
          this.loadConfiguration();

        }
      )
    );


    /* Mi sottoscrivo alla rotta per leggere la modalita dell'elenco documenti
     e faccio partire il caricamento. Ogni volta che la modalità cambia
     rifaccio la loadData */
    this.route.queryParams.subscribe(params => {
      //this.docsListMode = params["mode"];
      if (this.utenteUtilitiesLogin) this.calcAziendeFiltrabili();
      this.resetPaginationAndLoadData();
    });
  }



  /**
   * Questa funzione si occupa di caricare la configurazione personale
   * dell'utente per il componente.
   * Sulla base di questo vengono poi settate le colonne visualizzate
   */
  private loadConfiguration(): void {
    this.mandatoryColumns = ["dataCreazione"];
    if (this.aziendeFiltrabili.length > 1) {
      this.mandatoryColumns.push("idAzienda");
    }
    this.cols = cols;

    this.selectableColumns = cols.map(e => {
      if (this.mandatoryColumns.includes(e.field)) {
        e.selectionDisabled = true;
      }
      return e;
    });
    const impostazioni = this.utenteUtilitiesLogin.getImpostazioniApplicazione();
    if (impostazioni && impostazioni.impostazioniVisualizzazione && impostazioni.impostazioniVisualizzazione !== "") {
      const settings: Impostazioni = JSON.parse(impostazioni.impostazioniVisualizzazione) as Impostazioni;
      if (settings["scripta.archiviList"]) {
        this._selectedColumns = [];
        settings["scripta.archiviList"].selectedColumn.forEach(c => {
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

  @Input() get selectedColumns(): any[] {
    return this._selectedColumns;
  }


  set selectedColumns(colsSelected: ColonnaBds[]) {
    if (this._selectedColumns.length > colsSelected.length) {
      this._selectedColumns = this._selectedColumns.filter(sc => colsSelected.includes(sc));
    } else if (this._selectedColumns.length < colsSelected.length) {
      this._selectedColumns.push(colsSelected.find(cs => !this._selectedColumns.includes(cs)));
    }
    this.saveConfiguration();
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
  * Metodo chiamato quando l'utente cambia tab
  * Risetta la configurazione pagine e chiama la laoddata
  * Mantiene i filtri
  */
  public resetPaginationAndLoadData(): void {
    this.resetArchiviArrayLenght = true;
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
   * Costruisco i tab per l'EFI
  */
  public calcArchiviListModeItem(): void {
    this.archiviListModeItem = [];
    this.archiviListModeItem.push(
      {
        title: "Tutti gli archivi che posso vedere",
        label: "Visibili",
        // icon: "pi pi-fw pi-list", 
        routerLink: ["./" + ARCHIVI_LIST_ROUTE],
        queryParams: { "mode": ArchiviListMode.VISIBILI }
      },
      {
        title: "",
        label: "Recenti",
        // icon: "pi pi-fw pi-list", 
        routerLink: ["./" + ARCHIVI_LIST_ROUTE],
        queryParams: { "mode": ArchiviListMode.RECENTI }
      },
      {
        title: "",
        label: "Preferiti",
        // icon: "pi pi-fw pi-list", 
        routerLink: ["./" + ARCHIVI_LIST_ROUTE],
        queryParams: { "mode": ArchiviListMode.PREFERITI }
      },
      {
        title: "",
        label: "Frequenti",
        // icon: "pi pi-fw pi-list", 
        routerLink: ["./" + ARCHIVI_LIST_ROUTE],
        queryParams: { "mode": ArchiviListMode.FREQUENTI }
      }
    )
  }

  private calcAziendeFiltrabili() {
    this.aziendeFiltrabili = [];
    this.aziendeFiltrabili = this.utenteUtilitiesLogin.getUtente().aziendeAttive.map((azienda: Azienda) => {
      return { value: [azienda.id], label: azienda.nome } as ValueAndLabelObj;
    })
    if (this.aziendeFiltrabili.length > 1) {
      this.aziendeFiltrabili.push({
        value: this.aziendeFiltrabili.map(e => e.value[0]),
        label: "Tutte"
      } as ValueAndLabelObj);
    }
  }


  /**
   * Salva la configurazione colonne 
   */
  public saveConfiguration() {
    const impostazioniVisualizzazione = this.utenteUtilitiesLogin.getImpostazioniApplicazione() ? this.utenteUtilitiesLogin.getImpostazioniApplicazione().impostazioniVisualizzazione : null;
    let impostazioniVisualizzazioneObj: Impostazioni;
    if (impostazioniVisualizzazione && impostazioniVisualizzazione !== "") {
      impostazioniVisualizzazioneObj = JSON.parse(impostazioniVisualizzazione) as Impostazioni;
    } else {
      impostazioniVisualizzazioneObj = {
        "scripta.archiviList": {}
      } as Impostazioni;
    }
    impostazioniVisualizzazioneObj["scripta.archiviList"].selectedColumn = this.selectedColumns.map(c => c.field);
    this.utenteUtilitiesLogin.setImpostazioniApplicazione(this.loginService, impostazioniVisualizzazioneObj);
  }


  /**
   * Questa funzione gestisce il click del cambio tab
  */
  public onChangeArchiviListMode(event: any): void {
    this.archiviListMode = event.option.queryParams.mode;

    setTimeout(() => {
      this.router.navigate([], { relativeTo: this.route, queryParams: event.option.queryParams });
    }, 0);
  }


  /**
   * Questo metodo si occupa di esportare la ArchiviList in CSV.
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
    this.archivioDetailService.getData(
      this.projection,
      null,
      null,
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
          this.messageService.add({
            severity: "warn",
            key: "archiviListToast",
            summary: "Attenzione",
            detail: `Si è verificato un errore nello scaricamento del csv, contattare Babelcare`
          });
          this.exportCsvInProgress = false;
        }
      );
  }


  /**
   * Gestisco l'evento di cambiamento delle colonne visualizzate.
   * In particolare se ho tolto una colonna che era filtrata, tolgo quel filtro.
   * @param event
   */
  public onChangeMultiSelectedColumns(event: any): void {
    if (!event.value.some((e: ColonnaBds) => e.field === event.itemValue.field)) {
      // Se itemValue non è dentro l'elenco value allora ho tolto la spunta e quella colonna non è più visibile
      const col = this.filterColumns.find((e: ColumnFilter) => e.field === event.itemValue.filterField);
    }
  }


  /**
   * Metodo chiamato dalla tabella.
   * Calcola il pageconf, salva i filtri e chiama la loadData
   * @param event
   */
  public onLazyLoad(event: LazyLoadEvent): void {
    if (event.first === 0 && event.rows === this.rowsNumber) {
      event.rows = event.rows * 2;
    }

    console.log(`Chiedo ${this.pageConf.conf.limit} righe con offset di ${this.pageConf.conf.offset}`);
    this.storedLazyLoadEvent = event;

    if (this.filtriPuliti) {
      this.filtriPuliti = false;
      this.resetCalendarToInitialValues();
      this.dataTable.filters["dataCreazione"] = { value: this.calendarcreazione.value, matchMode: "is" };

      if (this.dropdownAzienda) {
        const value = this.aziendeFiltrabili.find(a => a.value[0] === this.utenteUtilitiesLogin.getUtente().idPersona.fk_idAziendaDefault.id).value;
        this.dropdownAzienda.writeValue(value);
        this.lastAziendaFilterValue = value;
        this.dataTable.filters["idAzienda.id"] = { value: this.dropdownAzienda.value, matchMode: "in" };
      }
    }

    this.loadData();
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
    if (this.loadArchiviListSubscription) {
      this.loadArchiviListSubscription.unsubscribe();
      this.loadArchiviListSubscription = null;
    }
    const filtersAndSorts: FiltersAndSorts = this.buildCustomFilterAndSort();
    this.loadArchiviListSubscription = this.archivioDetailService.getData(
      this.projection,
      filtersAndSorts,
      buildLazyEventFiltersAndSorts(this.storedLazyLoadEvent, this.cols, this.datepipe),
      this.pageConf).subscribe((data: any) => {
        console.log(data);
        this.totalRecords = data.page.totalElements;
        this.loading = false;

        if (this.resetArchiviArrayLenght) {
          /* Ho bisogno di far capire alla tabella quanto l'array docs è virtualmente grande
            in questo modo la scrollbar sarà sufficientemente lunga per scrollare fino all'ultimo elemento
            ps:a quanto pare la proprietà totalRecords non è sufficiente. */
          this.resetArchiviArrayLenght = false;
          this.dataTable.resetScrollTop();
          this.archivi = Array.from({ length: this.totalRecords });
        }

        if (this.pageConf.conf.offset === 0 && data.page.totalElements < this.pageConf.conf.limit) {
          /* Questo meccanismo serve per cancellare i risultati di troppo della tranche precedente.
          Se entro qui probabilmente ho fatto una ricerca */
          Array.prototype.splice.apply(this.archivi, [0, this.archivi.length, ...this.setCustomProperties(data.results)]);
        } else {
          Array.prototype.splice.apply(this.archivi, [this.storedLazyLoadEvent.first, this.storedLazyLoadEvent.rows, ...this.setCustomProperties(data.results)]);
        }
        this.archivi = [...this.archivi]; // trigger change detection
      },
        err => {
          this.messageService.add({
            severity: "warn",
            key: "archiviListToast",
            summary: "Attenzione",
            detail: `Si è verificato un errore nel caricamento, contattare Babelcare`
          });
        });
  }


  /**
     * Parso DocList[] facendolo diventare ExtendedDocList[] con le
     * proprietà utili alla visualizzazione popolate
     * @param docsList
     * @returns
     */
  private setCustomProperties(archiviList: ArchivioDetailView[]): ExtendedArchiviView[] {
    const extendedArchiviList: ExtendedArchiviView[] = archiviList as ExtendedArchiviView[];
    extendedArchiviList.forEach((archivio: ExtendedArchiviView) => {
      Object.setPrototypeOf(archivio, ExtendedArchiviView.prototype);
      archivio.tipoVisualizzazione = archivio.tipo;
      archivio.statoVisualizzazione = archivio.stato;
      archivio.vicariVisualizzazione = null;
      archivio.idPersonaResponsabileVisualizzazione = null;
      archivio.idPersonaCreazioneVisualizzazione = null;
    });
    return extendedArchiviList;
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
  * Serve a calcolare se l'utente è accessibile 
  * per capire cosa mostrargli nell'html
  */
  public isAccessibile(): boolean {
    return this.utenteUtilitiesLogin.getUtente().idPersona.accessibilita;
  }

  /**
 * Questo metodo costruisce filtri e sorting non provenienti dalla p-table
 * In particolare si occupa di impostare i giusti filtri a seconda
 * del tab selezionato (docsListMode)
 * @returns
 */
  private buildCustomFilterAndSort(): FiltersAndSorts {

    //filter to display only children of archivi when archivio tab is open
    const filterAndSort = new FiltersAndSorts();
    if (this.hasChildrens && this.childrenId.length != 0) {
      this.childrenId.forEach(child => {
        filterAndSort.addFilter(new FilterDefinition("id", FILTER_TYPES.not_string.equals, child));
      })

    }


    switch (this.archiviListMode) {
      // case ArchiviListMode.RECENTI:
      //   filterAndSort.addFilter(new FilterDefinition("idPersona.id", FILTER_TYPES.not_string.equals, this.utenteUtilitiesLogin.getUtente().idPersona.id));
      //   this.initialSortField = "dataCreazione";
      //   this.serviceToGetData = this.archivioDetailService;
      //   this.projectionToGetData = "CustomArchivioDetailWithIdAziendaAndIdPersonaCreazioneAndIdPersonaResponsabileAndIdStrutturaAndIdVicari";
      //   break;
      case ArchiviListMode.VISIBILI:
        filterAndSort.addFilter(new FilterDefinition("idPersona.id", FILTER_TYPES.not_string.equals, this.utenteUtilitiesLogin.getUtente().idPersona.id));
        filterAndSort.addFilter(new FilterDefinition("mioDocumento", FILTER_TYPES.not_string.equals, true));
        this.initialSortField = "dataCreazione";
        this.serviceToGetData = this.archivioDetailService;
        this.projectionToGetData = this.projection;
        break;
      // case ArchiviListMode.PREFERITI:
      //   filterAndSort.addAdditionalData(new AdditionalDataDefinition("OperationRequested", "VisualizzaTabIFirmario"));
      //   this.initialSortField = "dataCreazione";
      //   this.serviceToGetData = this.archivioDetailService;
      //   this.projectionToGetData = "ArchivioDetailWithIdAziendaAndIdPersonaCreazioneAndIdPersonaResponsabileAndIdStruttura";
      //   break;
      // case ArchiviListMode.FREQUENTI:
      //   filterAndSort.addAdditionalData(new AdditionalDataDefinition("OperationRequested", "VisualizzaTabIFirmario"));
      //   this.initialSortField = "dataCreazione";
      //   this.serviceToGetData = this.archivioDetailService;
      //   this.projectionToGetData = "ArchivioDetailWithIdAziendaAndIdPersonaCreazioneAndIdPersonaResponsabileAndIdStruttura";
      //   break;

    }

    return filterAndSort;
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
  * Usato per generare la stringa json che serve a filtrare
  * per l'appunto, una colonna json. In questo caso è una persona.
  * NB: Se ne servissero altri (oltre la persona) si può rendere più generica qeusta funzione.
  * @param idPersona
  * @returns
  */
  public buildJsonValueForFilterPersone(idPersona: number): string {
    if (idPersona) {
      const filtroJson: FilterJsonDefinition<Vicario> = new FilterJsonDefinition(true);
      filtroJson.add("idPersona", idPersona);
      return filtroJson.buildJsonString();
    }
    return null;
  }

  /* 
  L'utente ha cliccato su un archivio. Apriamolo
  TODO: Se il fascicolo cliccato in realtà è parte dell'alberatura in cui sono allora devo soloa ggiornare il tab
  */
  public openArchive(archivio: ExtendedArchiviView): void {
    this.navigationTabsService.addTab(
      this.navigationTabsService.buildaTabArchivio(archivio.id, archivio.numerazioneGerarchica)
    );
    this.navigationTabsService.activeLastTab();
  }

  /**
  * Funzione che si occupa di fare il clear di tutti i filtri della tabella.
  * In particolare quelli delle autocomplete che sono "separati" dal semplice
  * table.reset() vengono fatti a patto che quell'autocomplete esista.
  * @param table
  */
  public clear(): void {
    this.inputGobalFilter.nativeElement.value = "";
    if (this.autocompleteIdPersonaResponsabile) this.autocompleteIdPersonaResponsabile.writeValue(null);
    if (this.autocompleteIdPersonaCreazione) this.autocompleteIdPersonaCreazione.writeValue(null);
    if (this.autocompleteIdStruttura) this.autocompleteIdStruttura.writeValue(null);
    if (this.autocompleteVicari) this.autocompleteVicari.writeValue(null);
    this.myDatatableReset();
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
  public applyFilterGlobal(event: Event, matchMode: string) {
    const stringa: string = (event.target as HTMLInputElement).value;
    if (!!!stringa || stringa === "") {
      this.resetSort();
    }
    this.dataTable.filterGlobal(stringa, matchMode);
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
  public askConfirmAndHandleCalendarCreazioneEvent(calendar: Calendar, command: string, event: Event, filterCallback: (value: Date[]) => {}) {
    if (command === "onClickOutside") {
      calendar.writeValue(this.lastDataCreazioneFilterValue);
      return;
    }
    console.log(calendar.value);
    let needToAsk = false;
    if (command === "clear" || !!!calendar.value || calendar.value[0] === null) {
      // Sto cercando su tutti gli anni
      needToAsk = true;
    } else {
      if (calendar.value[1] !== null && ((calendar.value[1].getYear() - calendar.value[0].getYear()) > 1)) {
        // Se la differenza degli anni è maggiore di 1 allora sto cercando su almeno 3 anni.
        needToAsk = true;
      }
    }
    if (needToAsk) {
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
          }
        });
      }, 0);
    } else {
      this.handleCalendarButtonEvent(calendar, command, event, filterCallback);
    }
  }

  /**
  * Filtering per gli autocomplete della versione accessibile
  */
  public filterTipo(event: any) {
    let filtered: any[] = [];
    let query = event.query;
    for (let i = 0; i < this.tipoVisualizzazioneObj.length; i++) {
      let tipo = this.tipoVisualizzazioneObj[i];
      if (tipo.nome.toLowerCase().indexOf(query.toLowerCase()) == 0) {
        filtered.push(tipo);
      }
    }
    this.filteredTipo = filtered;
  }

  public filterStatoAccessibile(event: any) {
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

  public filterAziendaAccessibile(event: any) {
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
    if (this.loadArchiviListSubscription) {
      this.loadArchiviListSubscription.unsubscribe();
    }
  }
}




export interface ArchiviListModeItem {
  label: string;
  title: string;
  // icon: string;
  routerLink: string[];
  queryParams: any;
}


