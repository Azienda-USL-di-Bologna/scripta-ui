import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { ActivatedRoute, ParamMap, Router } from "@angular/router";
import { Doc, ENTITIES_STRUCTURE, Persona } from "@bds/ng-internauta-model";
import { LOCAL_IT } from "@bds/nt-communicator";
import { NtJwtLoginService, UtenteUtilities } from "@bds/nt-jwt-login";
import { AdditionalDataDefinition } from "@nfa/next-sdr";
import { MessageService } from "primeng-lts/api";
import { Observable, Subscription } from "rxjs";
import { switchMap } from "rxjs/operators";
import { AppService } from "../app.service";
import { ExtendedDocService } from "./extended-doc.service";

@Component({
  selector: "doc",
  templateUrl: "./doc.component.html",
  styleUrls: ["./doc.component.scss"]
})
export class DocComponent implements OnInit, OnDestroy, AfterViewInit {
  private subscriptions: Subscription[] = [];
  private savingTimeout: ReturnType<typeof setTimeout> | undefined;
  public localIt = LOCAL_IT;
  @ViewChild("pageStart") public pageStart: any;
  public doc: Doc;
  public descrizioneUtenteRegistrante: string | undefined;
  public utenteUtilitiesLogin: UtenteUtilities;
  public DatiProtocolloEsterno: Number;
  public dataProtocolloEsterno: Date;
  private projection: string = ENTITIES_STRUCTURE.scripta.doc.customProjections.DocWithAll;

  constructor(
    private extendedDocService: ExtendedDocService,
    private loginService: NtJwtLoginService,
    private messageService: MessageService,
    private route: ActivatedRoute,
    private appService: AppService) { }

  ngOnInit(): void {
    this.subscriptions.push(
      this.loginService.loggedUser$.subscribe(
        (utenteUtilities: UtenteUtilities) => {
          this.utenteUtilitiesLogin = utenteUtilities;
          this.descrizioneUtenteRegistrante = utenteUtilities.getUtente().idPersona.descrizione;
        }
      )
    );

    this.subscriptions.push(
      this.route.queryParamMap.pipe(
        switchMap((params: ParamMap) =>
          this.handleCommand(params)
      )).subscribe((res: Doc) => {
        console.log("res", res);
        this.doc = res;
        this.appService.aziendaDiLavoroSelection(this.doc.idAzienda);
      })
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
 * 'NEW' documento (proviene dalla protocollazione da pec) ----> viene passato come parametro l'idpec e viene usato come additionalData 
 * 'OPEN' documento ( apre un documento già esistente con l'id) 
 */
  private handleCommand(params: ParamMap): Observable<Doc> {
    const command = params.get("command");
    let res: Observable<Doc>;
    switch(command) {
      case "NEW": 
        const doc: Doc = new Doc();
        doc.idPersonaCreazione = {id: this.utenteUtilitiesLogin.getUtente().idPersona.id} as Persona
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
      this.messageService.showMessageSuccessfulMessage(messageHeader, 'Resgistrazione avvenuta con successo');
    }); */
  }

  public clearMessages(): void {
    this.messageService.clear();
  }

  public doButtonSave(): void {
    this.appService.aziendaDiLavoroSelection(null);
    this.messageService.add({
      severity:'success', 
      summary:'Documento', 
      detail:'Documento salvato con successo'
    });
    console.log("nothing");
  }
  public doButtonProtocolla(): void {
    console.log("nothing");
  }
  public doButtonNote(): void {
    console.log("nothing");
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
