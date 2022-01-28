import { Component, OnInit } from "@angular/core";
import { NtJwtLoginService, UtenteUtilities } from "@bds/nt-jwt-login";
import { MenuItem } from "primeng/api";
import { Subscription } from "rxjs";
import { DocsListMode } from "../docs-list/docs-list-constants";
import { DOCS_LIST_ROUTE, ARCHIVI_LIST_ROUTE } from "src/environments/app-constants";
import { ActivatedRoute, Router } from "@angular/router";
import { CODICI_RUOLO, ConfigurazioneService, ParametroAziende } from "@bds/ng-internauta-model";
import { NavViews } from "./navigation-tabs-contants";
import { connectableObservableDescriptor } from "rxjs/internal/observable/ConnectableObservable";
import { ArchiviListMode } from "../archivi-list/archivi-list-constants";

@Component({
  selector: "navigation-tabs",
  templateUrl: "./navigation-tabs.component.html",
  styleUrls: ["./navigation-tabs.component.scss"]
})
export class NavigationTabsComponent implements OnInit {
  private subscriptions: Subscription[] = [];
  private utenteUtilitiesLogin: UtenteUtilities;

  public activeItem: MenuItem;
  public items: MenuItem[];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private loginService: NtJwtLoginService,
    private configurazioneService: ConfigurazioneService
  ) {
    this.items = [
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
      }
    ];
    const navView = this.route.snapshot.queryParamMap?.get('view') as NavViews || NavViews.DOCUMENTI ;
    switch (navView) {
      case NavViews.FASCICOLI:
        this.activeItem = this.items.find(i => i.label === "Fascicoli");
        this.router.navigate([ARCHIVI_LIST_ROUTE], { relativeTo: this.route});
        break;
      case NavViews.DOCUMENTI:
      default:
        this.activeItem = this.items.find(i => i.label === "Documenti");
        this.router.navigate([DOCS_LIST_ROUTE], { relativeTo: this.route});
        break;
    }
  }

  ngOnInit(): void {
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
              this.items[1].visible = true;
              this.items = [...this.items];
            } else {
              const navView = this.route.snapshot.queryParamMap?.get('view') as NavViews || NavViews.DOCUMENTI ;
              if (navView === NavViews.FASCICOLI) {
                this.activeItem = this.items.find(i => i.label === "Documenti");
                this.router.navigate([DOCS_LIST_ROUTE], { relativeTo: this.route});
              }
            }
          });        
        }
      )
    );
  }
}