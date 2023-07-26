import { Component, Input } from '@angular/core';
import { Doc } from '@bds/internauta-model';

@Component({
  selector: 'attori',
  templateUrl: './attori.component.html',
  styleUrls: ['./attori.component.scss']
})
export class AttoriComponent {
  
  @Input() set doc(value: Doc) {
    this._doc = value;
  }
  get doc(): Doc {
    return this._doc;
  }

  private _doc: Doc;

  constructor() { }

}
