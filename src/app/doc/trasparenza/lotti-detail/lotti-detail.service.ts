import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BaseUrlType, getInternautaUrl } from '@bds/internauta-model';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: "root"
})
export class LottiDetailService {
  private baseURL: string
  constructor(
    protected _http: HttpClient,
    protected _datepipe: DatePipe) {
    this.baseURL = getInternautaUrl(BaseUrlType.Lotti);
  }

  public getTipologie(): Observable<any> {
    const url = this.baseURL + "/tipologia";
    return this._http.get(url);
  }

  public getContraente(): Observable<any> {
    const url = this.baseURL + "/contraente";
    return this._http.get(url);
  }
}