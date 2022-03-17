import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { Menu } from 'primeng/menu';
import { NtJwtLoginService, UtenteUtilities } from '@bds/nt-jwt-login';
import { Subscription } from 'rxjs';
import { CaptionArchiviComponent } from './caption-archivi.component';
import { CaptionConfiguration } from './caption-configuration';
import { CaptionReferenceTableComponent } from './caption-reference-table.component';
import { CaptionSelectButtonsComponent } from './caption-select-buttons.component';
import { MenuItem } from 'primeng/api';
import { Azienda, AziendaService } from '@bds/ng-internauta-model';

@Component({
  selector: 'generic-caption-table',
  templateUrl: './generic-caption-table.component.html',
  styleUrls: ['./generic-caption-table.component.scss']
})
export class GenericCaptionTableComponent implements OnInit {

  @Input() configuration: CaptionConfiguration;
  @Input() referenceTableComponent: CaptionReferenceTableComponent;
  @Input() selectButtonsComponent: CaptionSelectButtonsComponent;
  @Input() archiviComponent: CaptionArchiviComponent;

  @ViewChild("aziendaSelection", {}) public aziendaSelection: Menu;

  public accessibile: boolean = false;

  private subscriptions: Subscription[] = [];
  private utenteUtilitiesLogin: UtenteUtilities;
  public aziendeMenuItems: MenuItem[];

  constructor(private loginService: NtJwtLoginService,) { }

  ngOnInit(): void {
    this.subscriptions.push(
      this.loginService.loggedUser$.subscribe(
        (utenteUtilities: UtenteUtilities) => {
          this.utenteUtilitiesLogin = utenteUtilities;
          this.accessibile = this.utenteUtilitiesLogin.getUtente().idPersona.accessibilita;
        }
      )
    );
  }

  public addArchivioClicked(){
    // apro il menu
    // this.utenteUtilitiesLogin.getAziendeWithPermission(FluxPermission.)
    const codiciAziende = this.utenteUtilitiesLogin.getUtente().aziende as Azienda[];
    this.aziendeMenuItems = [];
    codiciAziende.forEach(codiceAzienda => {
      // const azienda = this.loggedUser.getUtente().aziende.find(a => a.codice === codiceAzienda);
      this.aziendeMenuItems.push(
        {
          label: codiceAzienda.nome,
          disabled: false,
          command: () => this.archiviComponent.newArchivio(codiceAzienda.id)
        }
      );
    });
  }

}
