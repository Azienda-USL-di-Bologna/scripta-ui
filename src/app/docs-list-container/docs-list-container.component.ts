import { Component, OnInit, ViewChild } from '@angular/core';
import { CaptionComponent, CaptionConfiguration } from '../generic-caption-table/caption-configuration';
import { FunctionButton } from '../generic-caption-table/functional-buttons/functions-button';
import { DocsListMode } from './docs-list/docs-list-constants';
import { DocsListComponent } from './docs-list/docs-list.component';
import { ExtendedDocDetailView } from './docs-list/extended-doc-detail-view';

@Component({
  selector: 'app-docs-list-container',
  templateUrl: './docs-list-container.component.html',
  styleUrls: ['./docs-list-container.component.scss']
})
export class DocsListContainerComponent implements OnInit {
  //public functionButton: FunctionButton;
  public captionConfiguration: CaptionConfiguration;
  public showRightSide: boolean = false;
  public docForDetailAndPreview: ExtendedDocDetailView;
  @ViewChild('doclist') doclistComponent: DocsListComponent;

  constructor() {
    this.captionConfiguration = new CaptionConfiguration(
      CaptionComponent.DOCS_LIST, 
      true, 
      true, 
      true, 
      true, 
      false, 
      false, 
      false, 
      true, 
      false, 
      false
    );
  }

  ngOnInit(): void {}

  public manageRowSelected(event: {showPanel: boolean, rowSelected: ExtendedDocDetailView }) {
    this.showRightSide = event.showPanel;
    this.docForDetailAndPreview = event.rowSelected;
  }

  public manageDocListModeSelectd(event: {docListModeSelected: DocsListMode}) {
    if (event.docListModeSelected === DocsListMode.ERRORI_VERSAMENTO) {
      this.captionConfiguration.functionButton = true;
    } else {
      this.captionConfiguration.functionButton = false;
    }
  }
}
