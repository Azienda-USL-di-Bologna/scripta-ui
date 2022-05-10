import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NgModel } from '@angular/forms';
import { Archivio, ArchivioDetail, AttoreArchivio, AttoreArchivioService, ENTITIES_STRUCTURE, Massimario, RuoloAttoreArchivio, Titolo, TitoloService, MassimarioService, TipoArchivio } from '@bds/ng-internauta-model';
import { FilterDefinition, FiltersAndSorts, FILTER_TYPES, PagingConf, SortDefinition, SORT_MODES } from '@nfa/next-sdr';
import { MessageService } from 'primeng/api';
import { TreeNode } from 'primeng/api/treenode';
import { InputTextarea } from 'primeng/inputtextarea';
import { Subscription } from 'rxjs/internal/Subscription';
import { TipoArchivioTraduzioneVisualizzazione } from 'src/app/archivi-list-container/archivi-list/archivi-list-constants';
import { ExtendedArchivioService } from '../extended-archivio.service';

@Component({
  selector: 'dettaglio-archivio',
  templateUrl: './dettaglio-archivio.component.html',
  styleUrls: ['./dettaglio-archivio.component.scss']
})
export class DettaglioArchivioComponent implements OnInit, OnDestroy { 

  private _archivio: Archivio | ArchivioDetail;
  get archivio(): Archivio | ArchivioDetail { return this._archivio; }
  @Input() set archivio(archivio: Archivio | ArchivioDetail) {
    this._archivio = archivio;
  }
  private pageConfNoCountNoLimit: PagingConf = { mode: "LIMIT_OFFSET_NO_COUNT", conf: { limit: 9999, offset: 0 } };
  private pageConfNoCountLimit20: PagingConf = { mode: "LIMIT_OFFSET_NO_COUNT", conf: { limit: 20, offset: 0 } };
  public responsabiliArchivi: AttoreArchivio[] = [];
  public subscriptions: Subscription[] = [];
  public colsResponsabili : any[];
  private savingTimeout: ReturnType<typeof setTimeout> | undefined;
  public selectedClassificazione: TreeNode;
  public selectedArchivioCollegato: Archivio;
  public titoli: Titolo[] = [];
  public filteredMassimari: Massimario[] = [];
  public tipiArchivioObj: any[];
  public possibleAnniTenuta: any[] = [{name: "1 anno", value: 1 },{name: "2 anni", value: 2 },{name: "3 anni", value: 3 },{name: "4 anni", value: 4 },{name: "5 anni", value: 5 },{name: "6 anni", value: 6 },
  {name: "7 anni", value: 7 },{name: "8 anni", value: 8 },{name: "9 anni", value: 9 },{name: "10 anni", value: 10 },{name: "20 anni", value: 20 },{name: "30 anni", value: 30 },{name: "40 anni", value: 40 },
  {name: "50 anni", value: 50 }, {name: "Illimitata", value: 999}];

  @ViewChild("noteArea") public noteArea: ElementRef;
  @ViewChild("conservazioneMask") public ngModelConservazione: NgModel;

  constructor(
    private attoreArchivioService: AttoreArchivioService, 
    private extendedArchivioService: ExtendedArchivioService,
    private titoloService: TitoloService,
    private massimarioService: MassimarioService,
    private messageService: MessageService,) {

  }

  ngOnInit(): void {
    this.getResponsabili();
    this.tipiArchivioObj = TipoArchivioTraduzioneVisualizzazione;
  }

  public changeVisibilita(): void {
    this.archivio.riservato = !(this.archivio.riservato);
    const archivioToUpdate: Archivio = new Archivio();
    archivioToUpdate.riservato = this.archivio.riservato
    archivioToUpdate.version = this.archivio.version;
    this.subscriptions.push(this.extendedArchivioService.patchHttpCall(archivioToUpdate, this.archivio.id, null, null)
    .subscribe(
      res => {
        console.log("Update archivio: ", res);
        this.archivio.version = res.version;
        let message: string;
        if(this.archivio.riservato == true) {
          message = `Impostato come Riservato correttamente`
        } else {
          message = `Impostato come Non-Riservato correttamente`
        }
        this.messageService.add({
          severity: "success",
          key: "dettaglioArchivioToast",
          summary: "OK",
          detail: message
        });
      },
      err => {
        this.messageService.add({
          severity: "error",
          key: "dettaglioArchivioToast",
          summary: "Attenzione",
          detail: `Si è verificato un errore nella modifica del camporiservato, contattare Babelcare`
        });
      }
    ))

  }


  /**
   * Questa funzione carica i responsabili dell'archivio 
   * ordinati per ruolo
   */
  private getResponsabili(): void {
    const filterAndSort: FiltersAndSorts = new FiltersAndSorts();
    filterAndSort.addFilter(new FilterDefinition("idArchivio.id",  FILTER_TYPES.not_string.equals, this.archivio.id));
    filterAndSort.addFilter(new FilterDefinition("ruolo", FILTER_TYPES.not_string.equals, RuoloAttoreArchivio.RESPONSABILE));
    filterAndSort.addFilter(new FilterDefinition("ruolo", FILTER_TYPES.not_string.equals, RuoloAttoreArchivio.VICARIO));
    filterAndSort.addFilter(new FilterDefinition("ruolo", FILTER_TYPES.not_string.equals, RuoloAttoreArchivio.RESPONSABILE_PROPOSTO));
    filterAndSort.addSort(new SortDefinition("ruolo", SORT_MODES.asc));
    this.subscriptions.push(this.attoreArchivioService.getData(
      ENTITIES_STRUCTURE.scripta.attorearchivio.standardProjections.AttoreArchivioWithIdPersonaAndIdStruttura,
      filterAndSort,
      null, 
      this.pageConfNoCountNoLimit).subscribe(
      res => {
        console.log(res.results);
        this.responsabiliArchivi = res.results;
      }
    ));
  }

   /**
   * Parte un timeout al termine del quale viene salvato il campo della firma specificato
   * @param doc
   * @param field
   */
  public timeOutAndSaveArchivio(archivio: Archivio, field: keyof Archivio) {
    if (this.savingTimeout) {
      clearTimeout(this.savingTimeout);
    }
    this.savingTimeout = setTimeout(() => {
      this.subscriptions.push(this.extendedArchivioService.updateArchivio(archivio, [field], null).subscribe(res => this.archivio.version = res.version));
    }, 500);
  }

  /**
   * Metodo invcato dall'apertura del treeselect delle classificazioni
   * Carica le prime classificazioni se non sono già state caricate
   */
  public onShowTitoli(): void {
    const filterAndsorts: FiltersAndSorts = new FiltersAndSorts();
    filterAndsorts.addFilter(new FilterDefinition("idAzienda.id", FILTER_TYPES.not_string.equals, this.archivio.fk_idAzienda.id))
    this.subscriptions.push(this.titoloService.getData(null, filterAndsorts, null, this.pageConfNoCountNoLimit)
    .subscribe(
      res => {
        console.log("res", res);
      }
    ));
  }

  /**
   * Metodo che serve per filtrare le categorie.
   * Riempie la proprietà filteredMassimari
   */
  public filterMassimario(event: any): void {
    console.log("event", event)
    const filterAndsorts: FiltersAndSorts = new FiltersAndSorts();
    filterAndsorts.addFilter(new FilterDefinition("idAzienda.id", FILTER_TYPES.not_string.equals, this.archivio.fk_idAzienda.id));
    filterAndsorts.addFilter(new FilterDefinition("nome", FILTER_TYPES.string.containsIgnoreCase, event.query));
    this.subscriptions.push(this.massimarioService.getData(null, filterAndsorts, null, this.pageConfNoCountLimit20)
    .subscribe(
      res => {
        console.log("res", res);
        this.filteredMassimari = res.results;
      }
    ));
  }

  public onSelectMassimario(massimario: Massimario): void {
    console.log("onSelectMassimario: ", event);
    const archivioToUpdate: Archivio = new Archivio();
    archivioToUpdate.idMassimario = {
      id: massimario.id
    } as Massimario;
    archivioToUpdate.anniTenuta = massimario.anniTenuta;
    archivioToUpdate.version = this.archivio.version;
    this.subscriptions.push(this.extendedArchivioService.patchHttpCall(archivioToUpdate, this.archivio.id, null, null)
    .subscribe(
      res => {
        console.log("Update archivio: ", res);
        this.archivio.version = res.version;
      }
    ))
    
  }

  public saveAnniTenuta(anni: any): void {
    console.log("selezionata anni tenuta fascicolo ", anni)
    const archivioToUpdate: Archivio = new Archivio();
    archivioToUpdate.anniTenuta = anni;
    archivioToUpdate.version = this.archivio.version;
    this.subscriptions.push(this.extendedArchivioService.patchHttpCall(archivioToUpdate, this.archivio.id, null, null)
    .subscribe(
      res => {
        console.log("Update archivio: ", res);
        this.archivio.version = res.version;
      }
    ))
  }


  public changeTipo(): void {
    const archivioToUpdate: Archivio = new Archivio();
    archivioToUpdate.tipo = this.archivio.tipo;
    archivioToUpdate.version = this.archivio.version;
    this.subscriptions.push(this.extendedArchivioService.patchHttpCall(archivioToUpdate, this.archivio.id, null, null)
    .subscribe(
      res => {
        console.log("Update archivio: ", res);
        this.archivio.version = res.version;
      }
    ))
  }

  public ngOnDestroy(): void {
    if (this.subscriptions) {
      this.subscriptions.forEach(
        s => s.unsubscribe()
      );
    }
    this.subscriptions = [];
  }

  public numeraFasicoloClicked(){
    this.messageService.add({
      severity: "warn",
      key: "dettaglioArchivioToast",
      summary: "Attenzione",
      detail: `Questo non è un pulsante operativo per il momento!`
    });
  }

 
}
