import { HttpErrorResponse } from "@angular/common/http";
import { Observable, throwError } from "rxjs";

export class ErrorManager {

  public static errorMgmt(error: HttpErrorResponse): Observable<never> {
    let errorMessage = "";
    if (error.error instanceof ErrorEvent) {
      // Get client-side error
      errorMessage = "Client-side error:" + error.error.message;
    } else {
      // Get server-side error
      errorMessage = `Server-side error, Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    console.log(errorMessage);
    return throwError(errorMessage);
  }
}
