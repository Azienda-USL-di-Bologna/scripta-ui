import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ArchivioDoc, Doc } from '@bds/internauta-model';
import { JwtLoginService, UtenteUtilities } from '@bds/jwt-login';
import { Subscription } from 'rxjs/internal/Subscription';

@Component({
  selector: 'archivio-doc',
  templateUrl: './archivio-doc.component.html',
  styleUrls: ['./archivio-doc.component.scss']
})
export class ArchivioDocComponent implements OnInit {

  private subscriptions: Subscription[] = [];
  private loggedUtenteUtilities: UtenteUtilities;
  private _doc: Doc;
  public archiviDoc: ArchivioDoc[];
  


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
    this.settaArchivio();
  }

  public settaArchivio(): void {
    this.archiviDoc = this.doc.archiviDocList;
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
