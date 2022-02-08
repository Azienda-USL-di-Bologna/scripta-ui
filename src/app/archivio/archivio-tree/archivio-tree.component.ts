import { Component, Input, OnInit } from '@angular/core';
import { TabComponent } from 'src/app/navigation-tabs/tab.component';

@Component({
  selector: 'app-archivio-tree',
  templateUrl: './archivio-tree.component.html',
  styleUrls: ['./archivio-tree.component.scss']
})
export class ArchivioTreeComponent implements OnInit, TabComponent {
  @Input() data: any;

  constructor() { }

  ngOnInit(): void {
    console.log("ArchivioTreeComponent.ngOnInit()", this.data);

  }

}
