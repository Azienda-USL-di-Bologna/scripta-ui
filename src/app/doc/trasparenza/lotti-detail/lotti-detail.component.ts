import { Component, Input, OnInit } from '@angular/core';
import { Contraente, Tipologia } from '@bds/internauta-model';
import { LottiDetailService } from './lotti-detail.service';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-lotti-detail',
  templateUrl: './lotti-detail.component.html',
  styleUrls: ['./lotti-detail.component.scss']
})

export class LottiDetailComponent implements OnInit {
  public display: boolean;
  public tipologia: Tipologia[];
  public contraente: Contraente[];

  private _lottoForm: FormGroup;
  get lottoForm(): FormGroup {
    return this._lottoForm;
  }
  @Input() set lottoForm(value: FormGroup) {
    this._lottoForm = value;
  }

  constructor(
    private lottiDetailService: LottiDetailService,
    ) { }
 
  ngOnInit(): void {
    // if (!this._lottoForm){
    //   this._lottoForm = new FormGroup();
    // } 
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