import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MenuItem, TreeNode } from 'primeng/api';
import { ExtendedArchivioService } from '../extended-archivio.service';
import { Archivio, ArchivioDetail, ArchivioDetailViewService, ConfigurazioneService, ENTITIES_STRUCTURE, ParametroAziende, StatoArchivio } from '@bds/internauta-model';
import { combineLatest, Observable, Subscription } from 'rxjs';
import { NavigationTabsService } from 'src/app/navigation-tabs/navigation-tabs.service';
import { AppService } from 'src/app/app.service';
import { FilterDefinition, FiltersAndSorts, FILTER_TYPES, PagingConf } from '@bds/next-sdr';
import { JwtLoginService, UtenteUtilities } from '@bds/jwt-login';
import { ArchivioFieldUpdating, ArchivioUtilsService } from '../archivio-utils.service';

@Component({
  selector: 'archivio-tree',
  templateUrl: './archivio-tree.component.html',
  styleUrls: ['./archivio-tree.component.scss']
})
export class ArchivioTreeComponent implements OnInit {
  public archivi: TreeNode[] = [];
  //public bricioleArchivi: MenuItem[] = [];
  public selectedNode: TreeNode = null;
  private ARCHIVIO_PROJECTION: string = ENTITIES_STRUCTURE.scripta.archivio.customProjections.CustomArchivioWithIdAziendaAndIdMassimarioAndIdTitolo;
  //private ARCHIVIO_DETAIL_STANDARD: string = ENTITIES_STRUCTURE.scripta.archiviodetail.standardProjections.ArchivioDetailWithPlainFields;
  private ARCHIVIO_DETAIL_PROJECTION = ENTITIES_STRUCTURE.scripta.archiviodetailview.customProjections.CustomArchivioDetailViewWithIdAziendaAndIdPersonaCreazioneAndIdPersonaResponsabileAndIdStrutturaAndIdVicari;

  public troppiSottoFascicoli: boolean = false;
  public troppiInserti: boolean = false;
  public numeroMaxSottoarchiviCaricabili: number;
  private utenteUtilitiesLogin: UtenteUtilities;
  public subscriptions: Subscription[] = [];

  public pageConfNoLimit: PagingConf = {
    conf: {
      page: 0,
      size: 999999
    },
    mode: "PAGE_NO_COUNT"
  };

  @Output() archivioSelectedEvent = new EventEmitter<ArchivioDetail>();

  private _archivio: Archivio | ArchivioDetail;
  get archivio(): Archivio | ArchivioDetail { return this._archivio; }
  @Input() set archivio(archivio: Archivio | ArchivioDetail) {
    this._archivio = archivio;
    if (this.archivi.length > 0) {
      this.addTreeNode(this._archivio);
    }
  }

  /**
   * @param archivioService 
   * Usiamo archivio e non archivio detail. 
   * Questo non dovrebbe essere un problema per quanto riguarda i permessi.
   * Se l'utente apre l'archivio allora ha diritto di vedere le altre numerazioni gerarchiche.
   * Il nome verrà oscurato lato dall'after select interceptor nel backend.
   */
  constructor(
    private configurationService: ConfigurazioneService,
    private archivioService: ExtendedArchivioService,
    private achivioDetailViewService: ArchivioDetailViewService,
    private loginService: JwtLoginService,
    private navigationTabsService: NavigationTabsService,
    private appService: AppService,
    private archivioUtilsService: ArchivioUtilsService) {
     
  }

  ngOnInit(): void {
    //console.log("ArchivioTreeComponent.ngOnInit()", this.archivio);
    this.loadConfig();

    this.subscriptions.push(
      this.archivioUtilsService.updateArchivioFieldEvent.subscribe(
        (archivioFieldUpdating: ArchivioFieldUpdating) => {
          if (archivioFieldUpdating.field === "oggetto" && archivioFieldUpdating.archivio.fk_idArchivioRadice.id === this.archivio.fk_idArchivioRadice.id) {
            this.addTreeNode(archivioFieldUpdating.archivio);
          }
        }
      )
    );
    this.subscriptions.push(
      this.archivioUtilsService.deletedArchiveEvent.subscribe(
        (idArchivioCancellato: number) => {
          this.deleteNode(this.archivi, idArchivioCancellato);
        }
      )
    );
    this.subscriptions.push(
      this.archivioUtilsService.updatedArchiveEvent.subscribe(
        (archivioAggiornato: Archivio) => {
          this.deleteNode(this.archivi, archivioAggiornato.id);
          this.addTreeNode(archivioAggiornato);
        }
      )
    );
  }

  //Todo: BreadCrumbs is not used for now but the code for it is still present (bricioleArchivi is commented)

  /**
   * Questo metodo si occupa di caricare il numero massimo di fascicoli caricabili
   * dipendente dall'azienda di appartenenza del fascicolo
   */
  private loadConfig(): void {
    this.loginService.loggedUser$.subscribe(
      (utenteUtilities: UtenteUtilities) => {
        this.utenteUtilitiesLogin = utenteUtilities;
      }
    );
    this.configurationService.getParametriAziende("numeroMaxSottoarchiviCaricabili", null, [this.archivio.fk_idAzienda.id])
      .subscribe( (parametriAziende: ParametroAziende[]) => {
        if (parametriAziende && parametriAziende[0]) {
          this.numeroMaxSottoarchiviCaricabili = parametriAziende[0].valore as number;
          this.firstTreeLoad();
        }
      })
  }

  /**
   * Questo metodo si occupa di caricare l'alberatura iniziale.
   * In particolare, se ho aperto un sottofascicolo/inserto allora 
   * devo caricare il padre e l'eventuale nonno e i fratelli. 
   * Di un fascicolo devo caricare i sottofascicoli
   */
  private firstTreeLoad(): void {
    // this.bricioleArchivi.push({
    //   label: this.archivio.idAzienda.nome,
    // } as any);
    switch (this.archivio.livello) {
      case 1:
        /**this.archivi.push(this.buildTreeNode(this.archivio));
        //  this.bricioleArchivi.push(this.buildMenuItem(this.archivio));
        break;*/
        const archivioRadice = this.archivio as Archivio;
        if (archivioRadice.numeroSottoarchivi < this.numeroMaxSottoarchiviCaricabili) {
          const filtersAndSorts =  this.buildFilterToLoadChildren(archivioRadice)
          this.achivioDetailViewService.getData(this.ARCHIVIO_DETAIL_PROJECTION, filtersAndSorts, null, this.pageConfNoLimit)
            .subscribe(
              (res) => {
                const children = res.results;
                let childrenNodes: TreeNode<any>[] = [];
                for (let i = 0; i < children.length ; i++ ) {
                  childrenNodes.push(this.buildTreeNode(children[i]))
                }
                this.archivi.push(this.buildTreeNode(this.archivio, childrenNodes))
              }
            )
        } else {
          this.troppiSottoFascicoli = true;
          this.archivi.push(this.buildTreeNode(this.archivio));
        }
        break;
      case 2:
        this.getArchivioById(this.archivio.fk_idArchivioPadre.id).subscribe(
          archivioPa => {
            const archivioPadre: Archivio = archivioPa as Archivio;
            if(archivioPadre && archivioPadre.numeroSottoarchivi < this.numeroMaxSottoarchiviCaricabili) {
              const filtersAndSorts =  this.buildFilterToLoadChildren(archivioPadre)
              this.achivioDetailViewService.getData(this.ARCHIVIO_DETAIL_PROJECTION, filtersAndSorts, null, this.pageConfNoLimit)
                .subscribe(
                  (res) => {
                    console.log("ecco ciò che carico" , res.results)
                    let brothers = res.results;
                    let brothersNodes: TreeNode<any>[] = [];
                    for (let i = 0; i < brothers.length ; i++ ) {
                      brothersNodes.push(this.buildTreeNode(brothers[i]))
                    }
                    this.archivi.push(this.buildTreeNode(archivioPadre, brothersNodes));
                  }
                )
              }
              else {
                this.troppiSottoFascicoli = true;
                this.archivi.push(this.buildTreeNode(archivioPadre, [this.buildTreeNode(this.archivio)]));
              }
          }
        );
        // this.getArchivioById(this.archivio.fk_idArchivioPadre.id).subscribe(
        //   archivioPadre => {
        //     this.archivi.push(
        //       this.buildTreeNode(archivioPadre, [
        //         this.buildTreeNode(this.archivio)
        //       ]));
        //     // this.bricioleArchivi.push(this.buildMenuItem(archivioPadre));
        //     // this.bricioleArchivi.push(this.buildMenuItem(this.archivio));
        //     // this.bricioleArchivi = [...this.bricioleArchivi];
        //   }
        // );
        break;
      case 3:
        combineLatest([
            this.getArchivioById(this.archivio.fk_idArchivioPadre.id),
            this.getArchivioById(this.archivio.fk_idArchivioRadice.id)
          ]).subscribe(
            ([archivioPadre, archivioNonno ] ) => {
              if(archivioNonno.numeroSottoarchivi <= this.numeroMaxSottoarchiviCaricabili && archivioPadre.numeroSottoarchivi <= this.numeroMaxSottoarchiviCaricabili) {
                const nonnoNodo = this.buildTreeNode(archivioNonno)
                this.archivi.push(nonnoNodo);
                const filtersAndSorts =  this.buildFilterToLoadChildren(archivioNonno);
                this.achivioDetailViewService.getData(this.ARCHIVIO_DETAIL_PROJECTION, filtersAndSorts, null, this.pageConfNoLimit)
                .subscribe(
                  (res) => {
                    const uncles = res.results;
                    // let unclesNodes: TreeNode<any>[] = [];
                    // let fatherAndSons: TreeNode<any>[] = [];
                    for (let i = 0; i < uncles.length ; i++ ) {
                      if(uncles[i].id != archivioPadre.id) {
                        nonnoNodo.children.push(this.buildTreeNode(uncles[i]))
                        
                      }
                      if(uncles[i].id == archivioPadre.id) {
                        const filtersAndSorts =  this.buildFilterToLoadChildren(archivioPadre)
                        this.achivioDetailViewService.getData(this.ARCHIVIO_DETAIL_PROJECTION, filtersAndSorts, null, this.pageConfNoLimit)
                        .subscribe(
                          (res) => {
                            let children = res.results;
                            let childrenNodes: TreeNode<any>[] = [];
                            for (let i = 0; i < children.length ; i++ ) {
                              childrenNodes.push(this.buildTreeNode(children[i]))
                            }
                            nonnoNodo.children.push(
                                this.buildTreeNode(archivioPadre, 
                                  childrenNodes
                              )
                            );
                          }
                        )
                      } 
                    }
                  }
                ) 
              }
              else if (archivioNonno.numeroSottoarchivi <= this.numeroMaxSottoarchiviCaricabili && archivioPadre.numeroSottoarchivi > this.numeroMaxSottoarchiviCaricabili) {
                const filtersAndSorts =  this.buildFilterToLoadChildren(archivioNonno);
                const nonnoNodo = this.buildTreeNode(archivioNonno);
                this.archivi.push(nonnoNodo);
                this.achivioDetailViewService.getData(this.ARCHIVIO_DETAIL_PROJECTION, filtersAndSorts, null, this.pageConfNoLimit)
                .subscribe(
                  (res) => {
                    const uncles = res.results;
                    for (let i = 0; i < uncles.length ; i++ ) {
                      if(uncles[i].id == archivioPadre.id) {
                        nonnoNodo.children.push(this.buildTreeNode(uncles[i],  [
                          this.buildTreeNode(this.archivio)
                        ]))
                      } else {
                        nonnoNodo.children.push(this.buildTreeNode(uncles[i]))
                      }
                    }
                    this.troppiInserti = true;
                  }
                )
              }
              else if (archivioNonno.numeroSottoarchivi > this.numeroMaxSottoarchiviCaricabili && archivioPadre.numeroSottoarchivi <= this.numeroMaxSottoarchiviCaricabili) {
                this.troppiSottoFascicoli = true;
                const nonnoNodo = this.buildTreeNode(archivioNonno);
                this.archivi.push(nonnoNodo);
                const filtersAndSorts =  this.buildFilterToLoadChildren(archivioPadre)
                this.achivioDetailViewService.getData(this.ARCHIVIO_DETAIL_PROJECTION, filtersAndSorts, null, this.pageConfNoLimit)
                .subscribe(
                  (res) => {
                    let children = res.results;
                    let childrenNodes: TreeNode<any>[] = [];
                    for (let i = 0; i < children.length ; i++ ) {
                      childrenNodes.push(this.buildTreeNode(children[i]))
                    }
                    nonnoNodo.children.push(this.buildTreeNode(archivioPadre, childrenNodes))
                  }
                )
            }
            else {
              this.archivi.push(
                  this.buildTreeNode(archivioNonno, [
                    this.buildTreeNode(archivioPadre, [
                      this.buildTreeNode(this.archivio)
                    ])
              ]));
              this.troppiInserti = true;
              this.troppiSottoFascicoli = true;
            }
                 
              
              // this.archivi.push(
              //   this.buildTreeNode(archivioNonno, [
              //     this.buildTreeNode(archivioPadre, [
              //       this.buildTreeNode(this.archivio)
              //     ])
              //   ]));
              // this.bricioleArchivi.push(this.buildMenuItem(archivioNonno));
              // this.bricioleArchivi.push(this.buildMenuItem(archivioPadre));
              // this.bricioleArchivi.push(this.buildMenuItem(this.archivio));
              // this.bricioleArchivi = [...this.bricioleArchivi];
            }
          );

        // combineLatest([
        //   this.getArchivioById(this.archivio.fk_idArchivioPadre.id),
        //   this.getArchivioById(this.archivio.fk_idArchivioRadice.id)
        // ]).subscribe(
        //   ([archivioPadre, archivioNonno]) => {
        //     this.archivi.push(
        //       this.buildTreeNode(archivioNonno, [
        //         this.buildTreeNode(archivioPadre, [
        //           this.buildTreeNode(this.archivio)
        //         ])
        //       ]));
        //     // this.bricioleArchivi.push(this.buildMenuItem(archivioNonno));
        //     // this.bricioleArchivi.push(this.buildMenuItem(archivioPadre));
        //     // this.bricioleArchivi.push(this.buildMenuItem(this.archivio));
        //     // this.bricioleArchivi = [...this.bricioleArchivi];
        //   }
        // );
        break;
    }
  }

  /**
   * Questo metodo è chiamato quando l'albero già esiste e si vuole aggiungere un nodo.
   * I nodi aggiunti saranno di livello 2 o 3.
   * Vogliamo non aggiungere due volte lo stesso nodo.
   * Se viene aggiunto un livello 3 figlio di un livello 2 ancora non presente allora va aggiunto anche
   * questo livello 2 mancante.
   * Se l'archivio cliccato c'era già lo devo comunque selezionare
   */
  private addTreeNode(archivio: Archivio | ArchivioDetail) {
    const nodoBuildato = this.buildTreeNode(archivio);
    switch (archivio.livello) {
      case 1:
        nodoBuildato.children = this.archivi[0].children;
        this.archivi[0] = nodoBuildato;
        this.selectedNode = this.archivi[0];
        //this.bricioleArchivi = this.bricioleArchivi.slice(0,2);
        break;
      case 2:
        const index = this.archivi[0].children.findIndex(nodo => (nodo.data as Archivio).id === archivio.id);
        if (index === -1) {
          // Il nodo non esiste, lo devo inserire ex novo
          const indexArchivioSuccessivo = this.archivi[0].children.findIndex(nodo => (nodo.data as Archivio).numero > archivio.numero);
          if (indexArchivioSuccessivo === -1) {
            this.archivi[0].children.push(nodoBuildato);
          } else {
            this.archivi[0].children.splice(indexArchivioSuccessivo, 0, nodoBuildato);
          }
        } else {
          // Il nodo esiste già, lo devo aggiornare. Mi salvo anche i children suoi.
          nodoBuildato.children = this.archivi[0].children[index].children;
          this.archivi[0].children[index] = nodoBuildato;
          this.selectedNode = this.archivi[0].children[index];
        }
        //this.bricioleArchivi = [this.bricioleArchivi[0],this.bricioleArchivi[1], this.buildMenuItem(archivio)];
        break;
      case 3:
        const indexLiv2 = this.archivi[0].children.findIndex(nodo => (nodo.data as Archivio).id === archivio.fk_idArchivioPadre.id);
        if (indexLiv2 !== -1) {
          // Il sottofascicolo padre esiste già. Devo solo aggiungere l'inserto se non c'è già.
          const indexLiv3 = this.archivi[0].children[indexLiv2].children.findIndex(nodo => (nodo.data as Archivio).id === archivio.id);
          if (indexLiv3 === -1) {
            const indexArchivioSuccessivo = this.archivi[0].children[indexLiv2].children.findIndex(nodo => (nodo.data as Archivio).numero > archivio.numero);
            if (indexArchivioSuccessivo === -1) {
              this.archivi[0].children[indexLiv2].children.push(nodoBuildato);
            } else {
              this.archivi[0].children[indexLiv2].children.splice(indexArchivioSuccessivo, 0, nodoBuildato);
            }
          } else {
            // L'inserto c'è già. Allora lo voglio aggiornare.
            this.archivi[0].children[indexLiv2].children[indexLiv3] = nodoBuildato;
            this.selectedNode = this.archivi[0].children[indexLiv2].children[indexLiv3];
          }
          //this.bricioleArchivi = [this.bricioleArchivi[0], this.bricioleArchivi[1], this.buildMenuItem(this.archivi[0].children[indexLiv2].data), this.buildMenuItem(archivio)];
        } else {
          // Manca il sottofascicolo, allora devo aggiungere sia lui che l'inserto
          this.getArchivioById(archivio.fk_idArchivioPadre.id).subscribe(
            archivioPadre => {
              const newNode: TreeNode = this.buildTreeNode(archivioPadre, [nodoBuildato]);
              const indexArchivioSuccessivo = this.archivi[0].children.findIndex(nodo => (nodo.data as Archivio).numero > archivioPadre.numero);
              if (indexArchivioSuccessivo === -1) {
                this.archivi[0].children.push(newNode);
              } else {
                this.archivi[0].children.splice(indexArchivioSuccessivo, 0, newNode);
              }
              //this.bricioleArchivi = [this.bricioleArchivi[0], this.buildMenuItem(archivioPadre), this.buildMenuItem(archivio)];
            }
          );
        }
        break;
    }
  }


/**
 * Metodo che serve per poter caricare gli inserti di un sottofascicolo qualora venisse selezionato
 * dall'albero, ma vengono caricati solo se sono meno del numero predefinito
 * @param archivio 
 * @returns 
 */
  private loadChildren(archivio: Archivio | ArchivioDetail): void {
    if (archivio.livello === 2 && archivio.numeroSottoarchivi <= this.numeroMaxSottoarchiviCaricabili) {
      const filtersAndSorts = this.buildFilterToLoadChildren(archivio);
      this.achivioDetailViewService.getData(this.ARCHIVIO_DETAIL_PROJECTION, filtersAndSorts, null, this.pageConfNoLimit).subscribe(
        res => {
          let archiviFigli = res.results;
          const indexLiv2 = this.archivi[0].children.findIndex(nodo => (nodo.data as Archivio).id === archivio.id);
          for (let i = 0; i < archiviFigli.length ; i++ ) {
            if(!(this.archivi[0].children[indexLiv2].children.find(nodo => (nodo.data as Archivio).id === archiviFigli[i].id))) {
              this.archivi[0].children[indexLiv2].children.push(this.buildTreeNode(archiviFigli[i]))
            }
          }
        }
      )
    } else if (archivio.livello === 2 && archivio.numeroSottoarchivi > this.numeroMaxSottoarchiviCaricabili) {
      console.log("troppi inserti ")
      this.troppiInserti = true;
    }
  }



  private buildFilterToLoadChildren(archivio: Archivio | ArchivioDetail):  FiltersAndSorts {
    const filtersAndSorts: FiltersAndSorts = new FiltersAndSorts();
    filtersAndSorts.addFilter(new FilterDefinition("idArchivioPadre.id", FILTER_TYPES.not_string.equals, archivio.id));
    filtersAndSorts.addFilter(new FilterDefinition("idAzienda.id", FILTER_TYPES.not_string.equals,archivio.fk_idAzienda.id));
    filtersAndSorts.addFilter(new FilterDefinition("idPersona.id", FILTER_TYPES.not_string.equals, this.utenteUtilitiesLogin.getUtente().idPersona.id));
    return filtersAndSorts;
  }

  /**
   * Ritorno l'observable per il get di un archivio
   * @param idArchivio 
   * @returns 
   */
  private getArchivioById(idArchivio: number): Observable<Archivio> {
    return this.archivioService.getByIdHttpCall(idArchivio, this.ARCHIVIO_PROJECTION);
  }

  /**
   * Creo il nodo per l'albero e lo torno.
   * @param archivio 
   * @param children 
   * @returns 
   */
  private buildTreeNode(archivio: Archivio | ArchivioDetail, children?: TreeNode[]): TreeNode {
    const newNode: TreeNode = {};
    if (archivio.id === this.archivio["id"]) {
      this.selectedNode = newNode;
    }
    newNode.key = archivio.id.toString();
    newNode.data = archivio;
    newNode.collapsedIcon = "pi pi-folder";
    newNode.expandedIcon = "pi pi-folder-open";
    newNode.label = "[" + archivio.numerazioneGerarchica + "] " + archivio.oggetto + " " + archivio.id.toString();
    newNode.children = children || [];
    newNode.expanded = true;
    if(archivio.stato === StatoArchivio.BOZZA) {
      newNode.styleClass = "nodo-bozza";
    }
    return newNode;
  }

  /**
   * Costruisco elemento per la breadcrumb
   * @param archivio 
   * @returns 
   */
  private buildMenuItem(archivio: Archivio | ArchivioDetail): MenuItem {
    return {
      id: archivio.id,
      label: archivio.numerazioneGerarchica,
      icon: "pi pi-folder"
    } as unknown as MenuItem;
  }

  /**
   * Gestione della selezione archivio.
   * Informo mio padre di quanto è successo.
   * @param event 
   */
  public onNodeSelect(event: any): void {
    this.loadChildren(event.node.data);
    this.navigationTabsService.addTabArchivio(event.node.data, false);
    this.appService.appNameSelection("Fascicolo "+ event.node.data.numerazioneGerarchica  + " [" + event.node.data.idAzienda.aoo + "]");
    //this.archivioSelectedEvent.emit(event.node.data);
  }

  /**
   * Dato un idArchivio elimino il nodo che lo rappresenta se lo trovo.
   * @param alberatura 
   * @param idArchivioDelNodoDaEliminare 
   * @returns 
   */
  private deleteNode(alberatura: TreeNode[], idArchivioDelNodoDaEliminare: number): boolean {
    const indexNodoDaEliminare = alberatura.findIndex(a => a.key === idArchivioDelNodoDaEliminare.toString());
    if (indexNodoDaEliminare > -1) {
      alberatura.splice(indexNodoDaEliminare, 1);
      return true;
    }
    for (const subAlberatura of alberatura) {
      if (subAlberatura.children) {
        const eliminato = this.deleteNode(subAlberatura.children, idArchivioDelNodoDaEliminare);
        if (eliminato) {
          return true;
        }
      }
    }
    return false;
  }
}
