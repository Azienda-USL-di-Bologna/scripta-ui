import { Component, Input, OnInit } from '@angular/core';
import { Archivio, ArchivioDetail } from '@bds/ng-internauta-model';

@Component({
  selector: 'dettaglio-archivio',
  templateUrl: './dettaglio-archivio.component.html',
  styleUrls: ['./dettaglio-archivio.component.scss']
})
export class DettaglioArchivioComponent implements OnInit {

  private _archivio: Archivio | ArchivioDetail;
  get archivio(): Archivio | ArchivioDetail { return this._archivio; }
  @Input() set archivio(archivio: Archivio | ArchivioDetail) {
    this._archivio = archivio;
  }

  constructor() { }

  ngOnInit(): void {
  }

}
