import { Component, OnInit } from '@angular/core';
import { CaptionComponent, CaptionConfiguration } from '../generic-caption-table/caption-configuration';

@Component({
  selector: 'app-archivi-list-container',
  templateUrl: './archivi-list-container.component.html',
  styleUrls: ['./archivi-list-container.component.scss']
})
export class ArchiviListContainerComponent implements OnInit {

  public captionConfiguration: CaptionConfiguration;

  constructor() {
    this.captionConfiguration = new CaptionConfiguration(CaptionComponent.ARCHIVI_LIST, true, true, true, true, true, false, false, true);
  }

  ngOnInit(): void {
  }

}
