import { Injectable } from "@angular/core";
import { ArchiviListService } from "./archivi-list.service";
import { DatePipe } from "@angular/common";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs/internal/Observable";
import { BaseUrlType, getInternautaUrl } from "@bds/internauta-model";

@Injectable({
    providedIn: 'root'
  })

  export class ExtendedArchivioListService extends ArchiviListService {
  
    constructor(protected _http: HttpClient, protected _datepipe: DatePipe) {
      super(_http, _datepipe);
    }


    public gestioneMassivaResponsabile(ids : string, idReponsabileNuovo: number, idStrutturaNuova: number, idAziendaRiferimento : number) : Observable<any> {
        const url = getInternautaUrl(BaseUrlType.Scripta) + "/" + "sostituisciResponsabileArchivioMassivo?" + ids + "idPersonaNuovoResponsabile=" + idReponsabileNuovo + "&ididStrutturaNuovoResponsabile=" +idStrutturaNuova +"&idAziendaRiferimento="+idAziendaRiferimento;
        return this._http.get(url, {responseType: "blob"}); 
    }
}