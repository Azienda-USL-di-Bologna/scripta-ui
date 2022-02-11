import { Component, Input, OnInit } from '@angular/core';
import { TabComponent } from 'src/app/navigation-tabs/tab.component';
import { TreeNode } from 'primeng/api';
import { ArchivioService } from '../archivio.service';
import { Archivio, ArchivioDetail, ENTITIES_STRUCTURE } from '@bds/ng-internauta-model';
import { FilterDefinition, FiltersAndSorts, FILTER_TYPES } from '@nfa/next-sdr';
import { Observable, of } from 'rxjs';
import { flushMicrotasks } from '@angular/core/testing';


@Component({
  selector: 'app-archivio-tree',
  templateUrl: './archivio-tree.component.html',
  styleUrls: ['./archivio-tree.component.scss']
})
export class ArchivioTreeComponent implements OnInit, TabComponent {
  @Input() data: any;
  public elements: any[] = [];
  public selectedNode: TreeNode = null;
  private ARCHIVIO_PLAIN_FIELD_PROJECTION: string = "ArchivioDetailWithPlainFields";

  constructor(private archivioService: ArchivioService) { }

  ngOnInit(): void {
    console.log("ArchivioTreeComponent.ngOnInit()", this.data);
    this.loadDataByIdArchivio()
    //this.fakeDataConstructor()

  }

  getRenderedTreeNode(node: ArchivioDetail): TreeNode {
    console.log("generatingTreeNode", node)
    const newNode: TreeNode = {};
    if (node.id === this.data['id']) {
      this.selectedNode = newNode;
    }
    newNode.key = node.id.toString();
    newNode.data = node;
    newNode.collapsedIcon = "pi pi-folder"
    newNode.expandedIcon = "pi pi-folder-open"
    newNode.label = node.numerazioneGerarchica + '/' + node.anno + ' ' + node.oggetto
    newNode.children = [];
    newNode.expanded = true;
    /*     if (node.idArchivioPadre) {
          console.log("set parent");
          const parent = this.getRenderedTreeNode(node.idArchivioPadre)
          console.log("The parent", parent);
    
          newNode.parent = parent
        } */
    return newNode;
  }

  pushChildrenNodesRecursively(archive: ArchivioDetail, nodoArchivio: TreeNode) {
    archive.archiviFigliList?.forEach(archivioFiglio => {
      let subNode: TreeNode = this.getRenderedTreeNode(archivioFiglio);
      this.pushChildrenNodesRecursively(archivioFiglio, subNode);
      nodoArchivio.children.push(subNode);
    })
  }



  getFullRenderedTreeNode(node: ArchivioDetail): TreeNode {
    console.log("getFullRenderedTreeNode", node);

    let newNode: TreeNode = this.getRenderedTreeNode(node);

    this.pushChildrenNodesRecursively(node, newNode);
    /* node.archiviNipotiList?.forEach(inserto => {
      newNode.children?.forEach(subfascicolo => {
        if (inserto.fk_idArchivioPadre && subfascicolo.key === inserto.fk_idArchivioPadre.id.toString()) {
          subfascicolo.children.push(this.getRenderedTreeNode(inserto))
        }
      })
    }); */
    console.log("fullRenderedTreeNode", newNode);
    return newNode;
  }


  getArchiviListByIdPadre(id: number): Promise<ArchivioDetail[]> {
    let archivi: ArchivioDetail[] = null;
    let filter: FiltersAndSorts = new FiltersAndSorts();
    filter.addFilter(new FilterDefinition('idArchivioPadre.id', FILTER_TYPES.not_string.equals, id));
    return new Promise<ArchivioDetail[]>
      (
        (resolve, error) => this.archivioService.getData(
          this.ARCHIVIO_PLAIN_FIELD_PROJECTION, filter, null, null)
          .subscribe(
            (res: { results: any[]; }) => {
              resolve(res.results)
            },
            (err: { results: any[]; }) => {
              error(err)
            }
          )
      )
  }


  async getArchivioById(id: number): Promise<ArchivioDetail> {
    let archivio: ArchivioDetail = null;
    let filter: FiltersAndSorts = new FiltersAndSorts();
    filter.addFilter(new FilterDefinition('id', FILTER_TYPES.not_string.equals, id));
    return new Promise<ArchivioDetail>
      (
        (resolve, error) => this.archivioService.getData(
          this.ARCHIVIO_PLAIN_FIELD_PROJECTION, filter, null, null)
          .subscribe(
            (res: { results: any[]; }) => {
              resolve(res.results[0])
            },
            (err: { results: any[]; }) => {
              error(err)
            }
          )
      )
  }

  loadAncestors(baseArchive: ArchivioDetail): Promise<ArchivioDetail> {
    console.log("load ancestor of ", baseArchive);
    return new Promise<ArchivioDetail>((fullAncestered) => {
      const idPadre = baseArchive.idArchivioPadre ? baseArchive.idArchivioPadre.id : baseArchive.fk_idArchivioPadre.id
      if (idPadre) {
        this.getArchivioById(idPadre).then(
          father => {
            console.log("father archive", father);
            baseArchive.idArchivioPadre = father;
            if (father.livello > 1 && ((father.fk_idArchivioPadre && father.fk_idArchivioPadre.id)
              || (father.idArchivioPadre && father.idArchivioPadre.id))) {
              this.loadAncestors(father).then(ancestered => {
                father = ancestered;
              })
            }
            fullAncestered(baseArchive);
          }
        )
      }
      else {
        fullAncestered(baseArchive);
      }
    })
  }

  loadFigli(baseArchive: ArchivioDetail): Promise<ArchivioDetail> {
    return new Promise<ArchivioDetail>((fullWithChildren) => {
      this.getArchiviListByIdPadre(baseArchive.id).then(
        archivi => {
          console.log("loaded figli: ", archivi);
          baseArchive.archiviFigliList = [];
          archivi.forEach(a => {
            baseArchive.archiviFigliList.push(a);
          })
        }
      ).then(() => fullWithChildren(baseArchive));
    });
  }



  loadAlberatura(): Promise<ArchivioDetail> {
    let archive: ArchivioDetail;
    return new Promise<ArchivioDetail>((archivioToReturn) => {
      this.getArchivioById(this.data['id'])
        .then(archivio => { // carico il fascicolo
          archive = archivio;
        }).then(() => {
          // se c'è carico il padre
          if (archive.livello > 1) {
            this.loadAncestors(archive)
              .then(ancesteredArchive => {
                archive = ancesteredArchive;
                console.log("full ancestored", archive);
              })
              .then(() => {// poi carico i figli
                this.loadFigli(archive).then(() => {
                  archivioToReturn(archive);
                });
              }
              )
          }
          else {// altrimenti carico i figli
            this.loadFigli(archive).then(() => {
              archivioToReturn(archive);
            });
          }
        })
    });
  }

  transformStructure(archive: ArchivioDetail): ArchivioDetail {
    console.log("transformStructure", archive);

    let restructuredArchivio = null;
    if (archive.idArchivioPadre) {
      const father = archive.idArchivioPadre
      if (!father.archiviFigliList) {
        father.archiviFigliList = [];
      }
      father.archiviFigliList.push(archive);
      if (father.idArchivioPadre) {
        restructuredArchivio = this.transformStructure(father);
      }
      else {
        restructuredArchivio = father;
      }
    }
    else {
      restructuredArchivio = archive;
    }
    return restructuredArchivio;
  }


  loadDataByIdArchivio(): void {
    console.log("data", this.data);
    let loadedElements: any[] = [];
    this.loadAlberatura().then(res => {
      console.log("FINAL RES", res);
      const restructured: ArchivioDetail = this.transformStructure(res);
      const node = this.getFullRenderedTreeNode(restructured);
      loadedElements.push(node);
      this.elements = loadedElements;
    });
  }

  fakeDataConstructor(): void {
    this.data = [
      {
        "label": "Documents",
        "data": "Documents Folder",
        "expandedIcon": "pi pi-folder-open",
        "collapsedIcon": "pi pi-folder",
        "children": [{
          "label": "Work",
          "data": "Work Folder",
          "expandedIcon": "pi pi-folder-open",
          "collapsedIcon": "pi pi-folder",
          "children": [{ "label": "Expenses.doc", "icon": "pi pi-file", "data": "Expenses Document" }, { "label": "Resume.doc", "icon": "pi pi-file", "data": "Resume Document" }]
        },
        {
          "label": "Home",
          "data": "Home Folder",
          "expandedIcon": "pi pi-folder-open",
          "collapsedIcon": "pi pi-folder",
          "children": [{ "label": "Invoices.txt", "icon": "pi pi-file", "data": "Invoices for this month" }]
        }]
      },
      {
        "label": "Pictures",
        "data": "Pictures Folder",
        "expandedIcon": "pi pi-folder-open",
        "collapsedIcon": "pi pi-folder",
        "children": [
          { "label": "barcelona.jpg", "icon": "pi pi-image", "data": "Barcelona Photo" },
          { "label": "logo.jpg", "icon": "pi pi-file", "data": "PrimeFaces Logo" },
          { "label": "primeui.png", "icon": "pi pi-image", "data": "PrimeUI Logo" }]
      },
      {
        "label": "Movies",
        "data": "Movies Folder",
        "expandedIcon": "pi pi-folder-open",
        "collapsedIcon": "pi pi-folder",
        "children": [{
          "label": "Al Pacino",
          "data": "Pacino Movies",
          "children": [{ "label": "Scarface", "icon": "pi pi-video", "data": "Scarface Movie" }, { "label": "Serpico", "icon": "pi pi-file-video", "data": "Serpico Movie" }]
        },
        {
          "label": "Robert De Niro",
          "data": "De Niro Movies",
          "children": [{ "label": "Goodfellas", "icon": "pi pi-video", "data": "Goodfellas Movie" }, { "label": "Untouchables", "icon": "pi pi-video", "data": "Untouchables Movie" }]
        }]
      }
    ]
  }

}
