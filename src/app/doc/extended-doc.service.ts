import { DatePipe } from "@angular/common";
import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Doc, DocService, getInternautaUrl, BaseUrlType } from "@bds/ng-internauta-model";
import { AdditionalDataDefinition } from "@nfa/next-sdr";
import { Observable } from "rxjs";
import { CUSTOM_SERVER_METHODS } from "src/environments/app-constants";

@Injectable({
  providedIn: "root"
})
export class ExtendedDocService extends DocService {

  constructor(protected _http: HttpClient, protected _datepipe: DatePipe) {
    super(_http, _datepipe);
  }

  public protocollaDoc(doc: Doc): Observable<any>{
    const url = getInternautaUrl(BaseUrlType.Scripta) + "/" + CUSTOM_SERVER_METHODS.createPE
    console.log(url);
    let formData: FormData = new FormData();
    formData.append("id_doc", doc.id.toString());
    return this.http.post(url, formData)
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

}
