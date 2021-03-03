import { DatePipe } from "@angular/common";
import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Doc, DocService } from "@bds/ng-internauta-model";
import { AdditionalDataDefinition } from "@nfa/next-sdr";
import { Observable } from "rxjs";
import { filter } from "rxjs/operators";

@Injectable({
  providedIn: "root"
})

export class ExtendedDocService extends DocService {
  // private propostaNumberForTest = Math.round(Math.random() * 100);

  constructor(protected _http: HttpClient, protected _datepipe: DatePipe) {
    super(_http, _datepipe);
  }

  public updateDoc<K extends keyof Doc>(doc: Doc, fields: K[], projection?: string, additionalData?: AdditionalDataDefinition[]): Observable<Doc> {
    const docToSave: Doc = new Doc();
    fields.forEach(
      field => {
        docToSave[field] = doc[field];
      }
    );
    docToSave.version = doc.version;

    return this.patchHttpCall(docToSave, doc.id, projection, additionalData);
  }

  /* public loadDocumentDataById(id: number): Promise<Doc>{
    // per test
    // const doc = this.getFakeUD();


    // TODO: implementazione della loadById

    // return new Promise((resolve) => resolve(this.getFakeUD()));
  } */

  /* private getFakeUD(): Doc{
    const doc: Doc = new Doc();
    doc.dataCreazione = new Date();
    // doc.idUtenteCreazione.idPersona.descrizione = 'Campa Rosanna';
    doc.numeroProposta = "2021-" + this.propostaNumberForTest;
    doc.idUtenteCreazione = this.userService.getUtenteConnesso();
    return doc;
  } */

  /* public registerDocument(doc: Doc, codiceRegistro: string): Promise<Doc> {
    const documentoRegistro = this.registrationService.getNewDocumentoRegistro(doc, codiceRegistro);
    doc.dataRegistrazione = documentoRegistro.dataRegistrazione;
    if (!doc.registriList) {
      doc.registriList = [];
    }
    doc.registriList.push(documentoRegistro);
    console.log("Risolvo doc", doc);

    return new Promise((resolve) => resolve(doc) );
  } */

  /* public async protocollaIn(doc: Doc): Promise<Doc> {
      const res = await this.registerDocument(doc, "PG_IN");
      console.log("Ho aspettato la Res", res);

      return new Promise((resolve) => resolve(res) );
  } */

}
