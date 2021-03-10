import {Component, Input, OnDestroy, OnInit, Output, EventEmitter} from "@angular/core";
import {ExtendedMittenteService} from "./extended-mittente.service";
import {
  CodiceMezzo,
  DettaglioContatto,
  DettaglioContattoService,
  Doc,
  DocService,
  ENTITIES_STRUCTURE,
  IndirizzoSpedizione,
  Mezzo,
  MezzoService,
  OrigineRelated,
  Related,
  Spedizione,
  TipoDettaglio,
  TipoRelated
} from "@bds/ng-internauta-model";
import {AdditionalDataDefinition, FILTER_TYPES, FilterDefinition, FiltersAndSorts} from "@nfa/next-sdr";
import {Subscription} from "rxjs";
import {NtJwtLoginService, UtenteUtilities} from "@bds/nt-jwt-login";
import {ExtendedDocService} from "../extended-doc.service";



@Component({
  selector: "mittente",
  templateUrl: "./mittente.component.html",
  styleUrls: ["./mittente.component.scss"],
  providers: [ExtendedMittenteService]
})
export class MittenteComponent implements OnInit, OnDestroy {

  @Input() set doc(value: Doc) {
    if ( value && value.mittenti && value.mittenti.length > 0 ) {
      this.selectedMittente = value.mittenti[0];
      this._doc = value;
    } else {
      this.selectedMittente = null;
    }
  }

  @Output() saveMittenteEvent = new EventEmitter<Doc>();


  selectedMittente: Related | undefined | null;
  selectedOrigine: string = "";
  selectedMezzo: string = "";
  private _doc: Doc | undefined;
  public _mittenti: Related[] | undefined;

  suggeretionsMittente: DettaglioContatto[] = [];
  public suggeretionsOrigine: any[] = Object.values(OrigineRelated);

  // suggeretionsMezzo: Mezzo[] = [];
  suggeretionsMezzo: any[] = [];

  filteredMittente: DettaglioContatto[] = [];
  filteredOrigine: any[] = [];
  filteredMezzo: any[] = [];

  dataDiArrivo: Date = new Date();
  private subscriptions: Subscription[] = [];
  private loggedUtenteUtilities: UtenteUtilities | undefined | null;

  constructor(private mittenteService: ExtendedMittenteService,
    private mezzoService: MezzoService,
    private loginService: NtJwtLoginService,
    private dettaglioContattoService: DettaglioContattoService,
    private extendedDocService: ExtendedDocService
    ) { }

    ngOnInit(): void {
      this.subscriptions.push(this.loginService.loggedUser$.subscribe((utenteUtilities: UtenteUtilities) => {
            this.loggedUtenteUtilities = utenteUtilities;
          })
      );
      this.mittenteService.getSuggeretionMittente().then(suggeretionsMittente => {
        this.suggeretionsMittente = suggeretionsMittente;
        console.log(suggeretionsMittente);
      });

      this.mittenteService.getSuggeretionTipo().then(suggeretionsTipo => {
        this.suggeretionsOrigine = suggeretionsTipo;
        console.log(suggeretionsTipo);
      });

      this.mezzoService.getData().subscribe((data: any) => {
        if (data && data.results) {
          this.suggeretionsMezzo = data.results;
          // this.suggeretionsMezzo.push("crea contatto estemporaneo");
        } else {
          this.suggeretionsMezzo = [];
        }

      });
    }

  searchMittente(event: any) {
    const filteredMittente: any[] = [];
    const query = event.query;
    const projection = ENTITIES_STRUCTURE.rubrica.dettagliocontatto.standardProjections.DettaglioContattoWithEmailAndIdContattoAndIndirizzoAndTelefono;
    const filtersAndSorts: FiltersAndSorts = new FiltersAndSorts();
    filtersAndSorts.addAdditionalData(new AdditionalDataDefinition("CercaAncheInContatto", query));
    filtersAndSorts.addAdditionalData(new AdditionalDataDefinition("OperationRequested", "CercaAncheInContatto"));
    filtersAndSorts.addFilter(new FilterDefinition("idContatto.eliminato", FILTER_TYPES.not_string.equals, false));
    filtersAndSorts.addFilter(new FilterDefinition("idContatto.protocontatto", FILTER_TYPES.not_string.equals, false));
    filtersAndSorts.addFilter(new FilterDefinition("eliminato", FILTER_TYPES.not_string.equals, false));
    filtersAndSorts.addFilter(new FilterDefinition("tipo", FILTER_TYPES.not_string.equals, TipoDettaglio.INDIRIZZO_FISICO));
    filtersAndSorts.addFilter(new FilterDefinition("tipo", FILTER_TYPES.not_string.equals, TipoDettaglio.TELEFONO));
    filtersAndSorts.addFilter(new FilterDefinition("tipo", FILTER_TYPES.not_string.equals, TipoDettaglio.EMAIL));
    this.subscriptions.push(
        this.dettaglioContattoService.getData(projection, filtersAndSorts).subscribe(res => {
          if (res) {
            res.results.forEach((dettaglioContatto: DettaglioContatto) => {
              // @ts-ignore
              dettaglioContatto["descrizioneCustom"] = dettaglioContatto.descrizione + " [ " + dettaglioContatto.idContatto.descrizione + " ]";
            });
            this.filteredMittente = res.results;
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
  saveMittente(event: DettaglioContatto) {
    this.selectedMittente = this.dettaglioContattoToRelated(event);
    this._doc.mittenti = [this.selectedMittente];
    this.saveMittenteEvent.emit(this._doc);

  }

  private dettaglioContattoToRelated(dettaglioContatto: DettaglioContatto): Related {
    const mittenteRelated: Related = new Related();
    mittenteRelated.idContatto = dettaglioContatto.idContatto;
    mittenteRelated.descrizione = dettaglioContatto.descrizione;
    mittenteRelated.tipo = TipoRelated.MITTENTE;
    mittenteRelated.idPersonaInserente = this.loggedUtenteUtilities ? this.loggedUtenteUtilities.getUtente().idPersona : null;
    // mittenteRelated.idDoc = this._doc ? this._doc : null;
    switch (dettaglioContatto.tipo) {
      case TipoDettaglio.UTENTE_STRUTTURA:
        mittenteRelated.origine = OrigineRelated.INTERNO;
        break;
      case TipoDettaglio.STRUTTURA:
        mittenteRelated.origine = OrigineRelated.INTERNO;
        break;
      default:
        mittenteRelated.origine = OrigineRelated.ESTERNO;
    }
    mittenteRelated.spedizioneList = [this.buildSpedizione(dettaglioContatto)];
    return mittenteRelated;
  }

  private buildSpedizione(dettaglioContatto: DettaglioContatto): Spedizione {
    const spedizione: Spedizione = new Spedizione();

    // spedizione.data = new Date();

    spedizione.idDettaglioContatto = dettaglioContatto;
    let codiceMezzo: string;
    const indirizzo = new IndirizzoSpedizione();
    indirizzo.completo = dettaglioContatto.descrizione;
    switch (dettaglioContatto.tipo) {
      case TipoDettaglio.EMAIL:
        if (dettaglioContatto.email.pec) {
          codiceMezzo = CodiceMezzo.PEC;
        } else {
          codiceMezzo = CodiceMezzo.MAIL;
        }
        break;
      case TipoDettaglio.TELEFONO:
        if (dettaglioContatto.telefono.fax) {
          codiceMezzo = CodiceMezzo.FAX;
        } else {
          codiceMezzo = CodiceMezzo.TELEFONO;
        }
        break;
      case TipoDettaglio.INDIRIZZO_FISICO:
        indirizzo.civico = dettaglioContatto.indirizzo.civico;
        indirizzo.comune = dettaglioContatto.indirizzo.comune;
        indirizzo.nazione = dettaglioContatto.indirizzo.nazione;
        indirizzo.provincia = dettaglioContatto.indirizzo.provincia;
        indirizzo.via = dettaglioContatto.indirizzo.via;
        indirizzo.cap = dettaglioContatto.indirizzo.cap;

        codiceMezzo = CodiceMezzo.POSTA_ORDINARIA;
        break;
      default:
        // TODO: lanciare errore
    }
    spedizione.indirizzo = indirizzo;
    spedizione.idMezzo = this.suggeretionsMezzo.find(m => m.codice === codiceMezzo);
    return spedizione;
  }

  searchTipo(event: any) {
    console.log(this.suggeretionsOrigine);
    const filteredTipo: any[] = [];
    const query = event.query;
    this.suggeretionsOrigine.forEach(currentSuggeretion => {
      if (currentSuggeretion.name.toLowerCase().indexOf(query.toLowerCase()) === 0) {
        filteredTipo.push(currentSuggeretion);
      }
    });
    this.filteredOrigine = filteredTipo;
  }

  searchMezzo(event: any) {
    const filteredMezzo: any[] = [];
    const query = event.query;
    this.suggeretionsMezzo.forEach(currentSuggeretion => {
      if (currentSuggeretion.descrizione.toLowerCase().indexOf(query.toLowerCase()) === 0) {
        filteredMezzo.push(currentSuggeretion);
      }
    });
    this.filteredMezzo = filteredMezzo;
  }

  public timeOutAndSaveDoc(doc: Doc, field: keyof Doc) {
    console.log("timeOutAndSaveDoc");
   // this.mittenteEmitter.emit();
  }

  ngOnDestroy() {
    if (this.subscriptions && this.subscriptions.length > 0 ) {
      this.subscriptions.forEach(s => s.unsubscribe());
      this.subscriptions = [];
    }
  }
}

