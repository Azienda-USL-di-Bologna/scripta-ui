import { Component, OnInit } from "@angular/core";
import { NtJwtLoginService, UtenteUtilities } from "@bds/nt-jwt-login";
import { MenuItem } from "primeng/api";
import { Subscription } from "rxjs";
import { DocsListMode } from "../docs-list/docs-list-constants";
import { DOCS_LIST_ROUTE, FASCICOLI_ROUTE } from "src/environments/app-constants";
import { ActivatedRoute, Router } from "@angular/router";
import { CODICI_RUOLO, ConfigurazioneService, ParametroAziende } from "@bds/ng-internauta-model";
import { NavViews } from "./navigation-tabs-contants";
import { connectableObservableDescriptor } from "rxjs/internal/observable/ConnectableObservable";

@Component({
  selector: "navigation-tabs",
  templateUrl: "./navigation-tabs.component.html",
  styleUrls: ["./navigation-tabs.component.scss"]
})
export class NavigationTabsComponent implements OnInit {
  private subscriptions: Subscription[] = [];
  private utenteUtilitiesLogin: UtenteUtilities;

  public isSegretario: boolean = false;
  public activeItem: MenuItem;
  public items: MenuItem[];
  public showTabFascicoli: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private loginService: NtJwtLoginService,
    private configurazioneService: ConfigurazioneService
  ) { }

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
            this.showTabFascicoli = JSON.parse(parametriAziende[0].valore || false);
            console.log("showFASCIOLI: ",this.showTabFascicoli);
            this.isSegretario = this.utenteUtilitiesLogin.getUtente().struttureDelSegretario && this.utenteUtilitiesLogin.getUtente().struttureDelSegretario.length > 0;
            this.items = [
              /* {
                label: "Nuovo", 
                icon: "pi pi-fw pi-plus", 
                routerLink: ["./"]
              }, */
              {
                label: "Documenti", 
                icon: "pi pi-fw pi-list", 
                routerLink: ["./" + DOCS_LIST_ROUTE], 
                queryParams: {
                  // "view": NavViews.DOCUMENTI,
                  "mode": DocsListMode.MIEI_DOCUMENTI
                }
              },
              {
                label: "Fascicoli", 
                icon: "pi pi-fw pi-list", 
                routerLink: ["./" + FASCICOLI_ROUTE], 
                queryParams: {
                  // "view": NavViews.FASCICOLI,
                  "mode": FascicoliListMode.ELENCO_FASCICOLI
                },
                visible: this.showTabFascicoli
              }
            ];
            const navView = this.route.snapshot.queryParamMap.get('view') as NavViews || NavViews.DOCUMENTI;
          
            switch (navView) {
              case NavViews.FASCICOLI:
                this.activeItem = this.items.find(i => i.label === "Fascicoli");
                this.router.navigate([FASCICOLI_ROUTE], { relativeTo: this.route});
                break;
              case NavViews.DOCUMENTI:
              default:
                this.activeItem = this.items.find(i => i.label === "Documenti");
                this.router.navigate([DOCS_LIST_ROUTE], { relativeTo: this.route});
                break;
            }
          });        
        }
      )
    );
  }
}
//TODO: SPOSTARE FascicoliListMode NEL COMPONENTE APPOSITO APPENA SI CREA
export enum FascicoliListMode{
    NUOVO = "NUOVO",
    ELENCO_FASCICOLI = "ELENCO_FASCICOLI"
}
