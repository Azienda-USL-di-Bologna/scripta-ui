import { Component, ElementRef, Input, OnDestroy, OnInit, Output, ViewChild, EventEmitter } from '@angular/core';
import { NgModel } from '@angular/forms';
import { Archivio, ArchivioDetail, AttoreArchivio, AttoreArchivioService, ENTITIES_STRUCTURE, Massimario, RuoloAttoreArchivio, Titolo, TitoloService, MassimarioService, TipoArchivio, ConfigurazioneService, ParametroAziende } from '@bds/ng-internauta-model';
import { FilterDefinition, FiltersAndSorts, FILTER_TYPES, PagingConf, SortDefinition, SORT_MODES } from '@nfa/next-sdr';
import { ConfirmationService, MessageService } from 'primeng/api';
import { TreeNode } from 'primeng/api/treenode';
import { TreeSelect } from 'primeng/treeselect';
import { Subscription } from 'rxjs/internal/Subscription';
import { TipoArchivioTraduzioneVisualizzazione } from 'src/app/archivi-list-container/archivi-list/archivi-list-constants';
import { NavigationTabsService } from 'src/app/navigation-tabs/navigation-tabs.service';
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
    if (this.archivio.idTitolo) {
      this.selectedTitolo = this.buildNodeTitolo(this.archivio.idTitolo as Titolo);
    }
    this.loadConfigurations();
  }
  private pageConfNoCountNoLimit: PagingConf = { mode: "LIMIT_OFFSET_NO_COUNT", conf: { limit: 9999, offset: 0 } };
  private pageConfNoCountLimit20: PagingConf = { mode: "LIMIT_OFFSET_NO_COUNT", conf: { limit: 20, offset: 0 } };
  public responsabiliArchivi: AttoreArchivio[] = [];
  public subscriptions: Subscription[] = [];
  public colsResponsabili: any[];
  private savingTimeout: ReturnType<typeof setTimeout> | undefined;
  public selectedClassificazione: TreeNode;
  public selectedArchivioCollegato: Archivio;
  public titoli: TreeNode[];
  public selectedTitolo: TreeNode;
  public filteredMassimari: Massimario[] = [];
  public filteredTitoli: Titolo[] = [];
  public tipiArchivioObj: any[] = TipoArchivioTraduzioneVisualizzazione;
  private classificazioneAllaFoglia: boolean = false;

  public possibleAnniTenuta: any[] = [{ name: "1 anno", value: 1 }, { name: "2 anni", value: 2 }, { name: "3 anni", value: 3 }, { name: "4 anni", value: 4 }, { name: "5 anni", value: 5 }, { name: "6 anni", value: 6 },
  { name: "7 anni", value: 7 }, { name: "8 anni", value: 8 }, { name: "9 anni", value: 9 }, { name: "10 anni", value: 10 }, { name: "20 anni", value: 20 }, { name: "30 anni", value: 30 }, { name: "40 anni", value: 40 },
  { name: "50 anni", value: 50 }, { name: "Illimitata", value: 999 }];

  @ViewChild("noteArea") public noteArea: ElementRef;
  @ViewChild("titoliTreeSelect") public titoliTreeSelect: TreeSelect;
  @Output() public updateArchivio = new EventEmitter<Archivio>();

  constructor(
    private attoreArchivioService: AttoreArchivioService,
    private extendedArchivioService: ExtendedArchivioService,
    private titoloService: TitoloService,
    private massimarioService: MassimarioService,
    private messageService: MessageService,
    private configurazioneService: ConfigurazioneService,
    private confirmationService: ConfirmationService,
    private navigationTabsService: NavigationTabsService) {

  }

  ngOnInit(): void {
    this.getResponsabili();
  }

  private loadConfigurations() {
    this.subscriptions.push(
      this.configurazioneService.getParametriAziende("classificazioneAllaFoglia", null, [this.archivio.fk_idAzienda.id]).subscribe(
        (parametriAziende: ParametroAziende[]) => {
          if (parametriAziende && parametriAziende[0]) {
            this.classificazioneAllaFoglia = JSON.parse(parametriAziende[0].valore || false);
          }
        }
      )
    );
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
          if (this.archivio.riservato == true) {
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
            detail: `Si è verificato un errore nella modifica del campo riservato, contattare Babelcare`
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
    filterAndSort.addFilter(new FilterDefinition("idArchivio.id", FILTER_TYPES.not_string.equals, this.archivio.id));
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
   * Metodo invcato dall'apertura del treeselect delle classificazioni o all'expand di un nodo.
   * Caroca i titoli dell'azienda dell'archivio
   * Se nessun parametro è passato carica le classificazioni di livello 1
   * Se è passato il parametro event.node allora stiamo espandendo quel nodo e quindi verranno chiesti i figli.
   */
  public onShowTitoli(event?: any): void {
    const node = event ? event.node : undefined;
    const filterAndsorts: FiltersAndSorts = new FiltersAndSorts();

    if (node) {
      if (node.children) return; // Figli già caricati per questo nodo, non serve fare altro
      filterAndsorts.addFilter(new FilterDefinition("idTitoloPadre", FILTER_TYPES.not_string.equals, (node.data as Titolo).id));
      filterAndsorts.addFilter(new FilterDefinition("livello", FILTER_TYPES.not_string.equals, (node.data as Titolo).livello + 1));
    } else {
      if (this.titoli && this.titoli.length > 0) return; // Titoli livello 1 già caricati. Non serve ricaricarli
      filterAndsorts.addFilter(new FilterDefinition("livello", FILTER_TYPES.not_string.equals, 1));
    }

    filterAndsorts.addFilter(new FilterDefinition("idAzienda.id", FILTER_TYPES.not_string.equals, this.archivio.fk_idAzienda.id));
    filterAndsorts.addFilter(new FilterDefinition("chiuso", FILTER_TYPES.not_string.equals, false));
    filterAndsorts.addSort(new SortDefinition("classificazione", SORT_MODES.asc));

    this.subscriptions.push(this.titoloService.getData(null, filterAndsorts, null, this.pageConfNoCountNoLimit).subscribe(
      res => {
        if (res && res.results) {
          const nodes: TreeNode[] = [];
          res.results.forEach((t: Titolo) => {
            nodes.push(this.buildNodeTitolo(t));
          });
          if (node) {
            node.children = nodes;
            this.titoliTreeSelect.nodeExpand(event); // Di fatto ritriggero questo metodo per espadnere bene il nodo. Ma se non faccio così non funziona
          } else {
            this.titoli = nodes;
          }
        } else if (node) {
          // non ho trovato figli del nodo allora lo metto non espandibile
          node.leaf = false;
          node.selectable = true;
        }

        this.titoliTreeSelect.expandedNodes.forEach(element => {
          console.log(element.label)
        });
      }
    ));
  }

  /**
   * Dato un titolo creo il corretto nodo che lo rappresenta
   * @param titolo 
   * @returns 
   */
  private buildNodeTitolo(titolo: Titolo): TreeNode {
    const node: TreeNode = {};
    let inizioLabel;
    switch (titolo.livello) {
      case 1:
        inizioLabel = "Categoria";
        node.leaf = false;
        node.selectable = !this.classificazioneAllaFoglia;
        break;
      case 2:
        inizioLabel = "Classe";
        node.leaf = false;
        node.selectable = !this.classificazioneAllaFoglia;
        break;
      case 3:
        inizioLabel = "Sottoclasse";
        node.leaf = true;
        node.selectable = true;
        break;
    }
    node.label = inizioLabel + " " + titolo.classificazione + ": " + titolo.nome;
    node.data = titolo;
    node.key = titolo.id.toString();
    node.expandedIcon = "pi pi-folder-open";
    node.collapsedIcon = "pi pi-folder";
    node.expanded = false;
    return node;
  }

  public filterTitoli(event: any): void {
    const filterAndsorts: FiltersAndSorts = new FiltersAndSorts();
    filterAndsorts.addFilter(new FilterDefinition("idAzienda.id", FILTER_TYPES.not_string.equals, this.archivio.fk_idAzienda.id));
    filterAndsorts.addFilter(new FilterDefinition("chiuso", FILTER_TYPES.not_string.equals, false));
    if (this.classificazioneAllaFoglia) {
      filterAndsorts.addFilter(new FilterDefinition("livello", FILTER_TYPES.not_string.equals, 3));
    }
    filterAndsorts.addFilter(new FilterDefinition("nome", FILTER_TYPES.string.containsIgnoreCase, event.query));
    filterAndsorts.addSort(new SortDefinition("classificazione", SORT_MODES.asc));
    this.subscriptions.push(this.titoloService.getData(null, filterAndsorts, null, this.pageConfNoCountNoLimit).subscribe(
      res => {
        if (res && res.results) {
          this.filteredTitoli = res.results;
        }
      }
    ));
  }

  public onSelectTitolo(titolo: Titolo) {
    const archivioToUpdate: Archivio = new Archivio();
    archivioToUpdate.idTitolo = {
      id: titolo.id
    } as Titolo;
    archivioToUpdate.version = this.archivio.version;
    this.subscriptions.push(this.extendedArchivioService.patchHttpCall(archivioToUpdate, this.archivio.id, null, null)
      .subscribe(
        res => {
          console.log("Update archivio: ", res);
          this.archivio.version = res.version;
          this.archivio.idTitolo = titolo;
          this.selectedTitolo = this.buildNodeTitolo(titolo);
        }
      ))
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
    this.patchArchivio(archivioToUpdate);
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
    this.patchArchivio(archivioToUpdate);
  }

  /**
   * Un semplice update dell'archivio così come passato. Viene aggiornato poi il version
   * @param archivioToUpdate 
   */
  public patchArchivio(archivioToUpdate: Archivio): void {
    this.subscriptions.push(this.extendedArchivioService.patchHttpCall(archivioToUpdate, this.archivio.id, null, null)
      .subscribe(
        res => {
          console.log("Update archivio: ", res);
          this.archivio.version = res.version;
        }
      ));
  }

  public disableNumeraButton(): boolean {
    return !this.archivio?.oggetto || !this.archivio.tipo || !this.archivio.idTitolo
  }

  private numeraAndAggiorna(archivio: Archivio | ArchivioDetail) {
    this.subscriptions.push(
      this.extendedArchivioService.numeraArchivio(archivio,
        ENTITIES_STRUCTURE.scripta.archivio.customProjections.CustomArchivioWithIdAziendaAndIdMassimarioAndIdTitolo)
        .subscribe(
          {
            next: (res) => {
              console.log("Archivio aggiornato", res)
              const updated: Archivio | ArchivioDetail = res;
              this.archivio.version = res.version;
              this.archivio.numerazioneGerarchica = res.numeraAndAggiorna;
              this.archivio.stato = res.stato;
              this.navigationTabsService.addTabArchivio(res, true)
              this.updateArchivio.emit(res);
              this.messageService.add({
                severity: "success",
                key: "dettaglioArchivioToast",
                summary: "OK",
                detail: `${res.numerazioneGerarchica}: Numerazione avvenuta con successo`
              });
            },
            error: (e) => {
              console.error(e)
              this.messageService.add({
                severity: "error",
                key: "dettaglioArchivioToast",
                summary: "Attenzione",
                detail: `Si è verificato un errore nella numerazione dell'archivio, contattare Babelcare`
              });
            }
          }
        )
    );

  }


  public numeraFasicoloClicked(): void {

    this.confirmationService.confirm({
      key: "confirm-popup",
      target: event.target,
      message: "Stai per numerare il fascicolo: confermi?",
      accept: () => {
        console.log("CONFERMATO");
        this.numeraAndAggiorna(this._archivio)
      }
    });
  }

  public ngOnDestroy(): void {
    if (this.subscriptions) {
      this.subscriptions.forEach(
        s => s.unsubscribe()
      );
    }
    this.subscriptions = [];
  }


}
