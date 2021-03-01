import { Component, OnInit, Input, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { Documento } from '@bds/ng-internauta-model';



@Component({
  selector: 'peis',
  templateUrl: './peis.component.html',
  styleUrls: ['./peis.component.scss']
})
export class PeisComponent implements OnInit, OnChanges {
  @Input() document: Documento | undefined;
  @Output() save = new EventEmitter<any>();
  @Output() protocolla = new EventEmitter<any>();

  public autoResize: Boolean = true;
  constructor() { }

  ngOnInit(): void {
    console.log('DOCUMENT', this.document);

  }

  ngOnChanges(changes: SimpleChanges): void {
    // console.log('Child onChanges', changes);
    // forse è meglio non salvare tutte le volte che facciamo delle modifiche... ma nel caso
  }

  doButtonSave(): void{
    console.log('Cliccato Salva');
    this.save.emit(this.document);
  }

  doButtonProtocolla(): void{
    console.log('Cliccato Protocolla');
    this.protocolla.emit(this.document);
  }

  doButtonNote(): void{
    console.log('Cliccato Note');
  }

}
