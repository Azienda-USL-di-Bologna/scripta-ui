import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from "@angular/core";
import { CategoriaContatto, Contatto, ContattoService, DettaglioContatto, Doc, ENTITIES_STRUCTURE, MezzoService, OrigineRelated, Related, TipoContatto, TipoDettaglio, TipoRelated } from "@bds/ng-internauta-model";
import { NtJwtLoginService, UtenteUtilities } from "@bds/nt-jwt-login";
import { AdditionalDataDefinition, FilterDefinition, FiltersAndSorts, FILTER_TYPES } from "@nfa/next-sdr";
import { Subscription } from "rxjs";
import { ExtendedDocService } from "../extended-doc.service";

import {ExtendedDestinatariService} from "./extended-destinatari.service";

@Component({
  selector: "destinatari",
  templateUrl: "./destinatari.component.html",
  styleUrls: ["./destinatari.component.scss"]
})
export class DestinatariComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription[] = [];
  private loggedUtenteUtilities: UtenteUtilities;

  selectedTipo: string = "";
  selectedMezzo: string = "";
  suggeretionsTipo: any[] = [];
  // suggeretionsMezzo: Mezzo[] = [];
  suggeretionsMezzo: any[] = [];
  filteredTipo: any[] = [];
  filteredMezzo: any[] = [];
  public columnCoinvolti: any[] = [];
  descrizioneCoinvolti: any[]  = [];

  public _doc: Doc;
  public selectedCompetente: Related;
  public selectedCoinvolto: Related;

  public filteredCompetenti: DettaglioContatto[];
  public filteredCoinvolti: DettaglioContatto[];



  @Input() set doc(value: Doc) {
    this._doc = value;
    // if ( value && value.competenti && value.competenti.length > 0 ) {
    //   this.selectedCompetente = value.competenti[0];
    //   this._doc = value;
    // } else {
    //   this.selectedCompetente = null;
    // }
  }

  @Output() saveMittenteEvent = new EventEmitter<Doc>();

  constructor(private destinatariService: ExtendedDestinatariService,
    private mezzoService: MezzoService,
    private loginService: NtJwtLoginService,
    private contattoService: ContattoService,
    private extendedDocService: ExtendedDocService
    ) {
      this.columnCoinvolti = [
        { field: "descrizione", header: "Nome struttura" },
      ];
  }

  ngOnInit(): void {
    this.subscriptions.push(this.loginService.loggedUser$.subscribe((utenteUtilities: UtenteUtilities) => {
      this.loggedUtenteUtilities = utenteUtilities;
      })
    );
  }

  searchDestinatario(event: any, modalita: string) {
    const query = event.query;
    const projection = ENTITIES_STRUCTURE.rubrica.contatto.standardProjections.ContattoWithIdPersonaAndIdPersonaCreazioneAndIdStruttura;
    const filtersAndSorts: FiltersAndSorts = new FiltersAndSorts();
    // filtersAndSorts.addAdditionalData(new AdditionalDataDefinition("CercaAncheInContatto", query));
    // filtersAndSorts.addAdditionalData(new AdditionalDataDefinition("OperationRequested", "CercaAncheInContatto"));
    filtersAndSorts.addFilter(new FilterDefinition("tscol", FILTER_TYPES.not_string.equals, query));
    filtersAndSorts.addFilter(new FilterDefinition("eliminato", FILTER_TYPES.not_string.equals, false));
    filtersAndSorts.addFilter(new FilterDefinition("protocontatto", FILTER_TYPES.not_string.equals, false));
    filtersAndSorts.addFilter(new FilterDefinition("eliminato", FILTER_TYPES.not_string.equals, false));
    filtersAndSorts.addFilter(new FilterDefinition("tipo", FILTER_TYPES.not_string.equals, TipoContatto.ORGANIGRAMMA));
    filtersAndSorts.addFilter(new FilterDefinition("categoria", FILTER_TYPES.not_string.equals, CategoriaContatto.STRUTTURA));
    this.subscriptions.push(
        this.contattoService.getData(projection, filtersAndSorts).subscribe(res => {
          if (res) {
            res.results.forEach((contatto: Contatto) => {
              // @ts-ignore
              contatto["descrizioneCustom"] = contatto.descrizione + " [ " + contatto.descrizione + " ]";
            });
            switch (modalita) {
              case "competente":
                this.filteredCompetenti = res.results;
              break;
              case "coinvolto":
                this.filteredCoinvolti = res.results;
              break;
            }
          }
        }, err => {
          console.log("error");
          // this.messageService.add({
          //   severity: "error",
          //   summary: "Errore nel backend",
          //   detail: "Non è stato possibile fare la ricerca."
          // });
        })
    );
  }

  public saveDestinatario(contatto: Contatto, modalita: string) {
    switch (modalita) {
      case "competente":
        this._doc.competenti = [];
        this._doc.competenti.push(this.contattoToRelated(contatto, TipoRelated.A));
      break;
      case "coinvolto":
        this._doc.coinvolti.push(this.contattoToRelated(contatto, TipoRelated.CC));
      break;
    }
  }

  private contattoToRelated(contatto: Contatto, tipo: TipoRelated): Related {
    const destinatario: Related = new Related();
    destinatario.idContatto = contatto;
    destinatario.descrizione = contatto.descrizione;
    destinatario.tipo = tipo;
    destinatario.idPersonaInserente = this.loggedUtenteUtilities ? this.loggedUtenteUtilities.getUtente().idPersona : null;
    destinatario.origine = OrigineRelated.INTERNO;
    // destinatario.spedizioneList = [this.buildSpedizione(dettaglioContatto)];
    return destinatario;
  }

  onDeleteRelated(related: Related) {

  }

  public ngOnDestroy() {
    if (this.subscriptions && this.subscriptions.length > 0 ) {
      this.subscriptions.forEach(s => s.unsubscribe());
      this.subscriptions = [];
    }
  }
}
