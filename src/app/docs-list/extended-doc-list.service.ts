import { DatePipe } from "@angular/common";
import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BaseUrlType, DocListService, getInternautaUrl } from "@bds/ng-internauta-model";
import { Observable } from "rxjs";
import { CUSTOM_SERVER_METHODS } from "src/environments/app-constants";
import { ExtendedDocList } from "./extended-doc-list";


@Injectable({
  providedIn: "root"
})
export class ExtendedDocListService extends DocListService {

  constructor(protected _http: HttpClient, protected _datepipe: DatePipe) {
    super(_http, _datepipe);
  }

  /**
   * Chiamata per l'eliminazione della proposta
   */
     public eliminaProposta(doc: ExtendedDocList): Observable<any> {
      console.log(doc.guidDocumento);
      const url = getInternautaUrl(BaseUrlType.Scripta) + "/" + CUSTOM_SERVER_METHODS.eliminaProposta
      let formData: FormData = new FormData();
      formData.append("guid_doc",doc.guidDocumento)
      formData.append("id_applicazione", doc.idApplicazione.id);
      formData.append("id_azienda", doc.idAzienda.id.toString())
      console.log(formData);
      return this._http.post(url, formData);
    }
}
