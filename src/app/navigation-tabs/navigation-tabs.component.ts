import { Component, OnInit } from "@angular/core";
import { NtJwtLoginService, UtenteUtilities } from "@bds/nt-jwt-login";
import { MenuItem } from "primeng/api";
import { Subscription } from "rxjs";
import { DocsListMode } from "../docs-list/docs-list-constants";
import { DOCS_LIST_ROUTE } from "src/environments/app-constants";
import { ActivatedRoute, Router } from "@angular/router";
import { CODICI_RUOLO } from "@bds/ng-internauta-model";

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

          this.items = [
            {
              label: "Nuovo", 
              icon: "pi pi-fw pi-plus", 
              routerLink: ["./"]
            },
            {
              label: "Tutti documenti", 
              icon: "pi pi-fw pi-list", 
              routerLink: ["./" + DOCS_LIST_ROUTE], 
              queryParams: {"mode": DocsListMode.ELENCO_DOCUMENTI}
            }
          ];

          if (this.isSegretario) {
            this.items.push({
                label: "Firmario", 
                title: "Le proposte in scrivania dei responsabili",
                icon: "pi pi-fw pi-user-edit", 
                routerLink: ["./" + DOCS_LIST_ROUTE], 
                queryParams: {"mode": DocsListMode.IFIRMARIO}
            });
            this.items.push({
              label: "Firmato", 
              title: "Registrati dai responsabili",
              icon: "pi pi-fw pi-user-edit", 
              routerLink: ["./" + DOCS_LIST_ROUTE], 
              queryParams: {"mode": DocsListMode.IFIRMATO}
            });
          }

          if (this.utenteUtilitiesLogin.hasRole(CODICI_RUOLO.SD)
              || this.utenteUtilitiesLogin.hasRole(CODICI_RUOLO.OS)
              || this.utenteUtilitiesLogin.hasRole(CODICI_RUOLO.MOS)) {
            this.items.push({
              label: "Registrazioni", 
              icon: "pi pi-fw pi-list", 
              routerLink: ["./" + DOCS_LIST_ROUTE], 
              queryParams: {"mode": DocsListMode.REGISTRAZIONI}
            });
          }

          this.items.push({
            label: "Ricerca avazata", 
            icon: "pi pi-fw pi-search", 
            routerLink: ["./"]
          });
          const docsListMode = this.route.snapshot.queryParamMap.get('mode') as DocsListMode;
          if (docsListMode) {
            this.activeItem = this.items.find(i => i.queryParams && i.queryParams.mode === docsListMode);
          } 
          if (!!!this.activeItem) { // Metto questo if e non else rispetto al primo if perché così becco anche casi in cui l'utente ha nell'url qualcosa di strano
            this.activeItem = this.items[1];
            this.router.navigate([DOCS_LIST_ROUTE], { relativeTo: this.route, queryParams: {"mode": DocsListMode.ELENCO_DOCUMENTI} });
          }
        }
      )
    );
  }
}
