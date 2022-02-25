import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { TabComponent } from 'src/app/navigation-tabs/tab.component';
import { MenuItem, TreeNode } from 'primeng/api';
import { ExtendedArchivioService } from '../extended-archivio.service';
import { Archivio, ArchivioDetail } from '@bds/ng-internauta-model';
import { combineLatest, Observable } from 'rxjs';
import { MenuItemContent } from 'primeng/menu';
import { FilterDefinition, FiltersAndSorts, FILTER_TYPES } from '@nfa/next-sdr';

@Component({
  selector: 'app-archivio-tree',
  templateUrl: './archivio-tree.component.html',
  styleUrls: ['./archivio-tree.component.scss']
})
export class ArchivioTreeComponent implements OnInit, TabComponent {
  public archivi: TreeNode[] = [];
  public bricioleArchivi: MenuItem[] = [];
  public selectedNode: TreeNode = null;
  private ARCHIVIO_PLAIN_FIELD_PROJECTION: string = "ArchivioWithPlainFields"; 
  
  private _archivio: ArchivioDetail;
  get archivio(): ArchivioDetail { return this._archivio; }
  @Input() set data(data: any) { 
    this._archivio = data.archivio;
    console.log("hei")
  }
  
  /**
   * @param archivioService 
   * Usiamo archivio e non archivio detail. 
   * Questo non dovrebbe essere un problema per quanto riguarda i permessi.
   * Se l'utente apre l'archivio allora ha diritto di vedere le altre numerazioni gerarchiche.
   * Il nome verrà oscurato lato dall'after select interceptor nel backend.
   */
  constructor(private archivioService: ExtendedArchivioService) {
    
  }

  ngOnInit(): void {
    console.log("ArchivioTreeComponent.ngOnInit()", this.archivio);
    this.firstTreeLoad();
  }

  /**
   * Questo metodo si occupa di caricare l'alberatura iniziale.
   * In particolare, se ho aperto un sottofascicolo/inserto allora 
   * devo caricare il padre e l'eventuale nonno.
   */
  private firstTreeLoad(): void {
    switch (this.archivio.livello) {
      case 1:
        this.archivi.push(this.buildTreeNode(this.archivio));
        this.bricioleArchivi.push(this.buildMenuItem(this.archivio));
        break;
      case 2:
        this.getArchivioById(this.archivio.fk_idArchivioPadre.id).subscribe(
          archivioPadre => {
            this.archivi.push(
              this.buildTreeNode(archivioPadre, [
                this.buildTreeNode(this.archivio)
              ]));
            this.bricioleArchivi.push(this.buildMenuItem(archivioPadre));
            this.bricioleArchivi.push(this.buildMenuItem(this.archivio));
            this.bricioleArchivi = [...this.bricioleArchivi];
          }
        );
        break;
      case 3:
        combineLatest([
          this.getArchivioById(this.archivio.fk_idArchivioPadre.id), 
          this.getArchivioById(this.archivio.fk_idArchivioNonno.id)
        ]).subscribe(
          ([archivioPadre, archivioNonno]) => {
            this.archivi.push(
              this.buildTreeNode(archivioNonno, [
                this.buildTreeNode(archivioPadre, [
                  this.buildTreeNode(this.archivio)
                ])
              ]));
            this.bricioleArchivi.push(this.buildMenuItem(archivioNonno));
            this.bricioleArchivi.push(this.buildMenuItem(archivioPadre));
            this.bricioleArchivi.push(this.buildMenuItem(this.archivio));
            this.bricioleArchivi = [...this.bricioleArchivi];
          }
        );       
        break;
    }
  }

  /**
   * Ritorno l'observable per il get di un archivio
   * @param idArchivio 
   * @returns 
   */
  private getArchivioById(idArchivio: number): Observable<Archivio> {
    return this.archivioService.getByIdHttpCall(idArchivio, this.ARCHIVIO_PLAIN_FIELD_PROJECTION);
  }

  /**
   * Creo il nodo per l'albero e lo torno.
   * @param archivio 
   * @param children 
   * @returns 
   */
  private buildTreeNode(archivio: Archivio| ArchivioDetail, children?: TreeNode[]): TreeNode {
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

  private buildMenuItem(archivio: Archivio| ArchivioDetail): MenuItem {
    return {
      id: archivio.id,
      label: archivio.numerazioneGerarchica,
      icon: "pi pi-folder"
    } as unknown as MenuItem;
    
    
  }

  public handleEvent(nome: string, event: any) {
    switch (nome) {
      case "onFirstLoad":
        this.loadDataByIdArchivio(event.id);
      break;
      case "onNodeSelect":
       this.selctedArchivioDetail(event.node.data);
      break;
    }
  }


  selctedArchivioDetail(value: ArchivioDetail) {
    this.archivioSelectedEvent.emit(value);
  }
}
