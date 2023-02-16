import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from "@angular/core";
import { BaseUrls, BaseUrlType, CategoriaContatto, Contatto, ContattoService, DettaglioContatto, Doc, ENTITIES_STRUCTURE, OrigineRelated, Persona, Related, TipoContatto, TipoRelated } from "@bds/internauta-model";
import { JwtLoginService, UtenteUtilities } from "@bds/jwt-login";
import { AdditionalDataDefinition, BatchOperation, BatchOperationTypes, FilterDefinition, FiltersAndSorts, FILTER_TYPES, NextSdrEntity } from "@bds/next-sdr";
import { MessageService } from 'primeng/api';
import { AutoComplete } from "primeng/autocomplete";
import { Subscription } from "rxjs";

import {ExtendedDestinatariService} from "./extended-destinatari.service";

@Component({
  selector: "destinatari",
  templateUrl: "./destinatari.component.html",
  styleUrls: ["./destinatari.component.scss"]
})
export class DestinatariComponent implements OnInit, AfterViewInit, OnDestroy {
  private subscriptions: Subscription[] = [];
  private loggedUtenteUtilities: UtenteUtilities;
  public actualCompetente: Related;

  public columnCoinvolti: any[] = [];
  private _doc: Doc;
  public selectedCompetente: Related;
  public selectedCoinvolto: Related;
  
  public filteredCompetenti: DettaglioContatto[];
  public filteredCoinvolti: DettaglioContatto[];

  private _pregresso: boolean = true; //TODO: ovviamente cambiare
  public get pregresso(): boolean {
    return this._pregresso;
  }
  @Input() public set pregresso(value: boolean) {
    this._pregresso = value;
  }

  @ViewChild('autocompleteCompetenti') autocompleteCompetenti: AutoComplete;
  @ViewChild('autocompleteCoinvolti') autocompleteCoinvolti: AutoComplete;


  get doc() {
    return this._doc;
  }
  @Input() set doc(value: Doc) {
    this._doc = value;
    if (!!this.doc.competenti && this.doc.competenti.length > 0) {
      console.log("sto settando il competente")
      this.actualCompetente = this.doc.competenti[0];
      this.selectedCompetente = this.doc.competenti[0];
    }
    // if ( value && value.competenti && value.competenti.length > 0 ) {
    //   this.selectedCompetente = value.competenti[0];
    //   this._doc = value;
    // } else {
    //   this.selectedCompetente = null;
    // }
  }

  // @Output() saveMittenteEvent = new EventEmitter<Doc>();

  constructor(
    private destinatariService: ExtendedDestinatariService,
    private loginService: JwtLoginService,
    private contattoService: ContattoService,
    /* private extendedDocService: ExtendedDocService, */
    private messageService: MessageService,
    ) {
      this.columnCoinvolti = [
        { field: "descrizione", header: "Struttura" },
      ];
  }

  ngOnInit(): void {
    this.subscriptions.push(this.loginService.loggedUser$.subscribe((utenteUtilities: UtenteUtilities) => {
      this.loggedUtenteUtilities = utenteUtilities;
      })
    );
  }

  ngAfterViewInit(): void {
    /* 
      Questo codice da completare servirebbe nel caso si voglia cancellare il dato del competente quando l'utente clicca sulla x.
      Il dubbio che ho è che non vogliano la x del type="search"
      this.autocompleteCompetenti.el.nativeElement.onsearch = (event: any) => {
      console.log(event);
      if (event.srcElement.value === "") {

      }
    }; */
  }

  public searchDestinatario(event: any, modalita: string) {
    if (this.doc) {
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
      filtersAndSorts.addFilter(new FilterDefinition("idStruttura.idAzienda.id", FILTER_TYPES.not_string.equals, this.doc.idAzienda.id));
      this.subscriptions.push(
          this.contattoService.getData(projection, filtersAndSorts).subscribe(res => {
            if (res) {
            console.log(res.results)
              res.results.forEach((contatto: Contatto) => {
                // @ts-ignore
                contatto["descrizioneCustom"] = contatto.descrizione;
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
  }

  /**
   * Chiamato dal frontend per salvare il destinatario passato
   * @param contatto 
   * @param modalita 
   */
  public saveDestinatario(contatto: Contatto, modalita: string) {
    switch (modalita) {
      case "competente":
        // this._doc.competenti = [];
        this.insertRelated(this.contattoToRelated(contatto, TipoRelated.A), modalita);
      break;
      case "coinvolto":
        this.insertRelated(this.contattoToRelated(contatto, TipoRelated.CC), modalita);
      break;
    }
  }
  
  /**
   * Esegue la save sul db del related passato, nel caso del competente elimina il vecchio.
   * @param relatedToCreate 
   * @param modalita 
   */
  private insertRelated(relatedToCreate: Related, modalita: string): void {
    const batchOperations: BatchOperation[] = [];
    if (modalita === "competente" && this.actualCompetente) {
      batchOperations.push({
        id: this.actualCompetente.id,
        operation: BatchOperationTypes.DELETE,
        entityPath: BaseUrls.get(BaseUrlType.Scripta) + "/" + ENTITIES_STRUCTURE.scripta.related.path,
        entityBody: {
          id: this.actualCompetente.id,
          version: this.actualCompetente.version
        } as NextSdrEntity,
      } as BatchOperation);
    } 
    batchOperations.push({
      operation: BatchOperationTypes.INSERT,
      entityPath: BaseUrls.get(BaseUrlType.Scripta) + "/" + ENTITIES_STRUCTURE.scripta.related.path,
      entityBody: relatedToCreate as NextSdrEntity,
    } as BatchOperation);
    this.subscriptions.push(
      this.destinatariService.batchHttpCall(batchOperations).subscribe(
        (res: BatchOperation[]) => {
          const related = res.find(f => f.operation === BatchOperationTypes.INSERT).entityBody as Related;
          switch (modalita) {
            case "competente":
              this.doc.competenti = [];
              this.doc.competenti.push(related);
              this.actualCompetente = related;
            break;
            case "coinvolto":
              this.doc.coinvolti.push(related);
              this.autocompleteCoinvolti.writeValue(null);
            break;
          }
          this.messageService.add({
            severity:'success', 
            summary:'Struttura destinataria', 
            detail: `Destinatario ${modalita} inserito con successo`
          });
      })
    );
  }

  /**
   * Questo metodo converte un Contatto della rubrica in un Related di scripta
   * @param contatto 
   * @param tipo 
   * @returns 
   */
  private contattoToRelated(contatto: Contatto, tipo: TipoRelated): Related {
    const destinatario: Related = new Related();
    destinatario.idContatto = {id: contatto.id} as Contatto;
    destinatario.descrizione = contatto.descrizione;
    destinatario.tipo = tipo;
    destinatario.idPersonaInserente = {id: this.loggedUtenteUtilities.getUtente().idPersona.id} as Persona;
    destinatario.origine = OrigineRelated.INTERNO;
    destinatario.idDoc = {id: this.doc.id} as Doc;
    return destinatario;
  }

  /**
   * Metodo chiamato dall'html per cancellare un destinatario.
   * @param related 
   */
  public onDeleteRelated(related: Related, rowIndex: number): void {
    this.destinatariService.deleteHttpCall(related.id).subscribe(
      res => {
        this.messageService.add({
          severity:'success', 
          summary:'Struttura destinatari', 
          detail:'Struttura destinataria eliminata con successo'
        });
        this.doc.coinvolti.splice(rowIndex, 1);
      }
    );
  }

  /**
   * Metodo chiamato dall'html per cancellare un destinatario competente.
   * 
   */
   public onDeleteCompetente(): void{
    this.destinatariService.deleteHttpCall(this.actualCompetente.id).subscribe(
      res => {
        this.messageService.add({
          severity:'success',
          summary:'Competente',
          detail:'Competente eliminato con successo'
        });
        this.doc.competenti.splice(0, 1)
      }
    )
    this.actualCompetente = null;
    this.selectedCompetente = null;
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
