import { Component, OnInit } from "@angular/core";
import { JwtLoginService, UtenteUtilities } from "@bds/jwt-login";
import { Subscription } from "rxjs";
import { Archivio, ConfigurazioneService, ParametroAziende } from "@bds/internauta-model";
import { NavigationTabsService } from "./navigation-tabs.service";
import { TabItem } from "./tab-item";
import { Router } from "@angular/router";
import { AppService } from "../app.service";
import { ExtendedArchivioService } from "../archivio/extended-archivio.service";

@Component({
  selector: "navigation-tabs",
  templateUrl: "./navigation-tabs.component.html",
  styleUrls: ["./navigation-tabs.component.scss"]
})
export class NavigationTabsComponent implements OnInit {
  private subscriptions: Subscription[] = [];
  private utenteUtilitiesLogin: UtenteUtilities;
  //private tabName: any;
  public tabItems: TabItem[] = [];


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
      this.navigationTabsService.activeTabByIndex(0);
      this.appService.appNameSelection("Elenco Fascicoli")
    } else if (this.router.routerState.snapshot.url.includes("apridascrivania")) {
      this.navigationTabsService.activeTabByIndex(0);
      const idArchivio = this.router.parseUrl(this.router.url).queryParams["id"];
      this.archivioService.getByIdHttpCall(idArchivio, 'ArchivioWithIdAziendaAndIdMassimarioAndIdTitolo').subscribe( res => {
        this.navigationTabsService.addTabArchivio(res, true, false);
      });

    } else {
      this.navigationTabsService.activeTabByIndex(1);  
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
            this.utenteUtilitiesLogin = utenteUtilities;
            // Mostrare il tab fascicoli solo se è acceso il parametro in una delle aziende dell'utente
            let idAziendaArray: number[] = [];
            this.utenteUtilitiesLogin.getUtente().aziende.forEach(elem => {
              idAziendaArray.push(elem.id);
            });
            this.subscriptions.push(
              this.configurazioneService.getParametriAziende("tabFascicoliScriptaActive", null, idAziendaArray).subscribe(
                (parametriAziende: ParametroAziende[]) => {
                  console.log(parametriAziende[0].valore);
                  const showTabFascicoli = JSON.parse(parametriAziende[0].valore || false);
                  if (showTabFascicoli) {
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
        )
      ); 
    }
  }

  /**
   * E setto tutti i tab.
   */
  private setTabsAndActiveOneOfThem(): void {
    this.tabItems = this.navigationTabsService.getTabs();
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
