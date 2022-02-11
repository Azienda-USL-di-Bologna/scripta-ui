import { Component, Input, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { ArchivioDetailService, ArchivioDetailView, Azienda } from '@bds/ng-internauta-model';
import { AppService } from '../app.service';
import { NtJwtLoginService, UtenteUtilities } from "@bds/nt-jwt-login";
import { Subscription } from 'rxjs';
import { ARCHIVI_LIST_ROUTE } from 'src/environments/app-constants';
import { ArchiviListMode,  cols, colsCSV } from './archivi-list-constants';
import { ActivatedRoute, Router } from '@angular/router';
import { ValueAndLabelObj } from '../docs-list/docs-list.component';
import { NextSDREntityProvider, PagingConf} from '@nfa/next-sdr';
import { ColumnFilter, Table } from 'primeng/table';
import { Impostazioni } from '../utilities/utils';
import { ConfirmationService, LazyLoadEvent, MessageService } from 'primeng/api';
import { ArchiviListService } from './archivi-list.service';
import { Calendar } from 'primeng/calendar';
import { Dropdown } from 'primeng/dropdown';
import { ColonnaBds, CsvExtractor } from '@bds/primeng-plugin';
import { ExtendedArchiviView } from './extendend-archivi-view';
import { NavViews } from '../navigation-tabs/navigation-tabs-contants';
import { TabComponent } from '../navigation-tabs/tab.component';
import { NavigationTabsService } from '../navigation-tabs/navigation-tabs.service';
import { HeaderFeaturesConfig } from '@bds/common-components';

@Component({
  selector: 'app-archivi-list',
  templateUrl: './archivi-list.component.html',
  styleUrls: ['./archivi-list.component.scss']
})
export class ArchiviListComponent implements OnInit, TabComponent {
  @Input() data: any;
  @ViewChildren(ColumnFilter) filterColumns: QueryList<ColumnFilter>;
  @ViewChild("calendarcreazione") public calendarcreazione: Calendar;
  @ViewChild("dropdownAzienda") public dropdownAzienda: Dropdown;
  @ViewChild("dt") public dataTable: Table;
public j = JSON;
  public archivi: ExtendedArchiviView[] = [];
  public archiviListMode: ArchiviListMode;
  private utenteUtilitiesLogin: UtenteUtilities;
  private subscriptions: Subscription[] = [];
  private archiviListModeItem: ArchiviListModeItem[];
  public aziendeFiltrabili: ValueAndLabelObj[] = [];
  public exportCsvInProgress: boolean = false;
  public selectableColumns: ColonnaBds[] = [];
  private mandatoryColumns: string[] = [];
  public rowsNumber: number = 20;
  public totalRecords: number ;
  public loading: boolean = false;
  public filtriPuliti: boolean = true;
  private storedLazyLoadEvent: LazyLoadEvent;
  private loadArchiviListSubscription: Subscription;
  private serviceForGetData: NextSDREntityProvider = null;
  private lastDataCreazioneFilterValue: Date[];
  private lastAziendaFilterValue: number[];
  public dataMinimaCreazione: Date = new Date("2000-01-01");
  public dataMassimaCreazione: Date = new Date("2030-12-31");
  private pageConf: PagingConf = { mode: "LIMIT_OFFSET_NO_COUNT", conf: { limit: 0, offset: 0 } };
  public selectedArchiviListMode: ArchiviListModeItem = {
    title: "Tutti gli archivi che posso vedere",
    label: "Visibili", 
    routerLink: ["./" + ARCHIVI_LIST_ROUTE], 
    queryParams: {"mode": ArchiviListMode.VISIBILI}
  };
  public cols: ColonnaBds[] = [];
  public _selectedColumns: ColonnaBds[];
 

  constructor(
    private appService: AppService,
    private loginService: NtJwtLoginService,
    private route: ActivatedRoute,
    private router: Router,
    private messageService: MessageService,
    private archiviListService: ArchiviListService,
    private confirmationService: ConfirmationService,
    private archivioDetailService: ArchivioDetailService,
    private navigationTabsService: NavigationTabsService
  ) { }

  ngOnInit(): void {
    this.serviceForGetData = this.archiviListService;
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
          this.calcArchiviListModeItem();
          this.selectedArchiviListMode = {
            title: "Tutti gli archivi che posso vedere",
            label: "Visibili", 
            routerLink: ["./" + ARCHIVI_LIST_ROUTE], 
            queryParams: {"mode": ArchiviListMode.VISIBILI}
          } ;
          // this.selectedArchiviListMode = this.archiviListModeItem.filter(element => element.queryParams.mode === this.archiviListMode)[0];
          if(this.archiviListMode) {
             this.calcAziendeFiltrabili();
          }
          this.loadConfiguration();
        }
      )
    );
  }

  @Input() get selectedColumns(): any[] {
    return this._selectedColumns;
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
        queryParams: {"mode": ArchiviListMode.VISIBILI}
      },
      {
        title: "",
        label: "Recenti", 
        // icon: "pi pi-fw pi-list", 
        routerLink: ["./" + ARCHIVI_LIST_ROUTE], 
        queryParams: {"mode": ArchiviListMode.RECENTI}
      },
      {
        title: "",
        label: "Preferiti", 
        // icon: "pi pi-fw pi-list", 
        routerLink: ["./" + ARCHIVI_LIST_ROUTE], 
        queryParams: {"mode": ArchiviListMode.PREFERITI}
      },
      {
        title: "",
        label: "Frequenti", 
        // icon: "pi pi-fw pi-list", 
        routerLink: ["./" + ARCHIVI_LIST_ROUTE], 
        queryParams: {"mode": ArchiviListMode.FREQUENTI}
      }
    )
  }

  private calcAziendeFiltrabili() {
    this.aziendeFiltrabili = [];
    this.aziendeFiltrabili = this.utenteUtilitiesLogin.getUtente().aziendeAttive.map((azienda: Azienda) => {
      return {value: [azienda.id], label: azienda.nome} as ValueAndLabelObj;
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
      "ArchivioDetailViewWithIdAziendaAndIdPersonaCreazioneAndIdPersonaResponsabileAndIdStruttura",
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
            key : "archiviListToast",
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
  
    this.loadData();
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
    // const filtersAndSorts: FiltersAndSorts = this.buildCustomFilterAndSort();
    this.loadArchiviListSubscription = this.archivioDetailService.getData(
      "ArchivioDetailViewWithIdAziendaAndIdPersonaCreazioneAndIdPersonaResponsabileAndIdStruttura",
      null,
      null,
      this.pageConf).subscribe((data: any) => {
        console.log(data);
        this.totalRecords = data.page.totalElements;
        this.loading = false;

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
            key : "archiviListToast",
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
  * Serve a calcolare se l'utente è accessibile 
  * per capire cosa mostrargli nell'html
  */
  public isAccessibile(): boolean {
    return this.utenteUtilitiesLogin.getUtente().idPersona.accessibilita;
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
}

export interface ArchiviListModeItem {
  label: string;
  title: string;
  // icon: string;
  routerLink: string[];
  queryParams: any;
}


