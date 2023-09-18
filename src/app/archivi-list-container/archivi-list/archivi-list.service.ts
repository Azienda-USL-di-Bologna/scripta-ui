import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
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

  
  public gestioneMassivaResponsabile(ids : string, idReponsabileNuovo: number, idStrutturaNuova: number, idAziendaRiferimento : number) : Observable<any> {
    const url = getInternautaUrl(BaseUrlType.Scripta) + "/" + "sostituisciResponsabileArchivioMassivo?" + ids + "idPersonaNuovoResponsabile=" + idReponsabileNuovo + "&idStrutturaNuovoResponsabile=" +idStrutturaNuova +"&idAziendaRiferimento="+idAziendaRiferimento;
    return this._http.get(url, {responseType: "blob"}); 
}
}
