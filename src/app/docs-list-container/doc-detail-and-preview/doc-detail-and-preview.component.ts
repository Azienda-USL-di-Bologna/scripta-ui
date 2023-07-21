import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ExtendedDocDetailView } from '../docs-list/extended-doc-detail-view';
import { AttachmentsBoxConfig } from '@bds/common-components';
import { JwtLoginService, UtenteUtilities } from '@bds/jwt-login';
import { first, Subscription } from 'rxjs';
import { CODICI_RUOLO, DocDetail, Persona, PersonaVedenteService, TipologiaDoc, Utente } from '@bds/internauta-model';
import { NavigationTabsService } from 'src/app/navigation-tabs/navigation-tabs.service';
import { AppService } from 'src/app/app.service';
import { MessageService } from 'primeng/api';
import { DocUtilsService } from 'src/app/utilities/doc-utils.service';
import { DocsListMode } from '../docs-list/docs-list-constants';
import { ActivatedRoute } from '@angular/router';
//import { disableDebugTools } from '@angular/platform-browser';


@Component({
  selector: 'doc-detail-and-preview',
  templateUrl: './doc-detail-and-preview.component.html',
  styleUrls: ['./doc-detail-and-preview.component.scss']
})
export class DocDetailAndPreviewComponent implements OnInit {
  public isResponsabileVersamento: boolean = false;
  private subscriptions: Subscription[] = [];
  private utenteUtilitiesLogin: UtenteUtilities;
  private idPersona: Persona;
  public accordionSelected: boolean[] = [true, false];
  public utente: Utente;
  public hasPienaVisibilita: boolean = false;

  @Output('closeRightPanel') closeRightPanel = new EventEmitter();
  _doc: ExtendedDocDetailView;

  get doc(): ExtendedDocDetailView {
    return this._doc;
  }
  @Input() set doc(doc: ExtendedDocDetailView) {
    this._doc = doc;
    if (this.utenteUtilitiesLogin){
      this.accordionSelected[0] = this.accordionSelected[0] && this.canVisualizeAllegati();
    }
  }

  _docListModeSelected: DocsListMode;

  get docListModeSelected(): DocsListMode {
    return this._docListModeSelected;
  }
  @Input() set docListModeSelected(docListModeSelected: DocsListMode) {
    this._docListModeSelected = docListModeSelected;
  }
  
  _sonoPersonaVedenteSuDocSelezionato: boolean;

  get sonoPersonaVedenteSuDocSelezionato(): boolean {
    return this._sonoPersonaVedenteSuDocSelezionato;
  }
  @Input() set sonoPersonaVedenteSuDocSelezionato(sonoPersonaVedenteSuDocSelezionato: boolean) {
    this._sonoPersonaVedenteSuDocSelezionato = sonoPersonaVedenteSuDocSelezionato;
  }

  public attachmentsBoxConfig: AttachmentsBoxConfig;

  constructor(
    private loginService: JwtLoginService,
    private navigationTabsService: NavigationTabsService,
    private appService: AppService,
    private messageService: MessageService,
    private personaVedenteService: PersonaVedenteService,
    private docUtilsService: DocUtilsService,
    private route: ActivatedRoute,
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
            this.accordionSelected[0] = this.accordionSelected[0] && this.canVisualizeAllegati();
          }
        }
      )
    );
  }

  public closePanel() {
    this.closeRightPanel.emit({
      showPanel: false,
      rowSelected: null,
      sonoPersonaVedenteSuDocSelezionato: null,
    });
  }
  

  public hasUserPienaVisibilita(doc: DocDetail): boolean {
    if (doc.personeVedentiList.find(pv => pv.idPersona.id === this.utenteUtilitiesLogin.getUtente().idPersona.id).pienaVisibilita) {
      this.hasPienaVisibilita = true;
    }
    return this.hasPienaVisibilita;
  }

  public canVisualizeAllegati(): boolean {
      // controllo se si tratta di un documento con visibilità normale
      if (!this.doc.visibilitaLimitata && !this.doc.riservato){
        // controllo se siamo un attore del documento
        if (this.sonoPersonaVedenteSuDocSelezionato) {
          return true;
        // nel caso in cui si tratti di un documento con visibilità limitata controllo se abbiamo il ruolo di osservatore o di Super Demiurgo
        } else if (this.utenteUtilitiesLogin.hasRole(CODICI_RUOLO.SD) || this.utenteUtilitiesLogin.hasRole(CODICI_RUOLO.OS) || this.utenteUtilitiesLogin.hasRole(CODICI_RUOLO.MOS)){
          return true;
        }else{
          return false;
        }
      }
      // controllo se si tratta di un documento con visibilità limitata
      if (this.doc.visibilitaLimitata && !this.doc.riservato){
        // controllo se siamo un attore del documento
        if (this.sonoPersonaVedenteSuDocSelezionato) {
          return true;
        // nel caso in cui si tratti di un documento con visibilità limitata controllo se abbiamo il ruolo di osservatore o di Super Demiurgo
        } else if (this.utenteUtilitiesLogin.hasRole(CODICI_RUOLO.OS) || this.utenteUtilitiesLogin.hasRole(CODICI_RUOLO.SD)){
          return true;
        }else{
          return false;
        }
      }
      // controllo se si tratta di un documento riservato
      if (this.doc.riservato){
        // nel caso in cui si tratti di un documento riservato o sono un attore o ho il ruolo SD
        if (this.sonoPersonaVedenteSuDocSelezionato) {
          return true;
        } else if (this.utenteUtilitiesLogin.hasRole(CODICI_RUOLO.SD)){
          return true;
        } else {
          return false;
        }
      }
      return true;
  }

}
