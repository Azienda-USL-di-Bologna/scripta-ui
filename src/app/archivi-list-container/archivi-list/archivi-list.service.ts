import { DatePipe } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ArchivioDetailService, BaseUrlType, getInternautaUrl } from '@bds/internauta-model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ArchiviListService extends ArchivioDetailService{

  constructor(protected _http: HttpClient, protected _datepipe: DatePipe) {
    super(_http, _datepipe);
  }

  
  public gestioneMassivaResponsabile(
    predicate: HttpParams,
    notIds: number[],
    ids: number[], 
    idPersonaNuovoResponsabile: number, 
    idStrutturaNuovoResponsabile: number, 
    idAziendaRiferimento : number
  ) : Observable<any> {
    // Costruisci i parametri della richiesta HTTP
    predicate = predicate
      .set('idPersonaNuovoResponsabile', idPersonaNuovoResponsabile.toString())
      .set('idStrutturaNuovoResponsabile', idStrutturaNuovoResponsabile.toString())
      .set('idAziendaRiferimento', idAziendaRiferimento.toString());

    if (ids) {
      ids.forEach((id) => {
        predicate = predicate.append('ids', id.toString());
      });
    }

    if (notIds) {
      notIds.forEach((notId) => {
        predicate = predicate.append('notIds', notId.toString());
      });
    }

    // Esegui la richiesta GET con i parametri
    return this._http.get(getInternautaUrl(BaseUrlType.Scripta) + "/" + "sostituisciResponsabileArchivioMassivo", { params: predicate });
  }
}
