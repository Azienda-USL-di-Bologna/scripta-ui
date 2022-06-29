import { Component, ElementRef, Input, OnDestroy, OnInit, Output, ViewChild, EventEmitter } from '@angular/core';
import { Archivio, AttoreArchivio, AttoreArchivioService, ENTITIES_STRUCTURE, Massimario, RuoloAttoreArchivio, Titolo, TitoloService, MassimarioService, ConfigurazioneService, ParametroAziende, TipoArchivio } from '@bds/ng-internauta-model';
import { NtJwtLoginService, UtenteUtilities } from '@bds/nt-jwt-login';
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

  private _archivio: Archivio;
  get archivio(): Archivio { return this._archivio; }
  @Input() set archivio(archivio: Archivio) {
    this._archivio = archivio;
    if (this.archivio.idTitolo) {
      this.selectedTitolo = this.buildNodeTitolo(this.archivio.idTitolo as Titolo);
    } else {
      this.selectedTitolo = null;
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
  public possibleAnniTenuta: any[] = [{name: "1", value: 1 },{name: "2", value: 2 },{name: "3", value: 3 },{name: "4", value: 4 },
    {name: "5", value: 5 },{name: "6", value: 6 },{name: "7", value: 7 },{name: "8", value: 8 },{name: "9", value: 9 },
    {name: "10", value: 10 },{name: "20", value: 20 },{name: "30", value: 30 },{name: "40", value: 40 },
    {name: "50", value: 50 }, {name: "60", value: 60 }, {name: "Illimitata", value: 999}];
  public anniTenutaSelezionabili: any[] = [];
  private utenteUtilitiesLogin: UtenteUtilities;
  public loggedUserIsResponsbaileOrVicario = false;
  private ARCHIVIO_PROJECTION: string = ENTITIES_STRUCTURE.scripta.archivio.customProjections.CustomArchivioWithIdAziendaAndIdMassimarioAndIdTitolo;

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
    private loginService: NtJwtLoginService,
    private navigationTabsService: NavigationTabsService) 
  {
    this.subscriptions.push(
      this.loginService.loggedUser$.subscribe(
        (utenteUtilities: UtenteUtilities) => {
          this.utenteUtilitiesLogin = utenteUtilities;
        }
      )
    );
  }

  ngOnInit(): void {
    console.log("Archivio test: ", this.archivio);
    this.updateAnniTenuta();
    this.getResponsabili();
    this.tipiArchivioObj.find(t => t.value === TipoArchivio.SPECIALE).disabled = true;
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

  private updateAnniTenuta() {
    if(this.archivio.anniTenuta === undefined) {
      this.anniTenutaSelezionabili = this.possibleAnniTenuta;
      console.log("Anni tenuta: ", this.anniTenutaSelezionabili);
      
    } else {
      this.possibleAnniTenuta.forEach(elem => {
        if(this.archivio.anniTenuta <= elem.value ) 
          this.anniTenutaSelezionabili.push(elem);
      });  
      console.log("Anni tenuta: ", this.anniTenutaSelezionabili);
    }
  }


  public changeVisibilita(): void {
    if (this.loggedUserIsResponsbaileOrVicario) {
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
          this.loggedUserIsResponsbaileOrVicario = this.responsabiliArchivi.some((attore: AttoreArchivio) => attore.idPersona.id === this.utenteUtilitiesLogin.getUtente().idPersona.id);
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
      this.subscriptions.push(
        this.extendedArchivioService.updateArchivio(archivio, [field], this.ARCHIVIO_PROJECTION).subscribe(
          (resArchivio: Archivio) => {
            this.archivio.version = resArchivio.version;
            if (field === "oggetto") {
              this.updateArchivio.emit(resArchivio);
            }
          }
        )
      );
    }, 350);
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
    filterAndsorts.addFilter(new FilterDefinition("titoli.id", FILTER_TYPES.not_string.equals, this.archivio.idTitolo.id));
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
    this.anniTenutaSelezionabili = [];
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
      this.updateAnniTenuta();
  }


  public onChangeTipo(): void {
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

  /**
   * Funzione che si occupa della numerazione di un archivio
   * @param event 
   */
  public numeraFasicoloClicked(event: Event): void {
    this.confirmationService.confirm({
      key: "confirm-popup",
      target: event.target,
      message: "Stai per numerare il fascicolo: confermi?",
      accept: () => {
        this.subscriptions.push(
          this.extendedArchivioService.numeraArchivio(
            this.archivio,
            this.ARCHIVIO_PROJECTION)
            .subscribe({
                next: (resArchivio: Archivio) => {
                  console.log("Archivio aggiornato", resArchivio);
                  this.archivio.version = resArchivio.version;
                  this.archivio.numerazioneGerarchica = resArchivio.numerazioneGerarchica;
                  this.archivio.stato = resArchivio.stato;
                  this.navigationTabsService.addTabArchivio(resArchivio, true, true);
                  this.updateArchivio.emit(resArchivio);
                  this.messageService.add({
                    severity: "success",
                    key: "dettaglioArchivioToast",
                    summary: "OK",
                    detail: `${resArchivio.numerazioneGerarchica}: Numerazione avvenuta con successo`
                  });
                },
                error: (e) => {
                  console.error(e);
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
