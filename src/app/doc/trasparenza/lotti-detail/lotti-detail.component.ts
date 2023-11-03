import { Component, Input, OnInit } from '@angular/core';
import { Contraente, Lotto, Tipologia } from '@bds/internauta-model';
import { LottiDetailService } from './lotti-detail.service';

@Component({
  selector: 'app-lotti-detail',
  templateUrl: './lotti-detail.component.html',
  styleUrls: ['./lotti-detail.component.scss']
})

export class LottiDetailComponent implements OnInit {
  public display: boolean;
  public tipologia: Tipologia[];
  public contraente: Contraente[];

  private _lotto: Lotto;
  get lotto(): Lotto {
    return this._lotto;
  }
  @Input() set lotto(value: Lotto) {
    this._lotto = value;
  }

  constructor( private lottiDetailService: LottiDetailService) { }
 
  ngOnInit(): void {
    if (!this._lotto){
      this._lotto = new Lotto();
    } 
    this.lottiDetailService.getTipologie().subscribe(res => {
      if (res) {
        this.tipologia = res._embedded.tipologia;
      }
    });

    this.lottiDetailService.getContraente().subscribe(res => {
      if (res) {
        this.contraente = res._embedded.contraente;
      }
    });
  }
}