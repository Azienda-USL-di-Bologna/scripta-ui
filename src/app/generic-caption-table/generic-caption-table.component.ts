import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { Menu } from 'primeng/menu';
import { JwtLoginService, UtenteUtilities } from '@bds/jwt-login';
import { Subscription } from 'rxjs';
import { CaptionFunctionalOperationsComponent } from './caption-functional-operations.component';
import { CaptionConfiguration } from './caption-configuration';
import { CaptionReferenceTableComponent } from './caption-reference-table.component';
import { CaptionSelectButtonsComponent } from './caption-select-buttons.component';
import { MenuItem } from 'primeng/api';
import { Archivio, Azienda, AziendaService, PermessoEntitaStoredProcedure } from '@bds/internauta-model';
import { CODICI_RUOLO } from '@bds/internauta-model';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { NavigationTabsService } from '../navigation-tabs/navigation-tabs.service';
import { TipComponent } from '@bds/common-components';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';

@Component({
  selector: 'generic-caption-table',
  templateUrl: './generic-caption-table.component.html',
  styleUrls: ['./generic-caption-table.component.scss']
})
export class GenericCaptionTableComponent implements OnInit {

  @Input() configuration: CaptionConfiguration;
  @Input() referenceTableComponent: CaptionReferenceTableComponent;
  @Input() selectButtonsComponent: CaptionSelectButtonsComponent;
  @Input() functionalOperationsComponent: CaptionFunctionalOperationsComponent;

  @ViewChild("aziendaSelection", {}) public aziendaSelection: Menu;

  public accessibile: boolean = false;
  public multiple: boolean = false;
  public maxSizeUpload: Number = 50000000;
  public ref: DynamicDialogRef;
  public canUseTip: boolean = false;
  public canCreateArchivio: boolean = false;
  private subscriptions: Subscription[] = [];
  private utenteUtilitiesLogin: UtenteUtilities;

  constructor(private loginService: JwtLoginService, public dialogService: DialogService, public navigationTabsService: NavigationTabsService,) { }



  ngOnInit(): void {
    this.subscriptions.push(
      this.loginService.loggedUser$.subscribe(
        (utenteUtilities: UtenteUtilities) => {
          if (utenteUtilities) {
            this.utenteUtilitiesLogin = utenteUtilities;
            this.accessibile = this.utenteUtilitiesLogin.getUtente().idPersona.accessibilita;
            this.canUseTip = (this.utenteUtilitiesLogin.hasRole(CODICI_RUOLO.CA) ||
            this.utenteUtilitiesLogin.hasRole(CODICI_RUOLO.CI) ||
            this.utenteUtilitiesLogin.hasRole(CODICI_RUOLO.SD));
            const tempMap : Map<String, PermessoEntitaStoredProcedure[]> = new Map(Object.entries(this.utenteUtilitiesLogin.getUtente().permessiGediByCodiceAzienda));
            this.utenteUtilitiesLogin.getUtente().aziendeAttive.forEach(a => {
              if(tempMap.has(a.codice)) {
                if(tempMap.get(a.codice)) {
                  //this.canCreateArchivio = tempMap.get(a.codice);
                  const permessi : PermessoEntitaStoredProcedure[] = tempMap.get(a.codice);
                  permessi.forEach(p => {
                    p.categorie.forEach(categoria => {
                      categoria.permessi.forEach(permesso => {
                        if(permesso.predicato == "CREA") {
                          this.canCreateArchivio = true;
                          return;
                        }
                      });
                    });
                  });
                  };
                }
              });
            }
          }
        )
      );
    }

  show() {
    this.ref = this.dialogService.open(TipComponent, {
      data: {
        tabname: this.navigationTabsService.getTabs()[this.navigationTabsService.activeTabIndex].labelForAppName,
        utenteUtilitiesLogin: this.utenteUtilitiesLogin,
      },
      header: 'Tool Importazione Pregressi',
      width: '70%',
      height: '69%',
      //contentStyle: {"overflow": "auto"},
      baseZIndex: 10000
    });
  }

  isArchivioChiuso(archivio : Archivio) : boolean {
    if(archivio.stato == 'PRECHIUSO' || archivio.stato == 'CHIUSO')
      return true;
    else
      return false;
  }
}
