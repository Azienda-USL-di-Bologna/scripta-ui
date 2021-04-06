import { Injectable } from '@angular/core';
import { HttpErrorResponse, HttpClient } from "@angular/common/http";
import { throwError, Observable } from "rxjs";

import { BaseUrlType, getInternautaUrl } from "@bds/ng-internauta-model";
import { catchError } from "rxjs/operators";
import { CUSTOM_SERVER_METHODS } from "src/environments/app-constants";
import { Form } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class UtilityService {

  constructor(protected _http: HttpClient) { }

  uploadAllegato(formData: FormData){
    const apiUrl = getInternautaUrl(BaseUrlType.Scripta) + "/" + CUSTOM_SERVER_METHODS.saveAllegato;
    console.log(apiUrl);
    return this._http.post(apiUrl, formData, { reportProgress: true, observe: "events" })
        .pipe(catchError(this.errorMgmt));
  }

  errorMgmt(error: HttpErrorResponse) {
    let errorMessage = "";
    if (error.error instanceof ErrorEvent) {
      // Get client-side error
      errorMessage = "Client-side error :" + error.error.message;
    } else {
      // Get server-side error
      errorMessage = `Server-side error, Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    console.log(errorMessage);
    return throwError(errorMessage);
  }
}
