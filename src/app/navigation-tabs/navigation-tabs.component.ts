import { Component, OnInit } from "@angular/core";
import { NtJwtLoginService, UtenteUtilities } from "@bds/nt-jwt-login";
import { MenuItem } from "primeng/api";
import { Subscription } from "rxjs";
import { DocsListMode } from "../docs-list/docs-list-constants";
import { DOCS_LIST_ROUTE } from "src/environments/app-constants";
import { ActivatedRoute, Router } from "@angular/router";

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
          if (this.isSegretario) {
            this.items = [
              {
                label: "Nuovo", 
                icon: "pi pi-fw pi-plus", 
                routerLink: ["./"]
              },
              {
                label: "Elenco documenti", 
                icon: "pi pi-fw pi-list", 
                routerLink: ["./" + DOCS_LIST_ROUTE], 
                queryParams: {"mode": DocsListMode.ELENCO_DOCUMENTI}
              },
              {
                label: "IFirmario", 
                icon: "pi pi-fw pi-user-edit", 
                routerLink: ["./" + DOCS_LIST_ROUTE], 
                queryParams: {"mode": DocsListMode.IFIRMARIO}
              },
              {
                label: "IFirmato", 
                icon: "pi pi-fw pi-user-edit", 
                routerLink: ["./" + DOCS_LIST_ROUTE], 
                queryParams: {"mode": DocsListMode.IFIRMATO}
              },
              {
                label: "Registrazioni", 
                icon: "pi pi-fw pi-list", 
                routerLink: ["./" + DOCS_LIST_ROUTE], 
                queryParams: {"mode": DocsListMode.REGISTRAZIONI}
              },
            ];
          } else {
            this.items = [
              {
                label: "Nuovo", 
                icon: "pi pi-fw pi-plus", 
                routerLink: ["./"]
              },
              {
                label: "Elenco documenti", 
                icon: "pi pi-fw pi-list", 
                routerLink: ["./" + DOCS_LIST_ROUTE], 
                queryParams: {"mode": DocsListMode.ELENCO_DOCUMENTI}
              },
              {
                label: "Registrazioni", 
                icon: "pi pi-fw pi-list", 
                routerLink: ["./" + DOCS_LIST_ROUTE], 
                queryParams: {"mode": DocsListMode.REGISTRAZIONI}
              },
            ];
          }
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
