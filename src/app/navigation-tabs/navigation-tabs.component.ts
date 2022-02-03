import { Component, OnInit } from "@angular/core";
import { NtJwtLoginService, UtenteUtilities } from "@bds/nt-jwt-login";
import { Subscription } from "rxjs";
import { ConfigurazioneService, ParametroAziende } from "@bds/ng-internauta-model";
import { NavigationTabsService } from "./navigation-tabs.service";
import { TabItem } from "./tab-item";

@Component({
  selector: "navigation-tabs",
  templateUrl: "./navigation-tabs.component.html",
  styleUrls: ["./navigation-tabs.component.scss"]
})
export class NavigationTabsComponent implements OnInit {
  private subscriptions: Subscription[] = [];
  private utenteUtilitiesLogin: UtenteUtilities;

  public tabItems: TabItem[] = [];

  constructor(
    private loginService: NtJwtLoginService,
    private configurazioneService: ConfigurazioneService,
    public navigationTabsService: NavigationTabsService
  ) {
  }

  ngOnInit(): void {
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
                this.navigationTabsService.addTab(
                  this.navigationTabsService.buildaTabArchiviList()
                );
              }
              this.setTabsAndActiveOneOfThem();
            });     
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
  }
  
  public onChangeTab(): void {

  }

  public onCloseTab(e: any): void {
    this.navigationTabsService.removeTab(e.index);
  }
}
