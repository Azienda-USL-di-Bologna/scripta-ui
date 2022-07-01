import { Injectable } from "@angular/core";
import { Azienda } from "@bds/ng-internauta-model";
import { Observable, Subject } from "rxjs";

@Injectable({
  providedIn: "root"
})
export class AppService {
  private _appName = new Subject<string>();
  
  /******************************************************************
   * GETTER DEGLI OBSERVABLE
   */
  public get appNameEvent(): Observable<string> {
    return this._appName.asObservable();
  }

  /******************************************************************
   * SETTER DEGLI OBSERVABLE
   */
  public appNameSelection(appName: string) {
    this._appName.next(appName);
  }
}