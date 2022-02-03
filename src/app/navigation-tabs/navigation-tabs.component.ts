import { Component, OnInit } from "@angular/core";
import { NtJwtLoginService, UtenteUtilities } from "@bds/nt-jwt-login";
import { MenuItem } from "primeng/api";
import { Subscription } from "rxjs";
import { DOCS_LIST_ROUTE, ARCHIVI_LIST_ROUTE } from "src/environments/app-constants";
import { ActivatedRoute, Router } from "@angular/router";
import { ConfigurazioneService, ParametroAziende } from "@bds/ng-internauta-model";
import { NavViews } from "./navigation-tabs-contants";
import { NavigationTabsService } from "./navigation-tabs.service";
import { TabItem } from "./tab-item";
import { DocsListComponent } from "../docs-list/docs-list.component";
import { ArchiviListComponent } from "../archivi-list/archivi-list.component";

@Component({
  selector: "navigation-tabs",
  templateUrl: "./navigation-tabs.component.html",
  styleUrls: ["./navigation-tabs.component.scss"]
})
export class NavigationTabsComponent implements OnInit {
  private subscriptions: Subscription[] = [];
  private utenteUtilitiesLogin: UtenteUtilities;

  //public activeItem: MenuItem;
  //public items: MenuItem[];
  public tabItems: TabItem[] = [];
  public activeTabIndex: number = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private loginService: NtJwtLoginService,
    private configurazioneService: ConfigurazioneService,
    private navigationTabsService: NavigationTabsService
  ) {
    /* this.items = [
      {
        label: "Documenti", 
        icon: "pi pi-fw pi-list", 
        routerLink: ["./" + DOCS_LIST_ROUTE], 
        queryParams: {
          "view": NavViews.DOCUMENTI,
          "mode": DocsListMode.MIEI_DOCUMENTI
        }
      },
      {
        label: "Fascicoli", 
        icon: "pi pi-fw pi-list", 
        routerLink: ["./" + ARCHIVI_LIST_ROUTE], 
        queryParams: {
          "view": NavViews.FASCICOLI,
          "mode": ArchiviListMode.RECENTI
        },
        visible: false
      },
      {
        label: "1/2022", 
        icon: "pi pi-fw pi-folder", 
        routerLink: ["./" + ARCHIVI_LIST_ROUTE], 
        queryParams: {},
        visible: true,
        id: "2"
      }
    ]; */
    /* const navView = this.route.snapshot.queryParamMap?.get('view') as NavViews || NavViews.DOCUMENTI ;
    switch (navView) {
      case NavViews.FASCICOLI:
        //this.activeItem = this.items.find(i => i.label === "Fascicoli");
        this.router.navigate([ARCHIVI_LIST_ROUTE], { relativeTo: this.route});
        break;
      case NavViews.DOCUMENTI:
      default:
        //this.activeItem = this.items.find(i => i.label === "Documenti");
        this.router.navigate([DOCS_LIST_ROUTE], { relativeTo: this.route});
        break;
    } */
  }

  ngOnInit(): void {
    //this.tabItems = this.navigationTabsService.getTabs();
    const tabLoadedFromSessionStorage = this.navigationTabsService.loadTabsFromSessionStorage();

    if (tabLoadedFromSessionStorage) {
      this.setTabsAndActiveOneOfThem();
    } else {
      this.navigationTabsService.addTab(
        this.navigationTabsService.buildaTabDocsList()
      );
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
            this.configurazioneService.getParametriAziende("tabFascicoliScriptaActive", null, idAziendaArray)
            .subscribe((parametriAziende: ParametroAziende[]) => {
              console.log(parametriAziende[0].valore);
              const showTabFascicoli = JSON.parse(parametriAziende[0].valore || false);
              if (showTabFascicoli) {
                /* this.items[1].visible = true;
                this.items = [...this.items]; */
                this.navigationTabsService.addTab(
                  this.navigationTabsService.buildaTabArchiviList()
                );
              } else {
                const navView = this.route.snapshot.queryParamMap?.get('view') as NavViews || NavViews.DOCUMENTI ;
                if (navView === NavViews.FASCICOLI) {
                  //this.activeItem = this.items.find(i => i.label === "Documenti");
                  this.router.navigate([DOCS_LIST_ROUTE], { relativeTo: this.route});
                }
              }
              this.setTabsAndActiveOneOfThem();
            });     
          }
        )
      );
    }
  }

  /**
   * Setto activeTabIndex capendo quale è il tab attivo in base alla rotta.
   * E setto tutti i tab.
   * TODO: Qui sto mettendo numeri hard coded. non va bene. soprattuto per l'archivio che è dinamico
   */
  private setTabsAndActiveOneOfThem(): void {
    const tabItems = this.navigationTabsService.getTabs();
    const navView = this.route.snapshot.queryParamMap?.get('view') as NavViews || NavViews.DOCUMENTI;
    switch (navView) {
      case NavViews.FASCICOLI:
        this.activeTabIndex = 1;
        break;
      case NavViews.ARCHIVIO:
        this.activeTabIndex = 2;
        break;
      case NavViews.DOCUMENTI:
      default:
        this.activeTabIndex = 0;
        break;
    }
    this.tabItems = tabItems;
  }
  
  public onChangeTab(): void {

  }
}
