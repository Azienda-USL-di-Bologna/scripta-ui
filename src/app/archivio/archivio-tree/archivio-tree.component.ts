import { Component, Input, OnInit } from '@angular/core';
import { TabComponent } from 'src/app/navigation-tabs/tab.component';
import { TreeNode } from 'primeng/api';
import { ArchivioService } from '../archivio.service';
import { Archivio, ArchivioDetail, ENTITIES_STRUCTURE } from '@bds/ng-internauta-model';
import { FilterDefinition, FiltersAndSorts, FILTER_TYPES } from '@nfa/next-sdr';


@Component({
  selector: 'app-archivio-tree',
  templateUrl: './archivio-tree.component.html',
  styleUrls: ['./archivio-tree.component.scss']
})
export class ArchivioTreeComponent implements OnInit, TabComponent {
  @Input() data: any;
  public elements: any[] = [];

  constructor(private archivioService: ArchivioService) { }

  ngOnInit(): void {
    console.log("ArchivioTreeComponent.ngOnInit()", this.data);
    this.loadDataByIdArchivio()
    //this.fakeDataConstructor()

  }

  getRenderedTreeNode(node: ArchivioDetail): TreeNode {
    const newNode: TreeNode = {};
    newNode.data = node;
    newNode.label = node.numerazioneGerarchica
    newNode.children = [];
    node.archiviFigliList?.forEach(
      archivioFiglio => newNode.children.push(this.getRenderedTreeNode(archivioFiglio))
    )
    return newNode;
  }

  loadDataByIdArchivio(): void {
    console.log("data", this.data);
    let loadedElements: any[] = [];
    let filter: FiltersAndSorts = new FiltersAndSorts();
    filter.addFilter(new FilterDefinition('id', FILTER_TYPES.not_string.equals, this.data['id']));

    this.archivioService.getData("ArchivioDetailWithArchiviFigliListAndArchiviNipotiList", filter, null, null).subscribe(
      (res: { results: any[]; }) => {
        console.log("RES", res);
        res.results.forEach((archive: ArchivioDetail) => {
          const node = this.getRenderedTreeNode(archive)
          loadedElements.push(node);
        });
        console.log("FINAL loadedElements", loadedElements);
        this.elements = loadedElements
      }
    );
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
