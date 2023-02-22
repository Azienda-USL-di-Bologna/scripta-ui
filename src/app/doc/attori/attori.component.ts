import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { AttoreDoc, Doc, Firmatario, Persona } from '@bds/internauta-model';
import { JwtLoginService, UtenteUtilities } from '@bds/jwt-login';
import { Subscription } from 'rxjs/internal/Subscription';

@Component({
  selector: 'attori',
  templateUrl: './attori.component.html',
  styleUrls: ['./attori.component.scss']
})
export class AttoriComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription[] = [];
  private loggedUtenteUtilities: UtenteUtilities;
  private _doc: Doc;
  private attori: AttoreDoc[];
  public personeFirmatari: Persona[];
  public personePareratori: Persona[];
  public personeVistatori: Persona[];


  public get doc(): Doc {
    return this._doc;
  }
  @Input() public set doc(value: Doc) {
    this._doc = value;
  }


  constructor(
    private loginService: JwtLoginService,

  ) { }

  ngOnInit(): void {
    this.subscriptions.push(this.loginService.loggedUser$.subscribe((utenteUtilities: UtenteUtilities) => {
      this.loggedUtenteUtilities = utenteUtilities;
      })
    );
    this.settaAttori();
  }

  public settaAttori(): void {
    this.personeFirmatari = this.doc.firmatari.map(attore => attore.idPersona);
    this.personeVistatori = this.doc.vistatori.map(attore => attore.idPersona);
    this.personePareratori = this.doc.pareratori.map(attore => attore.idPersona);
  }



  /**
   * Alla distruzione del componente mi disottoscrivo da tutto
   */
  public ngOnDestroy() {
    if (this.subscriptions && this.subscriptions.length > 0 ) {
      this.subscriptions.forEach(s => s.unsubscribe());
      this.subscriptions = [];
    }
  }
}
