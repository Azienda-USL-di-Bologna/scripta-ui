import { Component, OnInit } from '@angular/core';
import { CaptionComponent, CaptionConfiguration } from '../generic-caption-table/caption-configuration';

@Component({
  selector: 'app-tip-container',
  templateUrl: './tip-container.component.html',
  styleUrls: ['./tip-container.component.scss']
})
export class TipContainerComponent implements OnInit {

  public captionConfiguration: CaptionConfiguration;

  constructor() {
    this.captionConfiguration = new CaptionConfiguration(CaptionComponent.ARCHIVI_LIST, true, true, true, true, true, false, false, true, false);
  }

  ngOnInit(): void {
  }

}
