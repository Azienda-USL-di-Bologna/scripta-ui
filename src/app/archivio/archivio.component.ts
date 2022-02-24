import { Component, Input, OnInit } from '@angular/core';
import { ArchivioDetail } from '@bds/ng-internauta-model';
import { ArchiviListMode } from '../archivi-list/archivi-list-constants';
import { ArchiviListModeItem } from '../archivi-list/archivi-list.component';
import { TabComponent } from '../navigation-tabs/tab.component';
import { ArchivioService } from './archivio.service';



@Component({
  selector: 'app-archivio',
  templateUrl: './archivio.component.html',
  styleUrls: ['./archivio.component.scss']
})
export class ArchivioComponent implements OnInit, TabComponent {
  @Input() data: any;
  
  private archiviListModeItemArchivo: ArchiviListModeItem[];
  public childrens: number[];
  public _archivioSelected: ArchivioDetail;
  public hasChildren:boolean =false;
  

  constructor() { }

  ngOnInit(): void {
    console.log("AchivioComp.ngOnInit", this.data);
    this.calcArchiviListModeItem();
  }

  archivioSelected(selected: ArchivioDetail) {
    this.childrens=[];
    if(selected.archiviFigliList!=undefined  && selected.archiviFigliList.length!=0){
       this.getArchiviFigliList(selected)
    }else{      
      this.hasChildren=false;
    }

  }

  getArchiviFigliList(selected:ArchivioDetail){
    if(selected.archiviFigliList!=undefined && selected.archiviFigliList.length!=0){   
      selected.archiviFigliList?.forEach(x =>{
        this.childrens.push(x.id);
        this.hasChildren=true;
        this.getArchiviFigliList(x);
      })
    }  
  }


  public calcArchiviListModeItem(): void {
    this.archiviListModeItemArchivo = [];
    this.archiviListModeItemArchivo.push(
      {
        title: "",
        label: "Documenti",
        // icon: "pi pi-fw pi-list", 
        routerLink: ["./"],
        queryParams: { "mode": ArchiviListMode.VISIBILI }
      },
      {
        title: "",
        label: "Dettaglio",
        // icon: "pi pi-fw pi-list", 
        routerLink: [  ],
        queryParams: {  }
      }
    )
  }

}
