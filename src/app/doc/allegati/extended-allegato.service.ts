import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Allegato, AllegatoService, BaseUrlType, DettaglioAllegato, Doc, getInternautaUrl } from "@bds/ng-internauta-model";
import { DatePipe } from "@angular/common";
import { catchError } from "rxjs/operators";
import { ErrorManager } from "src/app/utilities/error-manager";
import { CUSTOM_SERVER_METHODS } from "src/environments/app-constants";
import { Observable } from "rxjs";


@Injectable()
export class ExtendedAllegatoService extends AllegatoService {

  constructor(protected _http: HttpClient, protected _datepipe: DatePipe) {
    super(_http, _datepipe);
  }

  public uploadAllegato(formData: FormData) {
    const apiUrl = getInternautaUrl(BaseUrlType.Scripta) + "/" + CUSTOM_SERVER_METHODS.saveAllegato;
    console.log(apiUrl);
    return this._http.post(apiUrl, formData, { reportProgress: true, observe: "events" })
        .pipe(catchError(ErrorManager.errorMgmt));
  }

  /**
   * Ritorna un Observable il cui risultato è il blob dell'allegato richiesto.
   * @param allegato L'allegato che si vuole.
   */
   public downloadAttachment(dettaglioAllegato: DettaglioAllegato): Observable<any> {
    const url = getInternautaUrl(BaseUrlType.Scripta) + "/" + CUSTOM_SERVER_METHODS.dettaglioallegato + "/" + dettaglioAllegato.id +"/download";
     return this._http.get(url, {responseType: "blob"});
  }

  /**
   * Ritorna un Observable il cui risultato è il blob dello zip degli allegati del Doc richiesto.
   * @param doc Il Doc del quale si vuole lo zip degli allegati
   */
   public downloadAllAttachments(doc: Doc): Observable<any> {
    const url = getInternautaUrl(BaseUrlType.Scripta) + "/" + CUSTOM_SERVER_METHODS.downloadAllAttachments + "/" + doc.id;
    return this._http.get(url, {responseType: "blob"});
  }
}
