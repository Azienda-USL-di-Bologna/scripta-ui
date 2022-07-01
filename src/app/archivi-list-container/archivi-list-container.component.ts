import { Component, OnInit } from '@angular/core';
import { CaptionConfiguration } from '../generic-caption-table/caption-configuration';

@Component({
  selector: 'app-archivi-list-container',
  templateUrl: './archivi-list-container.component.html',
  styleUrls: ['./archivi-list-container.component.scss']
})
export class ArchiviListContainerComponent implements OnInit {

  public captionConfiguration: CaptionConfiguration;

  constructor() {
    this.captionConfiguration = new CaptionConfiguration(true, true, true, true, true, false);
  }

  ngOnInit(): void {
  }

}
