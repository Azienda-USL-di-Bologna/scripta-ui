import { AfterViewInit, Component, OnInit, ViewChild } from "@angular/core";
import { JwtLoginService, UtenteUtilities } from "@bds/jwt-login";
import { Subscription } from "rxjs";
import { Archivio, ConfigurazioneService, ParametroAziende } from "@bds/internauta-model";
import { NavigationTabsService } from "./navigation-tabs.service";
import { TabItem } from "./tab-item";
import { Router } from "@angular/router";
import { AppService } from "../app.service";
import { ExtendedArchivioService } from "../archivio/extended-archivio.service";
import { TabView } from "primeng/tabview";

@Component({
  selector: "navigation-tabs",
  templateUrl: "./navigation-tabs.component.html",
  styleUrls: ["./navigation-tabs.component.scss"]
})
export class NavigationTabsComponent implements OnInit, AfterViewInit {
  private subscriptions: Subscription[] = [];
  private utenteUtilitiesLogin: UtenteUtilities;
  //private tabName: any;
  public tabItems: TabItem[] = [];
  private tabIndexToActiveAtTheBeginning = 0;
  private idArchivioAperturaDaScrivania: number;
  @ViewChild("tabview") private tabview: TabView;

  constructor(
    private appService: AppService,
    private loginService: JwtLoginService,
    private configurazioneService: ConfigurazioneService,
    public navigationTabsService: NavigationTabsService,
    //private route: ActivatedRoute,
    private router: Router,
    private archivioService: ExtendedArchivioService
  ) {
    console.log(this.router)
    if (this.router.routerState.snapshot.url.includes("archivilist")) {
      //this.navigationTabsService.activeTabByIndex(0);
      this.tabIndexToActiveAtTheBeginning = 0;
      this.appService.appNameSelection("Elenco Fascicoli")
    } else if (this.router.routerState.snapshot.url.includes("apridascrivania")) {
      //this.navigationTabsService.activeTabByIndex(0);
      this.tabIndexToActiveAtTheBeginning = 0;
      this.idArchivioAperturaDaScrivania = this.router.parseUrl(this.router.url).queryParams["id"];
    } else {
      //this.navigationTabsService.activeTabByIndex(1);  
      this.tabIndexToActiveAtTheBeginning = 1;
      this.appService.appNameSelection("Elenco Documenti")
    }
  
    
    /* this.route.queryParams.subscribe(params => {
      console.log("params", params)
      this.tabName = params['view'];
      if(this.tabName == 'FASCICOLI') {
        this.navigationTabsService.activeTabIndex = 1;
      } else {
        this.navigationTabsService.activeTabIndex = 0;
      }
    }); */
  }

  ngOnInit(): void {
    
    const tabLoadedFromSessionStorage = this.navigationTabsService.loadTabsFromSessionStorage();

    if (tabLoadedFromSessionStorage) {
      this.setTabsAndActiveOneOfThem(); 
    } else {
      /* Questa sottoscrizione serve a capire se l'utente appartiene ad una azienda che
        usa gedi internauta. serve quindi solo a decidere se mostrare il tab degli archivi
      */
      this.subscriptions.push(
        this.loginService.loggedUser$.subscribe(
          (utenteUtilities: UtenteUtilities) => {
            if (utenteUtilities) {
              this.utenteUtilitiesLogin = utenteUtilities;
              // Mostrare il tab fascicoli solo se è acceso il parametro in una delle aziende dell'utente
              let idAziendaArray: number[] = [];
              this.utenteUtilitiesLogin.getUtente().aziendeAttive.forEach(elem => {
                idAziendaArray.push(elem.id);
              });
              this.subscriptions.push(
                this.configurazioneService.getParametriAziende("usaGediInternauta", null, idAziendaArray).subscribe(
                  (parametriAziende: ParametroAziende[]) => {
                    console.log(parametriAziende);
                    let showTabFascicoli = false;
                    for (const parametroAziende of parametriAziende) {
                      showTabFascicoli = showTabFascicoli || JSON.parse(parametroAziende.valore);
                    }
                    let ragazzoDelNovantaNove = false;
                    if (this.utenteUtilitiesLogin.getUtente() && this.utenteUtilitiesLogin.getUtente().utenteReale) {
                      ragazzoDelNovantaNove = (this.utenteUtilitiesLogin.getUtente().utenteReale.idInquadramento as unknown as String) === "99";
                    } else if (this.utenteUtilitiesLogin.getUtente()) {
                      ragazzoDelNovantaNove = (this.utenteUtilitiesLogin.getUtente().idInquadramento as unknown as String) === "99";
                    }
                    if (showTabFascicoli || ragazzoDelNovantaNove) {
                      this.navigationTabsService.addTab(
                        this.navigationTabsService.buildaTabArchiviList()
                      );
                    }
                    this.navigationTabsService.addTab(
                      this.navigationTabsService.buildaTabDocsList()
                    );
                    this.setTabsAndActiveOneOfThem();
  
                    // Tolgo subito queste due sottoscrizioni che mi disturbano quando per qualche motivo riscattano.
                    this.subscriptions.forEach(
                      s => s.unsubscribe()
                    );
                    this.subscriptions = [];
                  }
                )  
              );
            }
          }
        )
      ); 
    }
  }

  ngAfterViewInit(): void {
    this.tabview.forwardIsDisabled = true;
  }

  /**
   * E setto tutti i tab.
   */
  private setTabsAndActiveOneOfThem(): void {
    // this.tabItems = this.navigationTabsService.getTabs();
    //debugger;
    const allTabs = this.navigationTabsService.getTabs();
    this.tabItems = [allTabs[this.tabIndexToActiveAtTheBeginning]];
    // this.tabItems.unshift(...allTabs)
    setTimeout(() => {
      this.tabItems = allTabs;
      this.navigationTabsService.activeTabByIndex(this.tabIndexToActiveAtTheBeginning);
      if (this.idArchivioAperturaDaScrivania) {
        this.archivioService.getByIdHttpCall(this.idArchivioAperturaDaScrivania, 'ArchivioWithIdAziendaAndIdMassimarioAndIdTitolo').subscribe( res => {
          this.navigationTabsService.addTabArchivio(res, true, false);
        });
      }
    }, 0);
    /* for(let i=0; i < this.tabItems.length; i++) {
      if(this.tabItems[i].type === TabType.ARCHIVI_LIST && this.tabItems[i-1].type === TabType.DOCS_LIST) {
        let tempTab = this.tabItems[i-1];
        this.tabItems[i-1] = this.tabItems[i];
        this.tabItems[i] = tempTab;
      }
    } */
  }
  
  public onChangeTab(tabIndex: number): void {
    /* if (tabIndex == 0 || tabIndex == 1 ){
      this.appService.appNameSelection("Elenco "+ this.navigationTabsService.getTabs()[tabIndex].label);
    } else {
      this.appService.appNameSelection("Fascicolo "+ this.navigationTabsService.getTabs()[tabIndex].label);
    } */
    this.navigationTabsService.addTabToHistory(tabIndex);
    this.appService.appNameSelection(this.navigationTabsService.getTabs()[tabIndex].labelForAppName);
  }

  public onCloseTab(e: any): void {
    this.navigationTabsService.removeTab(e.index);
    this.appService.appNameSelection("Elenco Fascicoli");

  }

  /* public clickOnTab(event: MouseEvent, item: TabItem) {
    console.log(event, item);
    if (item.closable) {
      event.
    }
  } */
}
