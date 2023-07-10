import { DatePipe } from "@angular/common";
import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BaseUrlType, DocDetailService, getInternautaUrl, StatoVersamento } from "@bds/internauta-model";
import { Observable } from "rxjs";
import { CUSTOM_SERVER_METHODS } from "src/environments/app-constants";
import { ExtendedDocDetailView } from "./extended-doc-detail-view";


@Injectable({
  providedIn: "root"
})
export class ExtendedDocDetailService extends DocDetailService {

  constructor(protected _http: HttpClient, protected _datepipe: DatePipe) {
    super(_http, _datepipe);
  }

  /**
   * Chiamata per l'eliminazione della proposta
   */
  public eliminaProposta(doc: ExtendedDocDetailView): Observable<any> {
    console.log(doc.guidDocumento);
    const url = getInternautaUrl(BaseUrlType.Scripta) + "/" + CUSTOM_SERVER_METHODS.eliminaProposta
    const formData: FormData = new FormData();
    formData.append("guid_doc",doc.guidDocumento)
    formData.append("id_applicazione", doc.idApplicazione.id);
    formData.append("id_azienda", doc.idAzienda.id.toString())
    console.log(formData);
    return this._http.post(url, formData);
  }

  public versaDocMassivo(operazione: StatoVersamento, docs: ExtendedDocDetailView[], idAzienda: number) {
    const url = getInternautaUrl(BaseUrlType.Scripta) + "/" + CUSTOM_SERVER_METHODS.versaDocMassivo
    const formData: FormData = new FormData();
    for (var i = 0; i < docs.length; i++) {
      formData.append('idDocs', docs[i].id.toString());
    }
    formData.append("operazione", operazione);
    formData.append("idAzienda", idAzienda.toString());
    return this._http.post(url, formData);
  }
}
