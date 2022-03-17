import { Component, OnInit } from '@angular/core';
import { CaptionConfiguration } from '../generic-caption-table/caption-configuration';

@Component({
  selector: 'app-docs-list-container',
  templateUrl: './docs-list-container.component.html',
  styleUrls: ['./docs-list-container.component.scss']
})
export class DocsListContainerComponent implements OnInit {

  public captionConfiguration: CaptionConfiguration;

  constructor() {
    this.captionConfiguration = new CaptionConfiguration(true, true, true, true, false);
  }

  ngOnInit(): void {}
}
