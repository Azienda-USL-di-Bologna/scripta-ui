import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ExtendedDocDetailView } from '../docs-list/extended-doc-detail-view';
import { AttachmentsBoxConfig } from '@bds/common-components';
import { JwtLoginService, UtenteUtilities } from '@bds/jwt-login';
import { first, Subscription } from 'rxjs';
import { DocDetail, Persona, PersonaVedenteService, TipologiaDoc, Utente } from '@bds/internauta-model';
import { NavigationTabsService } from 'src/app/navigation-tabs/navigation-tabs.service';
import { AppService } from 'src/app/app.service';
import { MessageService } from 'primeng/api';
import { DocUtilsService } from 'src/app/utilities/doc-utils.service';
//import { disableDebugTools } from '@angular/platform-browser';


@Component({
  selector: 'doc-detail-and-preview',
  templateUrl: './doc-detail-and-preview.component.html',
  styleUrls: ['./doc-detail-and-preview.component.scss']
})
export class DocDetailAndPreviewComponent implements OnInit {
  public accordionSelected: boolean[] = [true, false];
  public isResponsabileVersamento: boolean = false;
  private subscriptions: Subscription[] = [];
  private utenteUtilitiesLogin: UtenteUtilities;
  private idPersona: Persona;
  public utente: Utente;
  public hasPienaVisibilita: boolean = false;


  @Output('closeRightPanel') closeRightPanel = new EventEmitter();
  _doc: ExtendedDocDetailView;

  get doc(): ExtendedDocDetailView {
    return this._doc;
  }
  @Input() set doc(doc: ExtendedDocDetailView) {
    this._doc = doc;
  }
  public attachmentsBoxConfig: AttachmentsBoxConfig;

  constructor(
    private loginService: JwtLoginService,
    private navigationTabsService: NavigationTabsService,
    private appService: AppService,
    private messageService: MessageService,
    private personaVedenteService: PersonaVedenteService,
    private docUtilsService: DocUtilsService,
  ) {
    this.attachmentsBoxConfig = new AttachmentsBoxConfig();
    this.attachmentsBoxConfig.showPreview = true;
    this.attachmentsBoxConfig.showInfoVersamento = false;
    this.attachmentsBoxConfig.showHeader = false;
  }

  ngOnInit(): void {
    this.subscriptions.push(
      this.loginService.loggedUser$.pipe(first()).subscribe(
        (utenteUtilities: UtenteUtilities) => {
          if (utenteUtilities) {
            this.utenteUtilitiesLogin = utenteUtilities;
            this.isResponsabileVersamento = this.utenteUtilitiesLogin.isRV();
            this.utente = this.utenteUtilitiesLogin.getUtente();
            this.idPersona = this.utente.idPersona;

          }
        }
      )
    );
  }

  public closePanel() {
    this.closeRightPanel.emit({
      showPanel: false,
      rowSelected: null
    });
  }
  

  public hasUserPienaVisibilita(doc: DocDetail): boolean {
    if (doc.personeVedentiList.find(pv => pv.idPersona.id === this.utenteUtilitiesLogin.getUtente().idPersona.id).pienaVisibilita) {
      this.hasPienaVisibilita = true;
    }
    return this.hasPienaVisibilita;
  }

}
