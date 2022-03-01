import { Component, Input, OnInit } from '@angular/core';
import { ArchivioDetail } from '@bds/ng-internauta-model';
import { TabComponent } from '../navigation-tabs/tab.component';

@Component({
  selector: 'app-archivio',
  templateUrl: './archivio.component.html',
  styleUrls: ['./archivio.component.scss']
})
export class ArchivioComponent implements OnInit, TabComponent {
  private _archivio: ArchivioDetail;
  get archivio(): ArchivioDetail { return this._archivio; }
  @Input() set data(data: any) {
    this._archivio = data.archivio;
  }

  constructor() { }

  ngOnInit(): void {
  }
}
