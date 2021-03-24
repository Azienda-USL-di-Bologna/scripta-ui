import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { ActivatedRoute, ParamMap, Router } from "@angular/router";
import { Doc, ENTITIES_STRUCTURE } from "@bds/ng-internauta-model";
import { NtJwtLoginService, UtenteUtilities } from "@bds/nt-jwt-login";
import { MessageService } from "primeng-lts/api";
import { Observable, Subscription } from "rxjs";
import { switchMap } from "rxjs/operators";
import { ExtendedDocService } from "./extended-doc.service";

@Component({
  selector: "doc",
  templateUrl: "./doc.component.html",
  styleUrls: ["./doc.component.scss"]
})
export class DocComponent implements OnInit, OnDestroy, AfterViewInit {
  private subscriptions: Subscription[] = [];
  private savingTimeout: ReturnType<typeof setTimeout> | undefined;
  @ViewChild("pageStart") public pageStart: any;
  public doc: Doc = new Doc();
  public descrizioneUtenteRegistrante: string | undefined;
  public DatiProtocolloEsterno: Number;
  public dataProtocolloEsterno: Date;
  private projection: string = ENTITIES_STRUCTURE.scripta.doc.standardProjections.DocWithDestinatariAndIdAziendaAndIdPersonaCreazioneAndMittentiCustom;

  constructor(
    private extendedDocService: ExtendedDocService,
    private loginService: NtJwtLoginService,
    private messageService: MessageService,
    private route: ActivatedRoute) { }

  ngOnInit(): void {
    // setTimeout(() => {
    //   // window.scrollTo(0, 0);
    //   this.pageStart.nativeElement.focus();
    // }, 0);
    this.subscriptions.push(
      this.loginService.loggedUser$.subscribe(
        (utenteUtilities: UtenteUtilities) => {
          this.descrizioneUtenteRegistrante = utenteUtilities.getUtente().idPersona.descrizione;
        }
      )
    );

    this.subscriptions.push(
      this.route.paramMap.pipe(
        switchMap((params: ParamMap) =>
          this.loadDocument(Number(params.get("id")))
      )).subscribe((res: Doc) => {
        console.log("res", res);
        this.doc = res;
      })
    );
  }

  ngAfterViewInit() {
    //this.pageStart.nativeElement.focus();
   
    setTimeout(() => {
      //window.scrollTo(0, 0);
      this.pageStart.nativeElement.focus();
    }, 0);
    
  }

  public removeZoneFromTime(date: string | undefined): string | null {
    if (date) {
      return date.replace(/\[\w+\/\w+\]$/, "");
    }
    return null;
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
    this.messageService.add({severity:'success', summary:'Documento', detail:'Documeto salvato con successo'});
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
