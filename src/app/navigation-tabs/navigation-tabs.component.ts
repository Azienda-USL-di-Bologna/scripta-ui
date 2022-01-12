import { Component, OnInit } from "@angular/core";
import { NtJwtLoginService, UtenteUtilities } from "@bds/nt-jwt-login";
import { MenuItem } from "primeng/api";
import { Subscription } from "rxjs";
import { DocsListMode } from "../docs-list/docs-list-constants";
import { DOCS_LIST_ROUTE, FASCICOLI_ROUTE } from "src/environments/app-constants";
import { ActivatedRoute, Router } from "@angular/router";
import { CODICI_RUOLO } from "@bds/ng-internauta-model";
import { NavViews } from "./navigation-tabs-contants";

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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private loginService: NtJwtLoginService,
  ) { }

  ngOnInit(): void {
    this.subscriptions.push(
      this.loginService.loggedUser$.subscribe(
        (utenteUtilities: UtenteUtilities) => {
          this.utenteUtilitiesLogin = utenteUtilities;
          this.isSegretario = this.utenteUtilitiesLogin.getUtente().struttureDelSegretario && this.utenteUtilitiesLogin.getUtente().struttureDelSegretario.length > 0;
//TODO: SPOSTARE FascicoliListMode NEL COMPONENTE APPOSITO APPENA SI CREA
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
              }
            }
          ];         

          /* this.items.push({
            label: "Ricerca avazata", 
            icon: "pi pi-fw pi-search", 
            routerLink: ["./"]
          }); */
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

          /* if (docsListMode) {
            this.activeItem = this.items.find(i => i.queryParams && i.queryParams.mode === docsListMode);
          } 
          if (!!!this.activeItem) { // Metto questo if e non else rispetto al primo if perché così becco anche casi in cui l'utente ha nell'url qualcosa di strano
            this.activeItem = this.items[1];
            this.router.navigate([DOCS_LIST_ROUTE], { relativeTo: this.route, queryParams: {"mode": DocsListMode.ELENCO_DOCUMENTI} });
          } */
        }
      )
    );
  }
}

export enum FascicoliListMode{
    NUOVO = "NUOVO",
    ELENCO_FASCICOLI = "ELENCO_FASCICOLI"
}
