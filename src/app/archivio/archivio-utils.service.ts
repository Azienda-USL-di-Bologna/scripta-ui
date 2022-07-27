import { Injectable } from "@angular/core";
import { Archivio } from "@bds/ng-internauta-model";
import { Observable, Subject } from "rxjs";

@Injectable({
  providedIn: "root"
})
export class ArchivioUtilsService {
  private _updateArchivioField = new Subject<ArchivioFieldUpdating>();

  constructor() {  }

  /******************************************************************
   * GETTER DEGLI OBSERVABLE
   */
   public get updateArchivioFieldEvent(): Observable<ArchivioFieldUpdating> {
    return this._updateArchivioField.asObservable();
  }

  /******************************************************************
   * SETTER DEGLI OBSERVABLE
   */
  public updateArchivioFieldSelection(updateArchivioField: ArchivioFieldUpdating) {
    this._updateArchivioField.next(updateArchivioField);
  }
}

export interface ArchivioFieldUpdating {
  field: string,
  archivio: Archivio
}