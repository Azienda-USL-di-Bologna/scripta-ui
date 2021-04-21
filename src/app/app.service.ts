import { Injectable } from "@angular/core";
import { Azienda } from "@bds/ng-internauta-model";
import { Observable, Subject } from "rxjs";

@Injectable({
  providedIn: "root"
})
export class AppService {
  private _aziendaDiLavoro = new Subject<Azienda>();
  
  /******************************************************************
   * GETTER DEGLI OBSERVABLE
   */
  public get aziendaDiLavoroEvent(): Observable<Azienda> {
    return this._aziendaDiLavoro.asObservable();
  }

  /******************************************************************
   * SETTER DEGLI OBSERVABLE
   */
  public aziendaDiLavoroSelection(azienda: Azienda) {
    this._aziendaDiLavoro.next(azienda);
  }
}