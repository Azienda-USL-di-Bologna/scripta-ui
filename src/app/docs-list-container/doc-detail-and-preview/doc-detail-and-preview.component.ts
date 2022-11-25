import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ExtendedDocDetailView } from '../docs-list/extended-doc-detail-view';
import { AttachmentsBoxConfig } from '@bds/common-components';

@Component({
  selector: 'doc-detail-and-preview',
  templateUrl: './doc-detail-and-preview.component.html',
  styleUrls: ['./doc-detail-and-preview.component.scss']
})
export class DocDetailAndPreviewComponent implements OnInit {
  public accordionSelected: boolean[] = [true, false];
  @Output('closeRightPanel') closeRightPanel = new EventEmitter();
  _doc: ExtendedDocDetailView;
  get doc(): ExtendedDocDetailView {
    return this._doc;
  }
  @Input() set doc(doc: ExtendedDocDetailView) {
    this._doc = doc;
  }
  public attachmentsBoxConfig: AttachmentsBoxConfig;

  constructor(
  ) {
    this.attachmentsBoxConfig = new AttachmentsBoxConfig();
    this.attachmentsBoxConfig.showPreview = true;
    this.attachmentsBoxConfig.showInfoVersamento = false;
    this.attachmentsBoxConfig.showHeader = false;
  }

  ngOnInit(): void {
  }
}
