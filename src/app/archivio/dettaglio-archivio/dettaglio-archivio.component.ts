import { Component, ElementRef, Input, OnDestroy, OnInit, Output, ViewChild, EventEmitter } from '@angular/core';
import { Archivio, AttoreArchivio, AttoreArchivioService, ENTITIES_STRUCTURE, Massimario, RuoloAttoreArchivio, Titolo, TitoloService, MassimarioService, ConfigurazioneService, ParametroAziende, TipoArchivio, BaseUrls, BaseUrlType, Attivita, Applicazione, Persona, Azienda, AttivitaService, AttivitaFatta } from '@bds/internauta-model';
import { JwtLoginService, UtenteUtilities } from '@bds/jwt-login';
import { FilterDefinition, FiltersAndSorts, FILTER_TYPES, PagingConf, SortDefinition, SORT_MODES , BatchOperation, NextSdrEntity, BatchOperationTypes} from '@bds/next-sdr';
import { ConfirmationService, MessageService } from 'primeng/api';
import { TreeNode } from 'primeng/api/treenode';
import { TreeSelect } from 'primeng/treeselect';
import { Subscription } from 'rxjs/internal/Subscription';
import { AppService } from 'src/app/app.service';
import { TipoArchivioTraduzioneVisualizzazione } from 'src/app/archivi-list-container/archivi-list/archivi-list-constants';
import { NavigationTabsService } from 'src/app/navigation-tabs/navigation-tabs.service';
import { ArchivioFieldUpdating, ArchivioUtilsService } from '../archivio-utils.service';
import { ExtendedArchivioService } from '../extended-archivio.service';
import { PermessiDettaglioArchivioService } from './permessi-dettaglio-archivio.service';

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
  public aziendeConFascicoliParlanti: number[];
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
  loggedUserIsResponsbaileProposto = false;
  public fascicoliParlanti: boolean = false;
  private ARCHIVIO_PROJECTION: string = ENTITIES_STRUCTURE.scripta.archivio.customProjections.CustomArchivioWithIdAziendaAndIdMassimarioAndIdTitolo;
  private attoreArchivioProjection = ENTITIES_STRUCTURE.scripta.attorearchivio.standardProjections.AttoreArchivioWithIdPersonaAndIdStruttura;


  @ViewChild("noteArea") public noteArea: ElementRef;
  @ViewChild("titoliTreeSelect") public titoliTreeSelect: TreeSelect;
  @Output() public updateArchivio = new EventEmitter<Archivio>();

  constructor(
    private extendedArchivioService: ExtendedArchivioService,
    private titoloService: TitoloService,
    private appService: AppService,
    private massimarioService: MassimarioService,
    private messageService: MessageService,
    private configurazioneService: ConfigurazioneService,
    private confirmationService: ConfirmationService,
    private loginService: JwtLoginService,
    private navigationTabsService: NavigationTabsService,
    private archivioUtilsService: ArchivioUtilsService,
    private permessiDettaglioArchivioService: PermessiDettaglioArchivioService,
    private attoreArchivioService: AttoreArchivioService,
    private attivitaService: AttivitaService) 
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
    // this.getResponsabili();
    this.loggedUserIsResponsbaileOrVicario = (this.archivio["attoriList"] as AttoreArchivio[])
    .some(a => a.idPersona.id === this.utenteUtilitiesLogin.getUtente().idPersona.id 
    && (a.ruolo === RuoloAttoreArchivio.RESPONSABILE 
      || a.ruolo === RuoloAttoreArchivio.VICARIO 
      || a.ruolo === RuoloAttoreArchivio.RESPONSABILE_PROPOSTO));
      this.tipiArchivioObj.find(t => t.value === TipoArchivio.SPECIALE).disabled = true;
     this.loggedUserIsResponsbaileProposto = (this.archivio["attoriList"] as AttoreArchivio[]).some(a => a.idPersona.id === this.utenteUtilitiesLogin.getUtente().idPersona.id  && (a.ruolo === RuoloAttoreArchivio.RESPONSABILE_PROPOSTO));
    this.loadParametroAziendaleFascicoliParlanti()
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

  private loadParametroAziendaleFascicoliParlanti(){
    this.subscriptions.push(this.configurazioneService.getParametriAziende("fascicoliParlanti", null, null).subscribe((parametriAziende: ParametroAziende[]) => {
      //parte relativa al parametro aziendale
      if (parametriAziende && parametriAziende[0]) {
        this.fascicoliParlanti = JSON.parse(parametriAziende[0].valore || false);
        if (this.fascicoliParlanti) {
          this.aziendeConFascicoliParlanti = parametriAziende[0].idAziende;
        }
      }
    }));
  }


  public changeVisibilita(): void {
    if (this.loggedUserIsResponsbaileOrVicario && !this.aziendeConFascicoliParlanti.includes(this.archivio.idAzienda.id)) {
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
  /* private getResponsabili(): void {
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
  } */

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
              this.archivioUtilsService.updateArchivioFieldSelection({field: field, archivio: this.archivio} as ArchivioFieldUpdating);
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
    node.expandedIcon = "pi pi-tag";
    node.collapsedIcon = "pi pi-tags";
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
                  this.appService.appNameSelection(`Fascicolo ${resArchivio.numerazioneGerarchica} [${resArchivio.idAzienda.aoo}]`);
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

  public accettaResponsabilita() {
  
    const batchOperations: BatchOperation[] = [];
    const responsabilePropostoVecchio = this.archivio.attoriList.find((a: AttoreArchivio) => a.ruolo === "RESPONSABILE_PROPOSTO" );
    const attoreArchivioBody = new AttoreArchivio();
    attoreArchivioBody.id = responsabilePropostoVecchio.id;
    attoreArchivioBody.ruolo = RuoloAttoreArchivio.RESPONSABILE;
    attoreArchivioBody.version = responsabilePropostoVecchio.version;
        
    batchOperations.push({
      operation: BatchOperationTypes.UPDATE,
      entityPath: BaseUrls.get(BaseUrlType.Scripta) + "/" + ENTITIES_STRUCTURE.scripta.attorearchivio.path,
      id: attoreArchivioBody.id,
      entityBody: attoreArchivioBody as NextSdrEntity,
      returnProjection: this.attoreArchivioProjection
    } as BatchOperation);
   
    const responsabileVecchio =  this.archivio.attoriList.find((a: AttoreArchivio) => a.ruolo === "RESPONSABILE");
    const nuovoVicario =  new AttoreArchivio();
    nuovoVicario.id = responsabileVecchio.id;
    nuovoVicario.ruolo = RuoloAttoreArchivio.VICARIO;
    nuovoVicario.version = responsabileVecchio.version;
    
    
    batchOperations.push({
      operation: BatchOperationTypes.UPDATE,
      entityPath: BaseUrls.get(BaseUrlType.Scripta) + "/" + ENTITIES_STRUCTURE.scripta.attorearchivio.path,
      id: nuovoVicario.id,
      entityBody: nuovoVicario as NextSdrEntity,
      returnProjection: this.attoreArchivioProjection
    } as BatchOperation);

    
    const attivita = new Attivita();
    attivita.idApplicazione = {id: "scripta"} as Applicazione;
    attivita.idAzienda = {id: this.archivio.idAzienda.id} as Azienda;
    attivita.idPersona = {id: responsabileVecchio.idPersona.id} as Persona;
    attivita.tipo = "notifica";
    attivita.oggetto = "Fascicolo: " + this.archivio.oggetto + " - " + this.archivio.numerazioneGerarchica;
    attivita.descrizione = "Accettata responsabilità";
    attivita.urls = JSON.stringify({});
    attivita.aperta = false;
    attivita.provenienza = this.utenteUtilitiesLogin.getUtente().idPersona.descrizione;
    attivita.priorita = 3;
    attivita.oggettoEsterno = this.archivio.id.toString();
    attivita.tipoOggettoEsterno = "ArchivioInternauta";
    attivita.oggettoEsternoSecondario = this.archivio.id.toString();
    attivita.tipoOggettoEsternoSecondario = "ArchivioInternauta";
    attivita.datiAggiuntivi = {};

    batchOperations.push({
      operation: BatchOperationTypes.INSERT,
      entityPath: BaseUrls.get(BaseUrlType.Scrivania) + "/" + ENTITIES_STRUCTURE.scrivania.attivita.path,
      entityBody: attivita as NextSdrEntity,
      returnProjection: "AttivitaWithPlainFields"
    } as BatchOperation);


    const filterAndsorts: FiltersAndSorts = new FiltersAndSorts();
      filterAndsorts.addFilter(new FilterDefinition("idPersona.id", FILTER_TYPES.not_string.equals, responsabilePropostoVecchio.idPersona.id));
      filterAndsorts.addFilter(new FilterDefinition("idOggettoEsterno", FILTER_TYPES.string.containsIgnoreCase, this.archivio.id.toString()));

    this.attivitaService.getData("AttivitaWithPlainFields", filterAndsorts, null,null).subscribe(
      (res) => {
        batchOperations.push({
          operation: BatchOperationTypes.DELETE,
          entityPath: BaseUrls.get(BaseUrlType.Scrivania) + "/" + ENTITIES_STRUCTURE.scrivania.attivita.path,
          id:res.results[0].id,
          entityBody: res.results[0] as NextSdrEntity,
          returnProjection: "AttivitaWithPlainFields"
        } as BatchOperation);
        this.subscriptions.push(
          this.attoreArchivioService.batchHttpCall(batchOperations).subscribe(
            (res: BatchOperation[]) => {
              this.messageService.add({
                severity: "success", 
                summary: "Proposta responsabilità", 
                detail: "Hai accettato la responsabilità del fascicolo"
              });
              this.permessiDettaglioArchivioService.calcolaPermessiEspliciti(this.archivio);
              responsabilePropostoVecchio.ruolo = RuoloAttoreArchivio.RESPONSABILE;
              responsabilePropostoVecchio.version = (res.find(bo => (bo.entityBody as any).id === responsabilePropostoVecchio.id).entityBody as AttoreArchivio).version;
              responsabileVecchio.ruolo = RuoloAttoreArchivio.VICARIO;
              responsabileVecchio.version =  (res.find(bo => (bo.entityBody as any).id === responsabileVecchio.id).entityBody as AttoreArchivio).version;
              this.permessiDettaglioArchivioService.reloadPermessiArchivio(this.archivio);
    
              this.loggedUserIsResponsbaileProposto = (this.archivio["attoriList"] as AttoreArchivio[])
                .some(a => a.idPersona.id === this.utenteUtilitiesLogin.getUtente().idPersona.id && (a.ruolo === RuoloAttoreArchivio.RESPONSABILE_PROPOSTO));
            }
          )
        )
      }
    );
  }

  public rifiutaResponsabilita(){
    const batchOperations: BatchOperation[] = [];
    const attoreToDelete = this.archivio.attoriList.find((a:AttoreArchivio)  => a.ruolo === 'RESPONSABILE_PROPOSTO');
    
    batchOperations.push({
      operation: BatchOperationTypes.DELETE,
      entityPath: BaseUrls.get(BaseUrlType.Scripta) + "/" + ENTITIES_STRUCTURE.scripta.attorearchivio.path,
      id: attoreToDelete.id,
      entityBody: attoreToDelete as NextSdrEntity,
      returnProjection: this.attoreArchivioProjection
    } as BatchOperation);

    const responsabile = this.archivio.attoriList.find((a:AttoreArchivio) => a.ruolo === 'RESPONSABILE');
    const attivita = new Attivita();
    attivita.idApplicazione = {id: "scripta"} as Applicazione;
    attivita.idAzienda = {id: this.archivio.idAzienda.id} as Azienda;
    attivita.idPersona = {id: responsabile.idPersona.id} as Persona;
    attivita.tipo = "notifica";
    attivita.oggetto = "Fascicolo: " + this.archivio.oggetto + " - " + this.archivio.numerazioneGerarchica;
    attivita.descrizione = "Rifiutata responsabilità";
    attivita.urls =JSON.stringify({});
    attivita.aperta = false;
    attivita.provenienza = this.utenteUtilitiesLogin.getUtente().idPersona.descrizione;
    attivita.priorita = 3;
    attivita.oggettoEsterno = this.archivio.id.toString();
    attivita.tipoOggettoEsterno = "ArchivioInternauta";
    attivita.oggettoEsternoSecondario = this.archivio.id.toString();
    attivita.tipoOggettoEsternoSecondario = "ArchivioInternauta";
    attivita.datiAggiuntivi = {};

    batchOperations.push({
      operation: BatchOperationTypes.INSERT,
      entityPath: BaseUrls.get(BaseUrlType.Scrivania) + "/" + ENTITIES_STRUCTURE.scrivania.attivita.path,
      entityBody: attivita as NextSdrEntity,
      returnProjection: "AttivitaWithPlainFields"
    } as BatchOperation);

          
    this.subscriptions.push(
      this.attoreArchivioService.batchHttpCall(batchOperations).subscribe(
        (res: BatchOperation[]) => {
          this.messageService.add({
            severity: "warn", 
            summary: "Rifiutata responsabilità", 
            detail: "Hai rifiutato la responsabilità del fascicolo"
          });
          this.permessiDettaglioArchivioService.calcolaPermessiEspliciti(this.archivio);
          
          attoreToDelete.version = (res.find(bo => (bo.entityBody as any).id === attoreToDelete.id).entityBody as AttoreArchivio).version;
          this.permessiDettaglioArchivioService.reloadPermessiArchivio(this.archivio);
          this.loggedUserIsResponsbaileProposto = (this.archivio["attoriList"] as AttoreArchivio[])
            .some(a => a.idPersona.id === this.utenteUtilitiesLogin.getUtente().idPersona.id && (a.ruolo === RuoloAttoreArchivio.RESPONSABILE_PROPOSTO));
        }
      )
    );
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
