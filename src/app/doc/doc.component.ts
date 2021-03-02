import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, ParamMap, Router } from "@angular/router";
import { Doc, DocService, ENTITIES_STRUCTURE } from "@bds/ng-internauta-model";
import { MessageService } from "primeng-lts/api";
import { Observable, Subscription } from "rxjs";
import { switchMap } from "rxjs/operators";

@Component({
  selector: "doc",
  templateUrl: "./doc.component.html",
  styleUrls: ["./doc.component.scss"]
})
export class DocComponent implements OnInit {
  private subscriptions: Subscription[] = [];
  public doc: Doc = new Doc();

  constructor(
    private docService: DocService,
    private router: Router,
    private messageService: MessageService,
    private route: ActivatedRoute) { }

  ngOnInit(): void {
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

  public removeZoneFromTime(date: string | undefined): string | null {
    if (date) {
      return date.replace(/\[\w+\/\w+\]$/, "");
    }
    return null;
  }

  private loadDocument(id: number): Observable<Doc> {
    return this.docService.getByIdHttpCall(
      id,
      ENTITIES_STRUCTURE.scripta.doc.standardProjections.DocWithIdAziendaAndIdPersonaCreazione);
  }

  public onDoSave(event: any): void{
    console.log("Emittend event", event);
  }
  
  public onDoProtocolla(event: any): void{
    console.log("Emittend event", event);
    /* this.docService.protocollaIn(event).then(res => {
      console.log('Res di onProtocolla', res);
      const d: Doc = res;
      const registrazione = d.registriList[0];
      const messageHeader = 'Registrazione ' +  registrazione.idRegistro.nomeRegistro + ' ' + registrazione.numero;
      this.messageService.showMessageSuccessfulMessage(messageHeader, 'Resgistrazione avvenuta con successo');
    }); */
  }

  public clearMessages(): void{
    this.messageService.clear();
  }

  public doButtonSave(): void {
    console.log("nothing");
  }
  public doButtonProtocolla(): void {
    console.log("nothing");
  }
  public doButtonNote(): void {
    console.log("nothing");
  }
}
