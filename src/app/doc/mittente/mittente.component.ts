import {Component, Input, OnDestroy, OnInit, Output, EventEmitter} from "@angular/core";
import {ExtendedMittenteService} from "./extended-mittente.service";
import {BaseUrls, BaseUrlType, CodiceMezzo, Contatto, DettaglioContatto, DettaglioContattoService, Doc, ENTITIES_STRUCTURE, IndirizzoSpedizione, Mezzo, MezzoService, OrigineRelated, Persona, Related, Spedizione, TipoDettaglio, TipoRelated} from "@bds/ng-internauta-model";
import {AdditionalDataDefinition, FILTER_TYPES, FilterDefinition, FiltersAndSorts, BatchOperationTypes, NextSdrEntity, BatchOperation} from "@nfa/next-sdr";
import {Subscription} from "rxjs";
import {NtJwtLoginService, UtenteUtilities} from "@bds/nt-jwt-login";
import { LOCAL_IT } from "@bds/nt-communicator";
import { MessageService } from "primeng-lts/api";
import { enumOrigine } from "./mittente-constants";
import { DatePipe } from "@angular/common";

@Component({
  selector: "mittente",
  templateUrl: "./mittente.component.html",
  styleUrls: ["./mittente.component.scss"],
  providers: [ExtendedMittenteService]
})
export class MittenteComponent implements OnInit, OnDestroy {

  private subscriptions: Subscription[] = [];
  private loggedUtenteUtilities: UtenteUtilities | undefined | null;
  private actualMittente: Related;
  public localIt = LOCAL_IT;

  public _doc: Doc | undefined;
  public _mittenti: Related[] | undefined;


  public enumOrigine: any = enumOrigine;

  // Variabili per le autocomplete
  public selectedMittente: Related;
  //public selectedMittente: Related | undefined | null;
  //public selectedOrigine: string = "";
  public indirizzo: string;
  public actualMezzo: Mezzo;
  public actualDataDiArrivo: Date;
  //public suggestionsOrigine: any[] = Object.values(OrigineRelated);
  public suggestionsMezzo: any[] = [];
  public filteredMittente: DettaglioContatto[] = [];
  //public filteredOrigine: any[] = [];
  public filteredMezzo: any[] = [];

  public actualOrigine: string ;


  @Input() set doc(value: Doc) {
    this._doc = value;
    if (this._doc.mittenti != null && this._doc.mittenti.length > 0) {
      this.actualMittente = this._doc.mittenti[0];
      this.selectedMittente = this._doc.mittenti[0];
      //this.setDescrizioneCustomMittente(this._doc.mittenti[0]);
      this.actualMezzo = this._doc.mittenti[0].spedizioneList[0].idMezzo;
      this.indirizzo = this._doc.mittenti[0].spedizioneList[0].indirizzo.completo;
      // this.actualDataDiArrivo = new Date(this._doc.mittenti[0].spedizioneList[0].data.toString().replace(/\[.+\/.+\]/gm, ""));
      this.actualDataDiArrivo = new Date(this._doc.mittenti[0].spedizioneList[0].data);
      // if (this._doc.mittenti[0].spedizioneList[0].data) {
      //   this.actualDataDiArrivo = this._doc.mittenti[0].spedizioneList[0].data.replace(/\[.+\/.+\]/gm, "");
      // }
      this.actualOrigine = this._doc.mittenti[0].origine
      console.log("data di arrivo", this.actualDataDiArrivo);
      //this.actualDataDiArrivo = new Date("2021-04-09T17:50:18+02:00");

      
      // let date = moment.tz("2020-02-08 10:58:00", "Europe/Berlin");
      // let localDate = moment.tz("2020-02-08 10:58:00", "Europe/Berlin").local();

      // console.log('Europe/Berlin', date.format());
      // console.log('Local', localDate.format());

      // let a = new Intl.DateTimeFormat("Europe/Berlin").format(new Date("2021-04-09T17:50:18"));
      // console.log(b);
    }
    else {
      this.selectedMittente = null;
      this.actualMezzo = null;
      this.indirizzo = "";
      this.actualOrigine= enumOrigine["ESTERNO"];

    }
    
  }

  public dateSelected(value: any) {
    const spedizione: Spedizione = new Spedizione();
    spedizione.id = this._doc.mittenti[0].spedizioneList[0].id;
    spedizione.data = value;
    spedizione.version = this._doc.mittenti[0].spedizioneList[0].version;

    const mittente: Related = new Related();
    mittente.id = this._doc.mittenti[0].id;
    mittente.spedizioneList = [spedizione];
    mittente.version = this._doc.mittenti[0].version;

    this.subscriptions.push(this.mittenteService.patchHttpCall(mittente, this._doc.mittenti[0].id, ENTITIES_STRUCTURE.scripta.related.standardProjections.RelatedWithSpedizioneList)
    .subscribe((res: Related) => {
      console.log(this._doc.mittenti[0]);
      console.log(res);
      this._doc.mittenti[0] = res;
      //this._doc.mittenti.splice(1, 0, res);
      //this._doc.mittenti.splice(0, 1, res);
      //this._doc.mittenti[0].spedizioneList.splice(0, res.spedizioneList.length, ...res.spedizioneList);
    }));
  }

  constructor(
    private mittenteService: ExtendedMittenteService,
    private mezzoService: MezzoService,
    private loginService: NtJwtLoginService,
    private dettaglioContattoService: DettaglioContattoService,
    private messageService: MessageService,
    private datePipe: DatePipe
  ) { }

  /**
   * Sottoscrizioni per:
   * 1- LoggedUser
   * 2- Elenco mezzi
   */
  ngOnInit(): void {
    //const a = this.datePipe.transform(this.actualDataDiArrivo, "yyyy-MM-dd'T'HH:mm:ss.SSSSSSXXX'['VV']'");

      //let a = moment.tz("2021-04-09T17:50:18.000000+02:00[Europe/Berlin]");
      // let b = moment.tz("2021-04-09T17:50:18.000000", "Europe/Berlin");
      // let c = moment.tz("2021-04-09T17:50:18.000000", "America/Toronto");
      // let d = moment.tz("2021-04-09T17:50:18.000000+02:00", "[Europe/Berlin]");
      //console.log(a);
    this.subscriptions.push(this.loginService.loggedUser$.subscribe((utenteUtilities: UtenteUtilities) => {
          this.loggedUtenteUtilities = utenteUtilities;
        })
    );
    this.subscriptions.push(this.mezzoService.getData().subscribe((data: any) => {
      if (data && data.results) {
        this.suggestionsMezzo = data.results;
      } else {
        this.suggestionsMezzo = [];
      }
    }));

    
  }

  /**
   * Si occupa della ricerca del mittente
   * @param event 
   */
  searchMittente(event: any) {
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
    filtersAndSorts.addFilter(new FilterDefinition("tipo", FILTER_TYPES.not_string.equals, TipoDettaglio.STRUTTURA));
    this.subscriptions.push(
      this.dettaglioContattoService.getData(projection, filtersAndSorts).subscribe(res => {
        if (res) {
          res.results.forEach((dettaglioContatto: DettaglioContatto) => {
            // @ts-ignore
            dettaglioContatto["descrizioneCustom"] = dettaglioContatto.idContatto.descrizione + " [ " + dettaglioContatto.descrizione + " ]";
          });
          this.filteredMittente = res.results;
        }
        else {
          console.log("blabla")
        }
      }, err => {
        this.messageService.add({
          severity: "error",
          summary: "Errore",
          detail: "Non è stato possibile fare la ricerca del mittente."
        });
      })
    );
  }

  /**
   * Salvo il nuovo mittente eventualmente cancellando il vecchio
   * @param event 
   */
  public saveMittente(event: DettaglioContatto) {
    const mittenteToCreate: Related = this.dettaglioContattoToRelated(event);
    const batchOperations: BatchOperation[] = [];
    if (this.actualMittente) {
      batchOperations.push({
        id: this.actualMittente.id,
        operation: BatchOperationTypes.DELETE,
        entityPath: BaseUrls.get(BaseUrlType.Scripta) + "/" + ENTITIES_STRUCTURE.scripta.related.path,
        entityBody: {
          id: this.actualMittente.id,
          version: this.actualMittente.version
        } as NextSdrEntity,
      } as BatchOperation);
    }
    batchOperations.push({
      operation: BatchOperationTypes.INSERT,
      entityPath:  BaseUrls.get(BaseUrlType.Scripta) + "/" + ENTITIES_STRUCTURE.scripta.related.path,
      entityBody: mittenteToCreate as NextSdrEntity,
      returnProjection: "CustomRelatedWithSpedizioneList"// ENTITIES_STRUCTURE.scripta.related.standardProjections.RelatedWithSpedizioneList
    } as BatchOperation);
    this.subscriptions.push(
      this.mittenteService.batchHttpCall(batchOperations).subscribe(
        (res: BatchOperation[]) => {
          const related = res.find(f => f.operation === BatchOperationTypes.INSERT).entityBody as Related;
          this._doc.mittenti = [];
          this._doc.mittenti.push(related);
          this.actualMittente = related;
          //this.setDescrizioneCustomMittente(this._doc.mittenti[0]);
          this.selectedMittente = related;
          this.actualMezzo = this._doc.mittenti[0].spedizioneList[0].idMezzo;
          this.indirizzo=  this._doc.mittenti[0].spedizioneList[0].indirizzo.completo;
          this.messageService.add({
            severity:'success', 
            summary:'Mittente', 
            detail: `Mittente inserito con successo`
          });
          
      })
    );
  }

  /**
   * A partire dal dettaglio contatto mi vado a creare un oggetto related con anche la relativa spedizione.
   * @param dettaglioContatto 
   * @returns 
   */
  private dettaglioContattoToRelated(dettaglioContatto: DettaglioContatto): Related {
    const mittenteRelated: Related = new Related();
    mittenteRelated.idContatto = {id: dettaglioContatto.idContatto.id} as Contatto;
    mittenteRelated.descrizione = dettaglioContatto.idContatto.descrizione;
    mittenteRelated.tipo = TipoRelated.MITTENTE;
    mittenteRelated.idPersonaInserente = {id: this.loggedUtenteUtilities.getUtente().idPersona.id} as Persona;
    mittenteRelated.idDoc = {id: this._doc.id} as Doc;
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

  /**
   * A partire da un dettaglio contatto creo un oggetto Spedizione
   * @param dettaglioContatto
   * @returns
   */
  private buildSpedizione(dettaglioContatto: DettaglioContatto): Spedizione {
    const spedizione: Spedizione = new Spedizione();

    spedizione.idDettaglioContatto = {id: dettaglioContatto.id } as DettaglioContatto;
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
      case TipoDettaglio.STRUTTURA:
        codiceMezzo = CodiceMezzo.BABEL;
        break;
      default:
        // TODO: lanciare errore
    }
    spedizione.indirizzo = indirizzo;
    spedizione.idMezzo = this.suggestionsMezzo.find(m => m.codice === codiceMezzo);
    return spedizione;
  }

  // public getIdMezzo(): Mezzo {
  //   return this._doc.mittenti[0].spedizioneList[0].idMezzo;
  // }

  /* public searchTipo(event: any): void {
    console.log(this.suggestionsOrigine);
    const filteredTipo: any[] = [];
    const query = event.query;
    this.suggestionsOrigine.forEach(currentsuggestion => {
      if (currentsuggestion.name.toLowerCase().indexOf(query.toLowerCase()) === 0) {
        filteredTipo.push(currentsuggestion);
      }
    });
    this.filteredOrigine = filteredTipo;
  } */

  /**
   * Metodo chiamato dall'html per cancellare un mittente.
   * 
   */
    public onDeleteMittente(): void{
      this.mittenteService.deleteHttpCall(this.actualMittente.id).subscribe(
        res => {
          this.messageService.add({
            severity:'success',
            summary:'Mittente',
            detail:'Mittente eliminato con successo'
          });
          this._doc.mittenti.splice(0, 1);

        }
      )
      this.actualMittente= null;
      this.actualMezzo = null;
      this.indirizzo = "";
      this.actualOrigine= enumOrigine["ESTERNO"];
    }

  /**
   * Suggerisco all'utente il mezzo in base a cosa sta scrivendo
   * @param event 
   */
  public searchMezzo(event: any): void {
    const filteredMezzo: any[] = [];
    const query = event.query;
    this.suggestionsMezzo.forEach(currentsuggestion => {
      if (currentsuggestion.descrizione.toLowerCase().indexOf(query.toLowerCase()) === 0) {
        filteredMezzo.push(currentsuggestion);
      }
    });
    this.filteredMezzo = filteredMezzo;
  }

  ngOnDestroy() {
    if (this.subscriptions && this.subscriptions.length > 0 ) {
      this.subscriptions.forEach(s => s.unsubscribe());
      this.subscriptions = [];
    }
  }
}

