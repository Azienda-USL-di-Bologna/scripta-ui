import { Component, Input, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { Archivio, ArchivioDetail, ArchivioDetailService, ArchivioDetailView, ArchivioDetailViewService, ArchivioService, AttoreArchivio, Azienda, ENTITIES_STRUCTURE, FluxPermission, Persona, PersonaService, RuoloAttoreArchivio, StatoArchivio, Struttura, StrutturaService, TipoArchivio } from '@bds/ng-internauta-model';
import { AppService } from '../../app.service';
import { NtJwtLoginService, UtenteUtilities } from "@bds/nt-jwt-login";
import { Subscription } from 'rxjs';
import { ARCHIVI_LIST_ROUTE } from 'src/environments/app-constants';
import { ArchiviListMode, cols, colsCSV, TipoArchivioTraduzioneVisualizzazione, StatoArchivioTraduzioneVisualizzazione } from './archivi-list-constants';
import { ActivatedRoute } from '@angular/router';
import { ValueAndLabelObj } from '../../docs-list-container/docs-list/docs-list.component';
import { AdditionalDataDefinition, FilterDefinition, FiltersAndSorts, FILTER_TYPES, NextSDREntityProvider, PagingConf } from '@nfa/next-sdr';
import { ColumnFilter, Table } from 'primeng/table';
import { Impostazioni } from '../../utilities/utils';
import { ConfirmationService, FilterMatchMode, FilterMetadata, FilterOperator, LazyLoadEvent, MenuItem, MessageService } from 'primeng/api';
import { ArchiviListService } from './archivi-list.service';
import { Calendar } from 'primeng/calendar';
import { Dropdown } from 'primeng/dropdown';
import { buildLazyEventFiltersAndSorts, ColonnaBds, CsvExtractor } from '@bds/primeng-plugin';
import { ExtendedArchiviView } from './extendend-archivi-view';
import { TabComponent } from '../../navigation-tabs/tab.component';
import { NavigationTabsService } from '../../navigation-tabs/navigation-tabs.service';
import { AutoComplete } from 'primeng/autocomplete';
import { DatePipe } from '@angular/common';
import { CaptionReferenceTableComponent } from '../../generic-caption-table/caption-reference-table.component';
import { CaptionSelectButtonsComponent } from '../../generic-caption-table/caption-select-buttons.component';
import { SelectButtonItem } from '../../generic-caption-table/select-button-item';
import { NewArchivoButton } from 'src/app/generic-caption-table/new-archivo-button';
import { CaptionFunctionalButtonsComponent } from 'src/app/generic-caption-table/caption-functional-buttons.component';

@Component({
  selector: 'archivi-list',
  templateUrl: './archivi-list.component.html',
  styleUrls: ['./archivi-list.component.scss']
})
export class ArchiviListComponent implements OnInit, TabComponent, OnDestroy, CaptionReferenceTableComponent, CaptionSelectButtonsComponent, CaptionFunctionalButtonsComponent {
  @Input() data: any;
  @ViewChildren(ColumnFilter) filterColumns: QueryList<ColumnFilter>;

  @ViewChild("columnFilterAzienda") public columnFilterAzienda: ColumnFilter;
  @ViewChild("calendarcreazione") public calendarcreazione: Calendar;
  @ViewChild("dropdownAzienda") public dropdownAzienda: Dropdown;
  @ViewChild("dropdownLivello") public dropdownLivello: Dropdown;
  @ViewChild("autocompleteIdPersonaResponsabile") public autocompleteIdPersonaResponsabile: AutoComplete;
  @ViewChild("autocompleteIdPersonaCreazione") public autocompleteIdPersonaCreazione: AutoComplete;
  @ViewChild("autocompleteIdStruttura") public autocompleteIdStruttura: AutoComplete;
  @ViewChild("autocompleteVicari") public autocompleteVicari: AutoComplete;
  @ViewChild("dt") public dataTable: Table;
  @ViewChild("columnFilterDataCreazione") public columnFilterDataCreazione: ColumnFilter;

  public archiviListModeEnum = ArchiviListMode;
  public archivi: ExtendedArchiviView[] = [];
  public archiviListMode: ArchiviListMode;
  private utenteUtilitiesLogin: UtenteUtilities;
  private subscriptions: Subscription[] = [];
  public selectButtonItems: SelectButtonItem[];
  public selectedButtonItem: SelectButtonItem = {
    title: "Tutti gli archivi che posso vedere",
    label: "Visibili",
    routerLink: ["./" + ARCHIVI_LIST_ROUTE],
    queryParams: { "mode": ArchiviListMode.VISIBILI }
  };
  public aziendeFiltrabili: ValueAndLabelObj[] = [];
  public livelliFiltrabili: ValueAndLabelObj[] = [
    { value: [1], label: "Fascicoli" },
    { value: [2], label: "Sottofascicoli" },
    { value: [3], label: "Inserti" },
    { value: [1,2,3], label: "Tutti" }
  ];
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
  public cols: ColonnaBds[] = [];
  public _selectedColumns: ColonnaBds[];
  private firstLoadDone = false;
  public livelloValue = [1]; // Mi serve per dare un valore iniziale alla dropdown del livello e per modificare il livello a esigenza
  public regexNumerazioneGerarchica: RegExp = new RegExp('^(\\d+-?)?(\\d+-?)?((\\d+)?|(\\d+)+\\/?\\d{0,4})$', 'm');
  public regexNumerazioneGerarchicaCompleta: RegExp = /^(\d+-?)?(\d+-?)?((\d+)+\/{1}\d{4}){1}$/m;
  public regexNumero: RegExp = /^\d+$/m;
  public fieldNumerazioneGerarchica: string = "numerazioneGerarchica";
  public matchModeNumerazioneGerarchica: string = FILTER_TYPES.string.startsWith;
  public newArchivoButton: NewArchivoButton;

  private _archivioPadre: Archivio | ArchivioDetail;
  get archivioPadre(): Archivio | ArchivioDetail { return this._archivioPadre; }
  @Input() set archivioPadre(archivioPadre: Archivio | ArchivioDetail) {
    this._archivioPadre = archivioPadre;
    if (this.firstLoadDone) {
      this.resetPaginationAndLoadData();
    }
  }

  constructor(
    private loginService: NtJwtLoginService,
    private route: ActivatedRoute,
    private appService: AppService,
    private messageService: MessageService,
    private archiviListService: ArchiviListService,
    private archivioService: ArchivioService,
    private confirmationService: ConfirmationService,
    private archivioDetailService: ArchivioDetailService,
    private archivioDetailViewService: ArchivioDetailViewService,
    private navigationTabsService: NavigationTabsService,
    private strutturaService: StrutturaService,
    private personaService: PersonaService,
    private datepipe: DatePipe
  ) { }

  ngOnInit(): void {
    this.serviceToGetData = this.archiviListService;
    this.cols = cols; 
    this.archiviListMode = this.route.snapshot.queryParamMap.get('mode') as ArchiviListMode || ArchiviListMode.VISIBILI;
    if (!Object.values(ArchiviListMode).includes(this.archiviListMode)) {
      this.archiviListMode = ArchiviListMode.VISIBILI;
    }
    //this.router.navigate([], { relativeTo: this.route, queryParams: { view: NavViews.FASCICOLI, mode: this.archiviListMode } });

    this.subscriptions.push(
      this.loginService.loggedUser$.subscribe(
        (utenteUtilities: UtenteUtilities) => {
          this.utenteUtilitiesLogin = utenteUtilities;
          this.newArchivoButton = {
            tooltip: "Crea nuovo fascicolo",
            livello: 0,
            aziendeItems: this.utenteUtilitiesLogin.getUtente().aziendeAttive.map(a => {
              return {
                label: a.nome,
                disabled: false,
                command: () => this.newArchivio(a.id)
              } as MenuItem
            })
          }; 

          //if (this.displayArchiviListModeItem) {
            this.calcArchiviListModeItem();
            this.selectedButtonItem = this.selectButtonItems[0];
          //}
          // this.selectedButtonItem = this.selectButtonItems.filter(element => element.queryParams.mode === this.archiviListMode)[0];
          if (this.archiviListMode) {
            this.calcAziendeFiltrabili();
          }
          
          if (!!!this.archivioPadre) {
            this.loadConfiguration();
          } else {
            this.setColumnsPerDetailArchivio();
          }
        }
      )
    );

    /* Mi sottoscrivo alla rotta per leggere la modalita dell'elenco documenti
    e faccio partire il caricamento. Ogni volta che la modalità cambia
    rifaccio la loadData */
    /* this.route.queryParams.subscribe(params => {
      //this.docsListMode = params["mode"];
      if (this.utenteUtilitiesLogin) this.calcAziendeFiltrabili();
      this.resetPaginationAndLoadData();
    }); */
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

  /**
   * In alternativa alla configurazione colonne caricata dal db vogliamo qui
   * settare delle colonne predefinite per la lista archivi nella modalità dettaglio archivio.
   * NB: In questa modalità l'utente non potrà modifcare le colonne
   */
  public setColumnsPerDetailArchivio(): void {
    const colonneDaVisualizzare = ["numerazioneGerarchica", "dataCreazione", "oggetto", "idPersonaCreazione"];
    // this._selectedColumns = this.cols.filter(c => colonneDaVisualizzare.includes(c.field));
    this._selectedColumns = [];
    colonneDaVisualizzare.forEach(c => {
      this._selectedColumns.push(this.cols.find(e => e.field === c));
    })
    console.log(this._selectedColumns)
  }

  @Input() get selectedColumns(): ColonnaBds[] {
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
    if (this.dropdownLivello) {
      this.dataTable.filters["livello"] = {value: this.dropdownLivello.value, matchMode: "in" };
    }

    this.loadData();
  }

  /**
   * Costruisco i tab per l'EFI
  */
  public calcArchiviListModeItem(): void {
    this.selectButtonItems = [];
      this.selectButtonItems.push(
        {
          title: "Tutti i fascicoli che posso vedere",
          label: "Visibili",
          // icon: "pi pi-fw pi-list", 
          routerLink: ["./" + ARCHIVI_LIST_ROUTE],
          queryParams: { "mode": ArchiviListMode.VISIBILI }
        },
        {
          title: "I fascicoli usati di recente",
          label: "Recenti",
          // icon: "pi pi-fw pi-list", 
          routerLink: ["./" + ARCHIVI_LIST_ROUTE],
          queryParams: { "mode": ArchiviListMode.RECENTI },
          disabled: true
        },
        {
          title: "I miei fascicoli preferiti",
          label: "Preferiti",
          // icon: "pi pi-fw pi-list", 
          routerLink: ["./" + ARCHIVI_LIST_ROUTE],
          queryParams: { "mode": ArchiviListMode.PREFERITI },
          disabled: true
        },
        {
          title: "I fascicoli frequenti",
          label: "Frequenti",
          // icon: "pi pi-fw pi-list", 
          routerLink: ["./" + ARCHIVI_LIST_ROUTE],
          queryParams: { "mode": ArchiviListMode.FREQUENTI },
          disabled: true
        },
        {
          title: "Tutti i fascicoli",
          label: "Tutti",
          // icon: "pi pi-fw pi-list", 
          routerLink: ["./" + ARCHIVI_LIST_ROUTE],
          queryParams: { "mode": ArchiviListMode.TUTTI }
        }
      );
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
  public onSelectButtonItemSelection(event: any): void {
    this.archiviListMode = event.option.queryParams.mode;

    /* setTimeout(() => {
      this.router.navigate([], { relativeTo: this.route, queryParams: event.option.queryParams });
    }, 0); */
    if (this.utenteUtilitiesLogin) this.calcAziendeFiltrabili();
    if (this.archiviListMode === ArchiviListMode.TUTTI) {
      // In TUTTI, devo obbligatoriamnte vedere solo il livello 1.
      this.livelloValue = [1];
      if (this.dropdownLivello) {
        this.dropdownLivello.writeValue(this.livelloValue);
      }
    }

    this.resetPaginationAndLoadData();
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
    const filtersAndSorts: FiltersAndSorts = this.buildCustomFilterAndSort();
    this.serviceToGetData.getData(
      this.projectionToGetData,
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

      if (this.dropdownLivello) {
        if (this.archivioPadre) {
          // Nel caso di dettaglio archivio non voglio imporre un filtro sul livello
          this.livelloValue = this.livelliFiltrabili.find(l => l.label === "Tutti").value;
        } else {
          this.livelloValue = [1];
        }
        this.dropdownLivello.writeValue(this.livelloValue);
        this.dataTable.filters["livello"] = { value: this.dropdownLivello.value, matchMode: "in" };
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
    this.firstLoadDone = true;
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
    this.loadArchiviListSubscription = this.serviceToGetData.getData(
      this.projectionToGetData,
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
   * NB: In caso di lista aperta in dettaglio arhcivi il default è che non c'è filtro
   */
  private resetCalendarToInitialValues() {
    if (this.archivioPadre) {
      this.calendarcreazione.writeValue(null);
    } else {
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
    // filter to display only children of archivi when archivio tab is open
    const filterAndSort = new FiltersAndSorts();
    if (this.archivioPadre) {
      filterAndSort.addFilter(new FilterDefinition("idArchivioPadre.id", FILTER_TYPES.not_string.equals, this.archivioPadre.id));
      filterAndSort.addFilter(new FilterDefinition("idAzienda.id", FILTER_TYPES.not_string.equals, this.archivioPadre.fk_idAzienda.id));
      
      this.archiviListMode = ArchiviListMode.VISIBILI;
    }
    this.initialSortField = "dataCreazione";
    this.serviceToGetData = this.archivioDetailService;
    this.projectionToGetData = ENTITIES_STRUCTURE.scripta.archiviodetail.customProjections.CustomArchivioDetailWithIdAziendaAndIdPersonaCreazioneAndIdPersonaResponsabileAndIdStrutturaAndIdVicari;
    switch (this.archiviListMode) {
      case ArchiviListMode.VISIBILI:
        // Uso la vista che fa join con i permessi. E cerco solo archivi in cui io sono presente
        filterAndSort.addFilter(new FilterDefinition("idPersona.id", FILTER_TYPES.not_string.equals, this.utenteUtilitiesLogin.getUtente().idPersona.id));
        this.serviceToGetData = this.archivioDetailViewService;
        this.projectionToGetData = ENTITIES_STRUCTURE.scripta.archiviodetailview.customProjections.CustomArchivioDetailViewWithIdAziendaAndIdPersonaCreazioneAndIdPersonaResponsabileAndIdStrutturaAndIdVicari;
        break;
      case ArchiviListMode.TUTTI:
        filterAndSort.addFilter(new FilterDefinition("livello", FILTER_TYPES.not_string.equals, 1));
        
        break;
      case ArchiviListMode.PREFERITI:
        filterAndSort.addAdditionalData(new AdditionalDataDefinition("OperationRequested", "VisualizzaTabPreferiti"));
        break;
      case ArchiviListMode.FREQUENTI:
        break;
      case ArchiviListMode.RECENTI:
        filterAndSort.addAdditionalData(new AdditionalDataDefinition("OperationRequested", "VisualizzaTabRecenti"));
        break;
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

  /* 
   * L'utente ha cliccato su un archivio. Apriamolo
   */
  public openArchive(archivio: ExtendedArchiviView): void {
    this.navigationTabsService.addTabArchivio(archivio);
    this.appService.appNameSelection("Fascicolo "+ archivio.numerazioneGerarchica + " [" + archivio.idAzienda.aoo + "]");
  }

  public isArchivioChiuso(archivio: ExtendedArchiviView): boolean {
    if(archivio.stato == "CHIUSO" || archivio.stato == "PRECHIUSO")
      return true;
    else
      return false;
  }

  public isArchivioSpeciale(archivio: ExtendedArchiviView): boolean {
    if(archivio.tipo == "SPECIALE")
      return true;
    else
      return false;
  }

  /**
  * Funzione che si occupa di fare il clear di tutti i filtri della tabella.
  * In particolare quelli delle autocomplete che sono "separati" dal semplice
  * table.reset() vengono fatti a patto che quell'autocomplete esista.
  * @param table
  */
  public clear(): void {
    //this.inputGobalFilter.nativeElement.value = "";
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
    } else {
      this.livelloValue = this.livelliFiltrabili.find(l => l.label === "Tutti").value;
      this.dropdownLivello.writeValue(this.livelloValue);
      this.dataTable.filters["livello"] = { value: this.dropdownLivello.value, matchMode: "in" };
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
      //for only year picker
      //this is a check if it is only a year selected
      //if is a range we change the date to the last day of the year
      if (calendar.value[1] === null) {
        calendar.writeValue([calendar.value[0],new Date(calendar.value[0].getFullYear(), 11, 31)]);
      } else {
        calendar.writeValue([calendar.value[0],new Date(calendar.value[1].getFullYear(), 11, 31)]);
      }
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
   * Toast mostrato all'utente quando cerca di eseguire una ricerca per numerazione
   * gerarchica inserito un pattern non corretto
   */
  public showToastNumerazioneNonCorretta(): void {
    this.messageService.add({
      severity: "warn",
      key: "archiviListToast",
      summary: "Attenzione",
      detail: `Quanto inserito non sembra essere una numerazione gerarchica`
    }); 
  }

  /**
   * Metodo per gestire il filtro della numerazione gerarchica completamente custom.
   * La ColumnFilter di primeng non permette un cambio del campo di filtro a runtime.
   * Dunque qui avviene una gestione custom del filtro.
   * I campi di filtro sono "numero" o "numerazioneGerarchica" a seconda dell'input dell'utente
   * 
   * @param text 
   */
  public onEnterNumerazioneGerarchica(text: string) {
    if (!this.regexNumerazioneGerarchica.test(text)) {
      // La regex non è rispettata in nessun senso. Lo dico all'utente
      this.showToastNumerazioneNonCorretta();
      return;
    } 
    if (this.regexNumero.test(text)) {
      // La regex è un numero. Preparo il filtro e lo faccio partire
      (this.dataTable.filters[this.fieldNumerazioneGerarchica] as any).value = null;
      this.fieldNumerazioneGerarchica = "numero";
      this.matchModeNumerazioneGerarchica = FILTER_TYPES.not_string.equals;
    } else if (this.regexNumerazioneGerarchicaCompleta.test(text)) {
      // La regex è una numerazione Gerarchica completa. Preparo il filtro e lo faccio partire
      (this.dataTable.filters[this.fieldNumerazioneGerarchica] as any).value = null;
      this.fieldNumerazioneGerarchica = "numerazioneGerarchica";
      this.matchModeNumerazioneGerarchica = FILTER_TYPES.string.equals;
    } else {
      // La regex è un numerazioneGerarchica. Preparo il filtro e lo faccio partire
      (this.dataTable.filters[this.fieldNumerazioneGerarchica] as any).value = null;
      this.fieldNumerazioneGerarchica = "numerazioneGerarchica";
      this.matchModeNumerazioneGerarchica = FILTER_TYPES.string.startsWith;
    }

    if (text.includes("-") && this.livelloValue.length !== 3 && this.archiviListMode !== ArchiviListMode.TUTTI) {
      this.livelloValue = this.livelliFiltrabili.find(l => l.label === "Tutti").value;
      this.dropdownLivello.writeValue(this.livelloValue);
      this.dataTable.filters["livello"] = { value: this.dropdownLivello.value, matchMode: "in" };
    }
    
    this.dataTable.filters[this.fieldNumerazioneGerarchica] = {value: text, matchMode: this.matchModeNumerazioneGerarchica, operator: FilterOperator.AND};
    this.dataTable._filter();
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

  /**
   * newArchivio
   */
  public newArchivio(codiceAzienda: number): void {    
    const archivioBozza = new Archivio();
    archivioBozza.livello = this.archivioPadre?.livello != null ? this.archivioPadre?.livello + 1 : 1;
    archivioBozza.idAzienda = this.archivioPadre?.idAzienda != null ? {id: this.archivioPadre?.idAzienda.id} as Azienda : {id: codiceAzienda} as Azienda;
    archivioBozza.stato = StatoArchivio.BOZZA;
    archivioBozza.tipo = TipoArchivio.AFFARE;
    archivioBozza.foglia = true;
    archivioBozza.oggetto = "";
    archivioBozza.numero = 0;
    archivioBozza.anno = 0;
    archivioBozza.numerazioneGerarchica = this.archivioPadre?.numerazioneGerarchica ? this.archivioPadre?.numerazioneGerarchica.replace("/", "-x/") : "x/x";

    if (this.archivioPadre?.livello >= 1 && this.archivioPadre?.livello < 3) {
      archivioBozza.livello = this.archivioPadre?.livello + 1;
      archivioBozza.numerazioneGerarchica = this.archivioPadre?.numerazioneGerarchica.replace("/", "-x/");
      archivioBozza.idArchivioPadre = {id: this.archivioPadre.id} as Archivio;
      archivioBozza.idArchivioRadice = {id: this.archivioPadre.fk_idArchivioRadice.id} as Archivio;
    } else {
      archivioBozza.livello = 1;
      archivioBozza.numerazioneGerarchica = "x/x";
    }

    const idPersonaCreazione = new AttoreArchivio();
    idPersonaCreazione.idPersona = {
      id: this.utenteUtilitiesLogin.getUtente().idPersona.id
    } as Persona;
    idPersonaCreazione.ruolo = RuoloAttoreArchivio.CREATORE;

    archivioBozza.attoriList = [idPersonaCreazione];

    this.subscriptions.push(this.archivioService.postHttpCall(
        archivioBozza, 
        ENTITIES_STRUCTURE.scripta.archivio.customProjections.CustomArchivioWithIdAziendaAndIdMassimarioAndIdTitolo)
        .subscribe((nuovoArchivioCreato: Archivio) => {      
          this.navigationTabsService.addTabArchivio(nuovoArchivioCreato, true);
    }));
  }

}
