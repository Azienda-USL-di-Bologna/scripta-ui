import { AfterViewInit, Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { ActivatedRoute, ParamMap, Router } from "@angular/router";
import { Doc, ENTITIES_STRUCTURE, Persona, Allegato, CODICI_REGISTRO, TipologiaDoc, DocDetailView } from "@bds/internauta-model";
import { LOCAL_IT } from "@bds/common-tools";
import { JwtLoginService, UtenteUtilities } from "@bds/jwt-login";
import { AdditionalDataDefinition } from "@bds/next-sdr";
import { MessageService } from "primeng/api";
import { Observable, Subscription } from "rxjs";
import { switchMap } from "rxjs/operators";
import { AppService } from "../app.service";
import { ExtendedDocService } from "./extended-doc.service";
import { ExtendedDocDetailView } from "../docs-list-container/docs-list/extended-doc-detail-view";
import { AttachmentsBoxConfig } from "@bds/common-components";
import { formatDate } from '@angular/common';
import { DocVisualizerService } from "./doc-visualizer.service";
import { NotaDoc, TipoNotaDoc } from "@bds/internauta-model/lib/entities/scripta/NodaDoc";

@Component({
  selector: "doc",
  templateUrl: "./doc.component.html",
  styleUrls: ["./doc.component.scss"]
})
export class DocComponent implements OnInit, OnDestroy, AfterViewInit {
  public inProtocollazione: boolean = false;
  public blockedDocument: boolean = false;
  private subscriptions: Subscription[] = [];
  private savingTimeout: ReturnType<typeof setTimeout> | undefined;
  public localIt = LOCAL_IT;
  @ViewChild("pageStart") public pageStart: any;
  private _doc: Doc;
  public get doc(): Doc {
    return this._doc;
  }
  public set doc(value: Doc) {
    this._doc = value;
    console.log("setto doc a ", this.doc);

  }

  public descrizioneUtenteRegistrante: string | undefined;
  public utenteUtilitiesLogin: UtenteUtilities;
  public DatiProtocolloEsterno: Number;
  public dataProtocolloEsterno: Date;
  public numeroVisualizzazione: string;
  private projection: string = ENTITIES_STRUCTURE.scripta.doc.customProjections.DocWithAll;
  public yearOfProposta: string;
  public detailDoc: ExtendedDocDetailView;
  public tipoDocumento: TipologiaDoc;
  public visualizzazioneDocumento: string;
  public attachmentsBoxConfig: AttachmentsBoxConfig;
  public dataRegistrazione: string;
  public dataUltimoVersamento: string;
  public visibilitaLimitata: boolean;
  public riservato: boolean;
  public annullato: boolean;
  public protocollatoDaLabel: string;
  public descrizioneStrutturaAdottante: string;
  public docVisualizer: DocVisualizerService;
  public pregresso: boolean = false;
  public dataCreazione: string;
  public registroLabel: string = 'Proposta numero';
  public notaDocumentoString: string = 'Nessuna nota';
  public notaAnnullamentoString: string = 'Nessuna nota';

  @Input() set data(data: any) {
    this.detailDoc = data.doc;
    this._doc = data.doc;
    this.doc = this._doc;
    this.pregresso = this._doc.pregresso
    this.visualizzazioneDocumento = this.detailDoc._registrazioneVisualizzazione;
    this.dataCreazione = formatDate(this.doc.dataCreazione, 'dd/MM/yyyy', 'en_US');
  }

  constructor(
    private router: Router,
    private extendedDocService: ExtendedDocService,
    private loginService: JwtLoginService,
    private messageService: MessageService,
    private route: ActivatedRoute,
    private appService: AppService) {
      this.attachmentsBoxConfig = new AttachmentsBoxConfig();
      this.attachmentsBoxConfig.showPreview = true;
      this.attachmentsBoxConfig.showInfoVersamento = false;
      this.attachmentsBoxConfig.showHeader = false;
    }

  ngOnInit(): void {
    console.log("entro nell'oninit");
    this.subscriptions.push(
      this.loginService.loggedUser$.subscribe(
        (utenteUtilities: UtenteUtilities) => {
          if (utenteUtilities) {
            this.utenteUtilitiesLogin = utenteUtilities;
            this.descrizioneUtenteRegistrante = utenteUtilities.getUtente().idPersona.descrizione;
             /**
             * Questa sottoscrizione serve a popolare this.doc
             */
             if (this.pregresso) {
              this.setFreezeDocumento(true);
              this.subscriptions.push(
                this.loadDocument(this.detailDoc.id).subscribe((res: Doc) => {
                  this.setLabelProtocollatoDa();
                  this.setFreezeDocumento(false);
                  this.doc = res;
                  this.docVisualizer = new DocVisualizerService(this.doc);
                  this.notaDocumentoString = this.doc?.notaDocumento[0]?.testo;
                  this.notaAnnullamentoString = this.doc?.notaAnnullamento[0]?.testo;
                  console.log("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa");
                  console.log(this.docVisualizer);
                  console.log("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa");

                  this.yearOfProposta = this.doc.dataCreazione.getFullYear().toString();
                  this.tipoDocumento = this.doc.tipologia;
                  if (this.detailDoc.dataUltimoVersamento != null ) {
                    this.dataUltimoVersamento = formatDate(this.detailDoc.dataUltimoVersamento, 'dd/MM/yyyy', 'en_US');
                    } else {
                      this.dataUltimoVersamento = null;
                    }
                    const registroDoc = this.doc.registroDocList.find(registro => registro.idRegistro.attivo === true &&  registro.idRegistro.ufficiale === true);
                    if (registroDoc.dataRegistrazione != null) {
                    this.dataRegistrazione = formatDate(registroDoc.dataRegistrazione, 'dd/MM/yyyy', 'en_US');
                    } else {
                      this.dataRegistrazione = null;
                    }
                    this.visibilitaLimitata = this.detailDoc.visibilitaLimitata;
                    this.riservato = this.detailDoc.riservato;
                    
                    this.annullato = this.detailDoc.annullato;

              })
              );

            } else {
              this.subscriptions.push( 
                this.route.queryParamMap.pipe(
                  switchMap((params: ParamMap) =>
                    this.handleCommand(params)
                )).subscribe((res: Doc) => {
                  this.setFreezeDocumento(false);
                  console.log("res", res); 
                  this.doc = res;
                  this.docVisualizer = new DocVisualizerService(this.doc);
                  if (this.doc.registroDocList && this.doc.registroDocList.filter(rd => rd.idRegistro.ufficiale).length > 0) {
                    console.log("RegistriDoc: ",this.doc.registroDocList);
                    debugger;
                    this.numeroVisualizzazione = this.doc.registroDocList.filter(rd => rd.idRegistro.ufficiale)[0].numeroVisualizzazione;
                  }
                  this.yearOfProposta = this.doc.dataCreazione.getFullYear().toString();
                  this.appService.appNameSelection("PEIS - " + this.doc.idAzienda.descrizione);
                  this.router.navigate(
                    [],
                    {
                      relativeTo: this.route,
                      queryParams: { command: "OPEN", id: this.doc.id }
                    });
                  },  error => {
                  this.setFreezeDocumento(false);
                  console.log("errore", error);
                  
                  this.messageService.add({
                    severity: "error",
                    summary: "Creazione proposta",
                    detail: "Errore nell'avviare la proposta di protocollazione. Contattare Babelcare"
                  });
                })
              );
            }
          }
        }
      )
    );

   


  }

  ngAfterViewInit() {

  }

  public removeZoneFromTime(date: string | undefined): string | null {
    if (date) {
      return date.replace(/\[\w+\/\w+\]$/, "");
    }
    return null;
  }

/**
 * Gestisce le due diverse richieste da url:
 * 'NEW' documento (proviene dalla protocollazione da pec) ----> viene passato come parametro l'idMessage e viene usato come additionalData
 * 'OPEN' documento ( apre un documento già esistente con l'id)
 */
  private handleCommand(params: ParamMap): Observable<Doc> {
    const command = params.get("command");
    this.setFreezeDocumento(true);
    let res: Observable<Doc>;
    switch (command) {
      case "NEW":
        const doc: Doc = new Doc();
        doc.idPersonaCreazione = {id: this.utenteUtilitiesLogin.getUtente().idPersona.id} as Persona;
        if (params.get("idMessage") && params.get("azienda")) {
          const idMessage: string = params.get("idMessage");
          const codiceAzienda: string = params.get("azienda");
          const additionalDataOperationRequested: AdditionalDataDefinition = new AdditionalDataDefinition("OperationRequested", "CreateDocPerMessageRegistration");
          const additionalDataIdMessage: AdditionalDataDefinition = new AdditionalDataDefinition("idMessage", idMessage);
          const additionalDataCodiceAzienda: AdditionalDataDefinition = new AdditionalDataDefinition("codiceAzienda", codiceAzienda);
          res = this.extendedDocService.postHttpCall(doc, this.projection, [additionalDataOperationRequested, additionalDataIdMessage, additionalDataCodiceAzienda]);
        } else {
          res = this.extendedDocService.postHttpCall(doc, this.projection);
        }
      break;
      case "OPEN":
        res = this.loadDocument(+params.get("id"));
    }
    return res;
  }

  private setLabelProtocollatoDa() {
    if(this._doc.tipologia === TipologiaDoc.PROTOCOLLO_IN_ENTRATA || this._doc.tipologia === TipologiaDoc.PROTOCOLLO_IN_USCITA) {
      this.registroLabel = "Protocollo numero";
      this.protocollatoDaLabel = "Protocollato Da";
    } else if (this._doc.tipologia === TipologiaDoc.DELIBERA ) {
      this.registroLabel = "Delibera numero";
      this.protocollatoDaLabel = "Adottata da";
      this.descrizioneStrutturaAdottante = this.detailDoc.idStrutturaRegistrazione ? this.detailDoc.idStrutturaRegistrazione.nome + " [ " + this.detailDoc.idStrutturaRegistrazione.codice + " ]" : "";
    } else if (this._doc.tipologia === TipologiaDoc.DETERMINA) {
      this.registroLabel = "Determina numero";
      this.protocollatoDaLabel = "Proposta da";
      this.descrizioneStrutturaAdottante = this.detailDoc.idStrutturaRegistrazione ? this.detailDoc.idStrutturaRegistrazione.nome + " [ " + this.detailDoc.idStrutturaRegistrazione.codice + " ]" : "";
    }
  }

  /**
   * Crea e torna l'observable per il caricamento del Doc tramite il suo id.
   * @param id
   * @returns
   */
  private loadDocument(id: number): Observable<Doc> {
    return this.extendedDocService.getByIdHttpCall(
      id,
      this.projection);
  }

  /**
   * Parte un timeout al termine del quale viene salvato il campo della firma specificato
   * @param doc
   * @param field
   */
  public timeOutAndSaveDoc(doc: Doc, field: keyof Doc) {
    console.log("timeOutAndSaveDoc");
    if (this.savingTimeout) {
      clearTimeout(this.savingTimeout);
    }
    this.savingTimeout = setTimeout(() => {
      this.subscriptions.push(this.extendedDocService.updateDoc(doc, [field], this.projection).subscribe(res => this.doc.version = res.version));
    }, 300);
  }


  public saveDoc(doc: any, field: keyof Doc): void {

    this.subscriptions.push(this.extendedDocService.updateDoc(doc, [field], this.projection).subscribe(res => {
     this.doc.mittenti = res.mittenti;
     this.doc.version = res.version;
    }
  ));
  }

  public onDoProtocolla(event: any): void {
    console.log("Emittend event", event);
    /* this.docService.protocollaIn(event).then(res => {
      console.log('Res di onProtocolla', res);
      const d: Doc = res;
      const registrazione = d.registriList[0];
      const messageHeader = 'Registrazione ' +  registrazione.idRegistro.nomeRegistro + ' ' + registrazione.numero;
      this.messageService.showMessageSuccessfulMessage(messageHeader, 'Registrazione avvenuta con successo');
    }); */
  }

  public clearMessages(): void {
    this.messageService.clear();
  }

  onShow(event: Event) {
    debugger;

  }

  private hasAllegatoPrincipale(): boolean {
    console.log("hasPrincipale", this.doc.allegati);
    let hasPrincipale = false;
    this.doc.allegati.forEach(allegato => {
      if (allegato.principale)
        hasPrincipale = true;
    })
    console.log("has principale returns",  hasPrincipale);
    return hasPrincipale;
  }

  private hasMittente(): boolean {
    console.log("hasMittente", this.doc.mittenti);
    return this.doc.mittenti && this.doc.mittenti.length > 0;
  }

  private hasOggetto(): boolean {
    console.log("hasOggetto", this.doc.oggetto);
    return this.doc.oggetto && this.doc.oggetto !== "";
  }

  private hasCompetente(): boolean {
    console.log("hasCompetente", this.doc.competenti);
    return this.doc.competenti && this.doc.competenti.length > 0;
  }

  public possoProtocollare(): boolean {
    if (this.hasOggetto() && this.hasMittente() && this.hasCompetente() && this.hasAllegatoPrincipale())
      return true;
    else
      return false;
  }


  private addWarnMessage(messaggio: string) {
    this.messageService.add({
      severity: "warn",
      summary: "Documento",
      detail: messaggio
    });
  }

  private manageMessageNonPossoProtocollare() {
    if (!this.hasOggetto()) {
      this.addWarnMessage("Non puoi protocollare perché manca l'oggetto");
    }
    if (!this.hasMittente()) {
      this.addWarnMessage("Non puoi protocollare perché manca il mittente");
    }
    if (!this.hasCompetente()) {
      this.addWarnMessage("Non puoi protocollare perché manca il destinatario competente");
    }
    if (!this.hasAllegatoPrincipale()) {
      this.addWarnMessage("Non puoi protocollare perché manca l'allegato principale");
    }
  }

  private setFreezeDocumento(val: boolean) {
      this.inProtocollazione = val;
      this.blockedDocument = val;
  }

  public doButtonSave(): void {
    this.appService.appNameSelection("PEIS - " + this.doc.idAzienda.descrizione);
    this.messageService.add({
      severity: "success",
      summary: "Documento",
      detail: "Documento salvato con successo"
    });
    console.log("nothing");
  }

  /**
   * Prima controlla se è possibile protocollare poi se si,
   * Effettua la chiamata al backend che avvia la protocollazione.
   * In caso di successo viene ricaricato il documento.
   */
  public doButtonProtocolla(): void {
    console.log("CAN PROTOCOL", this.possoProtocollare());
    if (!this.possoProtocollare()) {
      this.manageMessageNonPossoProtocollare();
    } else {
      this.setFreezeDocumento(true);
      this.extendedDocService.protocollaDoc(this.doc).subscribe(res => {
        console.log("RES", res);
       /*  setTimeout(() => { */
          this.loadDocument(this.doc.id).subscribe((res: Doc) => {
            this.setFreezeDocumento(false);
            console.log("res", res);
            this.doc = res;
            debugger;
            this.numeroVisualizzazione = this.doc.registroDocList.filter(rd => rd.idRegistro.ufficiale)[0].numeroVisualizzazione;
            this.messageService.add({
              severity: "success",
              summary: "Documento",
              detail: "Documento protocollato con successo: numero protocollo generato " + this.numeroVisualizzazione
            });
          });
          /* }, 10000); */
      }, err => {
        this.setFreezeDocumento(false);
        console.log("ERRR", err);

        this.messageService.add({
          severity: "error",
          summary: "Documento",
          detail: "Errore nel protocollare il documento"
        });
      });
    }
  }

  public ngOnDestroy() {
    if (this.subscriptions) {
      this.subscriptions.forEach(
        s => s.unsubscribe()
      );
    }
    this.subscriptions = [];
  }
}
