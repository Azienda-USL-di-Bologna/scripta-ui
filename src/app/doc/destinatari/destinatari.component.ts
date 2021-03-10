import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from "@angular/core";
import { CategoriaContatto, Contatto, ContattoService, DettaglioContatto, Doc, ENTITIES_STRUCTURE, MezzoService, Related, TipoContatto, TipoDettaglio } from "@bds/ng-internauta-model";
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
  columnCoinvolti: any[] = [];
  descrizioneCoinvolti: any[]  = [];

  public selectedCompetente: Related;
  public selectedCoinvolto: Related;

  public filteredCompetenti: DettaglioContatto[];
  public filteredCoinvolti: DettaglioContatto[];

  @Input() set doc(value: Doc) {
    // if ( value && value.mittenti && value.mittenti.length > 0 ) {
    //   this.selectedMittente = value.mittenti[0];
    //   this._doc = value;
    // } else {
    //   this.selectedMittente = null;
    // }
  }

  @Output() saveMittenteEvent = new EventEmitter<Doc>();

  constructor(private destinatariService: ExtendedDestinatariService,
    private mezzoService: MezzoService,
    private loginService: NtJwtLoginService,
    private contattoService: ContattoService,
    private extendedDocService: ExtendedDocService
    ) { }

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

  saveDestinatario(event: any, modalita: string) {
  }

  ngOnDestroy() {
    if (this.subscriptions && this.subscriptions.length > 0 ) {
      this.subscriptions.forEach(s => s.unsubscribe());
      this.subscriptions = [];
    }
  }
}
