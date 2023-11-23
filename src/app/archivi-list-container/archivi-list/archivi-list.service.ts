import { DatePipe } from '@angular/common';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ArchivioDetailService, BaseUrlType, getInternautaUrl } from '@bds/internauta-model';
import { Observable } from 'rxjs';
import { PermessoPersonaOnlyId } from './modifica-vicari-permessi/modifica-vicari-permessi.component';
//import { PermessoPersona, PermessoPersonaOnlyId } from './archivi-list.component';

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
  ): Observable<any> {
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

  public gestioneMassivaPermessiVicari(
    predicate: HttpParams,
    notIds: number[],
    ids: number[], 
    idsPersonaVicariAdd: number[],
    idsPersonaVicariDelete: number[],
    idsPersonaPermessiDelete: number[],
    permessiPersonaAdd: PermessoPersonaOnlyId[],
    idAziendaRiferimento: number
  ): Observable<any> {
    predicate = predicate
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
    const headers = new HttpHeaders()
    .set('Content-Type', 'application/json'); 

    const stringBody = JSON.stringify({
        idPersonaVicariDaAggiungere: idsPersonaVicariAdd,
        idPersonaVicariDaRimuovere: idsPersonaVicariDelete,
        idPersonaPermessiDaRimuovere: idsPersonaPermessiDelete,
        permessiPersonaDaAggiungere: permessiPersonaAdd
    });
    const url = getInternautaUrl(BaseUrlType.Scripta) + "/modificaVicariAndPermessiArchivioMassivo?" + predicate.toString();
    return this._http.post(url, stringBody, {headers: headers})
  }

  /**
   * 
   * @returns 
   */
  public copiaTrasferimentoAbilitazioni(
    operationType: string,
    idAziendaRiferimento: number,
    idPersonaSorgente: number,
    idPersonaDestinazione: number,
    idStrutturaDestinazione: number
  ): Observable<any> {
    // Costruisci i parametri della richiesta HTTP
    const predicate = new HttpParams()
      .set('operationType', operationType)
      .set('idAziendaRiferimento', idAziendaRiferimento.toString())
      .set('idPersonaSorgente', idPersonaSorgente.toString())
      .set('idPersonaDestinazione', idPersonaDestinazione.toString())
      .set('idStrutturaDestinazione', idStrutturaDestinazione.toString());

    // Esegui la richiesta GET con i parametri
    return this._http.get(getInternautaUrl(BaseUrlType.Scripta) + "/" + "copiaTrasferisciAbilitazioniArchiviMassivo", { params: predicate });
  }
}
