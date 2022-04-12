import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MenuItem, TreeNode } from 'primeng/api';
import { ExtendedArchivioService } from '../extended-archivio.service';
import { Archivio, ArchivioDetail, ENTITIES_STRUCTURE } from '@bds/ng-internauta-model';
import { combineLatest, Observable } from 'rxjs';
import { NavigationTabsService } from 'src/app/navigation-tabs/navigation-tabs.service';

@Component({
  selector: 'app-archivio-tree',
  templateUrl: './archivio-tree.component.html',
  styleUrls: ['./archivio-tree.component.scss']
})
export class ArchivioTreeComponent implements OnInit {
  public archivi: TreeNode[] = [];
  //public bricioleArchivi: MenuItem[] = [];
  public selectedNode: TreeNode = null;
  private ARCHIVIO_PROJECTION: string = ENTITIES_STRUCTURE.scripta.archivio.customProjections.CustomArchivioWithIdAziendaAndIdMassimarioAndIdTitolo;

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
    private archivioService: ExtendedArchivioService,
    private navigationTabsService: NavigationTabsService,) {

  }

  ngOnInit(): void {
    //console.log("ArchivioTreeComponent.ngOnInit()", this.archivio);
    this.firstTreeLoad();
  }

  //Todo: BreadCrumbs is not used for now but the code for it is still present (bricioleArchivi is commented)
    
  /**
   * Questo metodo si occupa di caricare l'alberatura iniziale.
   * In particolare, se ho aperto un sottofascicolo/inserto allora 
   * devo caricare il padre e l'eventuale nonno.
   */
  private firstTreeLoad(): void {
    // this.bricioleArchivi.push({
    //   label: this.archivio.idAzienda.nome,
    // } as any);
    switch (this.archivio.livello) {
      case 1:
        this.archivi.push(this.buildTreeNode(this.archivio));
      //  this.bricioleArchivi.push(this.buildMenuItem(this.archivio));
        break;
      case 2:
        this.getArchivioById(this.archivio.fk_idArchivioPadre.id).subscribe(
          archivioPadre => {
            this.archivi.push(
              this.buildTreeNode(archivioPadre, [
                this.buildTreeNode(this.archivio)
              ]));
            // this.bricioleArchivi.push(this.buildMenuItem(archivioPadre));
            // this.bricioleArchivi.push(this.buildMenuItem(this.archivio));
            // this.bricioleArchivi = [...this.bricioleArchivi];
          }
        );
        break;
      case 3:
        combineLatest([
          this.getArchivioById(this.archivio.fk_idArchivioPadre.id),
          this.getArchivioById(this.archivio.fk_idArchivioRadice.id)
        ]).subscribe(
          ([archivioPadre, archivioNonno]) => {
            this.archivi.push(
              this.buildTreeNode(archivioNonno, [
                this.buildTreeNode(archivioPadre, [
                  this.buildTreeNode(this.archivio)
                ])
              ])); 
            // this.bricioleArchivi.push(this.buildMenuItem(archivioNonno));
            // this.bricioleArchivi.push(this.buildMenuItem(archivioPadre));
            // this.bricioleArchivi.push(this.buildMenuItem(this.archivio));
            // this.bricioleArchivi = [...this.bricioleArchivi];
          }
        );
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
    switch (archivio.livello) {
      case 1:
        this.selectedNode = this.archivi[0];
        //this.bricioleArchivi = this.bricioleArchivi.slice(0,2);
        break;
      case 2:
        const index = this.archivi[0].children.findIndex(nodo => (nodo.data as Archivio).id === archivio.id);
        if (index === -1) {
          const indexArchivioSuccessivo = this.archivi[0].children.findIndex(nodo => (nodo.data as Archivio).numero > archivio.numero);
          if (indexArchivioSuccessivo === -1) {
            this.archivi[0].children.push(this.buildTreeNode(archivio));
          } else {
            this.archivi[0].children.splice(indexArchivioSuccessivo, 0, this.buildTreeNode(archivio));
          }
        } else {
          this.selectedNode = this.archivi[0].children[index];
        }
        //this.bricioleArchivi = [this.bricioleArchivi[0],this.bricioleArchivi[1], this.buildMenuItem(archivio)];
        break;
      case 3:
        const indexLiv2 = this.archivi[0].children.findIndex(nodo => (nodo.data as Archivio).id === archivio.fk_idArchivioPadre.id);
        if (indexLiv2 !== -1) {
          // Il sottofascicolo padre quindi esiste già. Devo solo aggiungere l'inserto se non c'è già.
          const indexLiv3 = this.archivi[0].children[indexLiv2].children.findIndex(nodo => (nodo.data as Archivio).id === archivio.id);
          if (indexLiv3 === -1) {
            const indexArchivioSuccessivo = this.archivi[0].children[indexLiv2].children.findIndex(nodo => (nodo.data as Archivio).numero > archivio.numero);
            if (indexArchivioSuccessivo === -1) {
              this.archivi[0].children[indexLiv2].children.push(this.buildTreeNode(archivio));
            } else {
              this.archivi[0].children[indexLiv2].children.splice(indexArchivioSuccessivo, 0, this.buildTreeNode(archivio));
            }
          } else {
            this.selectedNode = this.archivi[0].children[indexLiv2].children[indexLiv3];
          }
          //this.bricioleArchivi = [this.bricioleArchivi[0], this.bricioleArchivi[1], this.buildMenuItem(this.archivi[0].children[indexLiv2].data), this.buildMenuItem(archivio)];
        } else {
          // Manca il sottofascicolo, allora devo aggiungere sia lui che l'inserto
          this.getArchivioById(archivio.fk_idArchivioPadre.id).subscribe(
            archivioPadre => {
              const newNode: TreeNode = this.buildTreeNode(archivioPadre, [this.buildTreeNode(archivio)]);
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
    newNode.label = "[" + archivio.numerazioneGerarchica + "] " + archivio.oggetto;
    newNode.children = children || [];
    newNode.expanded = true;
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
    this.navigationTabsService.addTabArchivio(event.node.data, false);
    //this.archivioSelectedEvent.emit(event.node.data);
  }
}
