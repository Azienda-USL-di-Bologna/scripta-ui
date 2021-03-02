import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject, Subscription } from 'rxjs';
import { UtenteUtilities, NtJwtLoginService } from '@bds/nt-jwt-login';
import { Utente } from '@bds/ng-internauta-model';


@Injectable({
  providedIn: 'root'
})
export class UserServiceService {
  public _loggedUser: UtenteUtilities | undefined;
  private subscriptions: Subscription[] = [];

  constructor(public loginService: NtJwtLoginService) {
    this.subscriptions.push(this.loginService.loggedUser$.subscribe((utente: UtenteUtilities) => {
      this._loggedUser = utente;
    }));
  }

  public getUtenteConnesso(): Utente | undefined{
    return this._loggedUser?.getUtente();
  }

}
