import { Component, Input, OnInit } from '@angular/core';
import { TabComponent } from 'src/app/navigation-tabs/tab.component';
import { TreeNode } from 'primeng/api';
import { ArchivioService } from '../archivio.service';
import { Archivio, ArchivioDetail, ENTITIES_STRUCTURE } from '@bds/ng-internauta-model';
import { FilterDefinition, FiltersAndSorts, FILTER_TYPES } from '@nfa/next-sdr';
import { Observable, of } from 'rxjs';


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
    const newNode: TreeNode = {};
    newNode.key = node.id.toString();
    newNode.data = node;
    newNode.label = node.numerazioneGerarchica + ' ' + node.oggetto
    newNode.children = [];
    newNode.expanded = true;

    if (node.id === this.data['id']) {
      this.selectedNode = newNode;
    }

    node.archiviFigliList?.forEach(
      archivioFiglio => newNode.children.push(this.getRenderedTreeNode(archivioFiglio))
    )
    node.archiviNipotiList?.forEach(inserto => {
      newNode.children?.forEach(subfascicolo => {
        if (inserto.fk_idArchivioPadre && subfascicolo.key === inserto.fk_idArchivioPadre.id.toString()) {
          subfascicolo.children.push(this.getRenderedTreeNode(inserto))
        }
      })
    });

    return newNode;
  }


  getArchiviListByIdPadre(id: number): Promise<ArchivioDetail[]> {
    let archivi: ArchivioDetail[] = null;
    let filter: FiltersAndSorts = new FiltersAndSorts();
    filter.addFilter(new FilterDefinition('fk_idArchivioPadre', FILTER_TYPES.not_string.equals, id));
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

  loadArchivi(): Promise<ArchivioDetail> {
    return new Promise<ArchivioDetail>((archivio) => {
      this.getArchivioById(this.data['id']).then(
        res => {
          console.log("loaded archivio res", res);
          console.log("loading archivi by idPadre res['id']", res['id']);

          this.getArchiviListByIdPadre(res['id']).then(
            archivi => {
              console.log("loaded figli: ", archivi);
              res.archiviFigliList = [];
              archivi.forEach(a => {
                res.archiviFigliList.push(a);
              })
              archivio(res);
            },
            err => {
              archivio(res);
            }
          )
        },
        err => archivio(null)
      )
    });
  }


  loadDataByIdArchivio(): void {
    console.log("data", this.data);
    let loadedElements: any[] = [];
    this.loadArchivi().then(res => {
      console.log("FINAL RES", res);
      const node = this.getRenderedTreeNode(res);
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
