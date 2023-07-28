import { Component, Input, OnInit } from '@angular/core';
import { ArchivioDoc, Doc } from '@bds/internauta-model';

@Component({
  selector: 'archivio-doc',
  templateUrl: './archivio-doc.component.html',
  styleUrls: ['./archivio-doc.component.scss']
})
export class ArchivioDocComponent implements OnInit {
  private _doc: Doc;
  public archiviDoc: ArchivioDoc[];
  
  public get doc(): Doc {
    return this._doc;
  }
  @Input() public set doc(value: Doc) {
    this._doc = value;
  }
  constructor() { }

  ngOnInit(): void {
    this.settaArchivio();
  }

  public settaArchivio(): void {
    this.archiviDoc = this.doc.archiviDocList;
  }
}
