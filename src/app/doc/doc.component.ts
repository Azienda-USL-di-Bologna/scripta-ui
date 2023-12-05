import { Component, Input, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { ActivatedRoute, ParamMap, Router } from "@angular/router";
import { Doc, ENTITIES_STRUCTURE, Persona, TipologiaDoc, RegistroDoc, VisibilitaDoc, RuoloAttoreDoc, DocDoc } from "@bds/internauta-model";
import { LOCAL_IT } from "@bds/common-tools";
import { JwtLoginService, UtenteUtilities } from "@bds/jwt-login";
import { AdditionalDataDefinition } from "@bds/next-sdr";
import { MessageService } from "primeng/api";
import { Observable, Subscription } from "rxjs";
import { switchMap } from "rxjs/operators";
import { AppService } from "../app.service";
import { ExtendedDocService } from "./extended-doc.service";
// import { ExtendedDocDetailView } from "../docs-list-container/docs-list/extended-doc-detail-view";
import { AttachmentsBoxConfig } from "@bds/common-components";
import { formatDate } from '@angular/common';
import { DocVisualizerService } from "./doc-visualizer.service";
import { NavigationTabsService } from '../navigation-tabs/navigation-tabs.service';
import { DOC_DOC_ROUTE } from "src/environments/app-constants";

@Component({
  selector: "doc",
  templateUrl: "./doc.component.html",
  styleUrls: ["./doc.component.scss"]
})
export class DocComponent implements OnInit, OnDestroy {
  public inProtocollazione: boolean = false;
  public blockedDocument: boolean = false;
  private subscriptions: Subscription[] = [];
  private savingTimeout: ReturnType<typeof setTimeout> | undefined;
  public localIt = LOCAL_IT;
  public creatoDaDescrizione: string;
  public descrizioneUtenteRegistrante: string | undefined;
  public utenteUtilitiesLogin: UtenteUtilities;
  public DatiProtocolloEsterno: Number;
  public dataProtocolloEsterno: Date;
  public numeroVisualizzazione: string;
  private projection: string = ENTITIES_STRUCTURE.scripta.doc.customProjections.DocWithAll;
  public yearOfProposta: string;
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
  private windowDocumentiCollegati: Window | null = null;
  public docsCollegati: DocDoc[];
  @ViewChild("pageStart") public pageStart: any;
  private _doc: Doc;
  public dataAnnullamento: string;
  public get doc(): Doc {
    return this._doc;
  }
  public set doc(value: Doc) {
    this._doc = value;
  }
  @Input() set data(data: any) {
    this.pregresso = data.doc.pregresso;
    if (data.doc.id) {
      this.loadDocument(data.doc.id);
    }
    

  }

  constructor(
    private router: Router,
    private extendedDocService: ExtendedDocService,
    private loginService: JwtLoginService,
    private messageService: MessageService,
    private route: ActivatedRoute,
    public navigationTabsService: NavigationTabsService,
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
             if (this.pregresso) {
              
            } else {
              //funziona solo perche lo apre il reddattore e' sbagliato quando si sistema il peis va messo bene.
              this.descrizioneUtenteRegistrante = utenteUtilities.getUtente().idPersona.descrizione;

              //Questa sottoscrizione serve a popolare this.doc
              this.subscriptions.push( 
                this.route.queryParamMap.pipe(
                  switchMap((params: ParamMap) =>
                    this.handleCommand(params)
                )).subscribe((res: Doc) => {
                  this.setFreezeDocumento(false);
                  console.log("res", res); 

                  this.doc = res;
                  this.setLabelProtocollatoDa();
                  this.loadDocument(this.doc.id);

                  this.docVisualizer = new DocVisualizerService(this.doc);
                  if (this.doc.registroDocList && this.doc.registroDocList.filter(rd => rd.idRegistro.ufficiale).length > 0) {
                    console.log("RegistriDoc: ",this.doc.registroDocList);
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
                  }
                  ,  error => {
                  // this.setFreezeDocumento(false);
                  // this.messageService.add({
                  //   severity: "error",
                  //   summary: "Creazione proposta",
                  //   detail: "Errore nell'avviare la proposta di protocollazione. Contattare Babelcare"
                  // });
                }
                )
              );
            }
          }
        }
      )
    );  
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
        doc.tipologia = TipologiaDoc.PROTOCOLLO_IN_ENTRATA;
        // const attoreDocRedattore = { idPersona: doc.idPersonaCreazione, ruolo: RuoloAttoreDoc.REDATTORE} as AttoreDoc;
        // doc.attoriList = [attoreDocRedattore];
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
        // this.creatoDaDescrizione = this.doc.attoriList.filter(a => a.ruolo === RuoloAttoreDoc.REDATTORE || a.ruolo === RuoloAttoreDoc.REDAZIONE || a.ruolo === RuoloAttoreDoc.RICEZIONE)[0]?.idPersona.descrizione;

        // const attoreDocRedattore = {idPersona: this.utenteUtilitiesLogin.getUtente().idPersona.id} as AttoreDoc;
      break;
      case "OPEN":
        //res = this.loadDocument(+params.get("id"));
        //TODO: Intervenire qui per aggiustare il peis. E' stato commentatato in velocità per presentazione epica tip
        break;
    }
    return res;
  }

  private calcolaRoba(){
    if (this.doc.registroDocList) {
      const registriUfficiali: RegistroDoc[] = this.doc.registroDocList.filter(r=>r.idRegistro.attivo && r.idRegistro.ufficiale);
      if (registriUfficiali && registriUfficiali.length > 0) {
        this.descrizioneStrutturaAdottante = registriUfficiali[0].idStrutturaRegistrante.nome;
        if (registriUfficiali[0].idStrutturaRegistrante.codice !== null){
          this.descrizioneStrutturaAdottante = this.descrizioneStrutturaAdottante + " [ " + registriUfficiali[0].idStrutturaRegistrante.codice + " ]";
        }
        this.descrizioneUtenteRegistrante = this.descrizioneStrutturaAdottante;
        if (registriUfficiali[0].idPersonaRegistrante !== undefined && registriUfficiali[0].idPersonaRegistrante !== null){
          this.descrizioneUtenteRegistrante = registriUfficiali[0].idPersonaRegistrante  + ' ' + this.descrizioneStrutturaAdottante; 
        }

        const pad: string = "0000000";
        this.visualizzazioneDocumento = registriUfficiali[0].idRegistro.codice + 
            pad.substring(0, pad.length - registriUfficiali[0].numero.toString().length) + registriUfficiali[0].numero + "/" + registriUfficiali[0].anno;
        //this.numeroVisualizzazione = this.doc.registroDocList.filter(rd => rd.idRegistro.ufficiale)[0].numeroVisualizzazione;    
        this.numeroVisualizzazione = pad.substring(0, pad.length - registriUfficiali[0].numero.toString().length);
      }
    }
  }

  private setLabelProtocollatoDa() {
    if(this.doc.tipologia === TipologiaDoc.PROTOCOLLO_IN_ENTRATA || this.doc.tipologia === TipologiaDoc.PROTOCOLLO_IN_USCITA) {
      this.registroLabel = "Protocollo numero";
      this.protocollatoDaLabel = "Protocollato da";
      
    } else if (this.doc.tipologia === TipologiaDoc.DELIBERA ) {
      this.registroLabel = "Delibera numero";
      this.protocollatoDaLabel = "Adottata da";
      // this.calcolaRoba();
    } else if (this.doc.tipologia === TipologiaDoc.DETERMINA) {
      this.registroLabel = "Determina numero";
      this.protocollatoDaLabel = "Proposta da";
      // this.calcolaRoba();
    }
    this.calcolaRoba()
  }

  /**
   * Crea e torna l'observable per il caricamento del Doc tramite il suo id.
   * @param id
   * @returns
   */
  private loadDocument(idDoc: number) {

      this.subscriptions.push(
        this.extendedDocService.getByIdHttpCall(idDoc,this.projection).subscribe(
          (res: Doc) => {
            this.doc = res;
            console.log("res: ", res)
            this.setFreezeDocumento(false);
            this.setLabelProtocollatoDa();

            this.docVisualizer = new DocVisualizerService(this.doc);
            this.notaDocumentoString = this.doc?.notaDocumento[0]?.testo;
            this.notaAnnullamentoString = this.doc?.notaAnnullamento[0]?.testo;
            if (this.doc.annullato) {
              this.dataAnnullamento = formatDate(this.doc?.docAnnullatoList[0]?.data, 'dd/MM/yyyy', 'en_US');
            }
            this.yearOfProposta = this.doc.dataCreazione.getFullYear().toString();
            this.tipoDocumento = this.doc.tipologia;
            
            this.pregresso = this.doc.pregresso;
            this.creatoDaDescrizione = this.doc.attoriList.filter(a => a.ruolo === RuoloAttoreDoc.REDATTORE || a.ruolo === RuoloAttoreDoc.REDAZIONE || a.ruolo === RuoloAttoreDoc.RICEZIONE)[0]?.idPersona.descrizione;

            this.dataCreazione = formatDate(this.doc.dataCreazione, 'dd/MM/yyyy', 'en_US');
            if (this.doc.dataUltimoVersamento != null ) {
              this.dataUltimoVersamento = formatDate(this.doc.dataUltimoVersamento, 'dd/MM/yyyy', 'en_US');
              } else {
                this.dataUltimoVersamento = null;
            }
            const registroDoc = this.doc.registroDocList.find(registro => registro.idRegistro.attivo === true &&  registro.idRegistro.ufficiale === true);
            if (registroDoc.dataRegistrazione != null) {
            this.dataRegistrazione = formatDate(registroDoc.dataRegistrazione, 'dd/MM/yyyy', 'en_US');
            } else {
              this.dataRegistrazione = null;
            }
            this.visibilitaLimitata = this.doc.visibilita === VisibilitaDoc.LIMITATA;
            this.riservato = this.doc.visibilita === VisibilitaDoc.RISERVATO;
            this.annullato = this.doc.annullato;
            this.docsCollegati = this.doc.docsCollegati;  
        })
      );

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
        this.numeroVisualizzazione = res.numeroProtocollo;
        this.messageService.add({
          severity: "success",
          summary: "Documento",
          detail: "Documento protocollato con successo: numero protocollo generato " + res.numeroProtocollo
        });
        this.setFreezeDocumento(false);

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

  public showDocumentiCollegati() {
    const idDoc = this.doc.id;
    const from = 'scripta';
    const url = `${DOC_DOC_ROUTE}?idDoc=${idDoc}&from=${from}`;
    if (this.windowDocumentiCollegati && !this.windowDocumentiCollegati.closed) {
      this.windowDocumentiCollegati.focus();
    } else {
      this.windowDocumentiCollegati = window.open(url, '_blank', 'popup=true');
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
