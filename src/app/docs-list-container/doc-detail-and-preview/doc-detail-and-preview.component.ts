import { Component, Input, OnInit } from '@angular/core';
import { ExtendedDocDetailView } from '../docs-list/extended-doc-detail-view';

@Component({
  selector: 'doc-detail-and-preview',
  templateUrl: './doc-detail-and-preview.component.html',
  styleUrls: ['./doc-detail-and-preview.component.scss']
})
export class DocDetailAndPreviewComponent implements OnInit {
  _doc: ExtendedDocDetailView;
  get doc(): ExtendedDocDetailView {
    return this._doc;
  }
  @Input() set doc(doc: ExtendedDocDetailView) {
    this._doc = doc;
  }

  constructor(
  ) { }

  ngOnInit(): void {
  }
}


