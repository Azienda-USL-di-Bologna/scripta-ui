import { Component, Input, OnInit } from '@angular/core';
import { TabComponent } from '../navigation-tabs/tab.component';



@Component({
  selector: 'app-archivio',
  templateUrl: './archivio.component.html',
  styleUrls: ['./archivio.component.scss']
})
export class ArchivioComponent implements OnInit, TabComponent {
  @Input() data: any;

  constructor() { }

  ngOnInit(): void {
    console.log("AchivioComp.ngOnInit", this.data);

  }

}
