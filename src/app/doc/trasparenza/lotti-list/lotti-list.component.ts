import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Lotto, LottoService, getInternautaUrl, BaseUrlType, ENTITIES_STRUCTURE, DocDetailService } from '@bds/internauta-model';
import { FILTER_TYPES, FilterDefinition, FiltersAndSorts, PagingConf } from '@bds/next-sdr';
import { MessageService } from 'primeng/api';
import { Table } from 'primeng/table';

@Component({
  selector: 'app-lotti-list',
  templateUrl: './lotti-list.component.html',
  styleUrls: ['./lotti-list.component.scss']
})
export class LottiListComponent implements OnInit {

  public dialogDisplay: boolean = false;
  public idEsterno: string = "";
  listaLotti: Lotto[];
  public data: any[] = [];
  public selectedRow: any;
  public loading: boolean = true;
  @ViewChild("dt") dt: Table;
  public LOADED_ROWS = 30;
  public totalRecords: number;

  public cols: any[] = [
    { field: "cig", header: "CIG", tooltip: "" },
    { field: "lotto", header: "Lotto", tooltip: "" },
    { field: "oggetto", header: "Oggetto", tooltip: "" },
    { field: "tipologia", header: "Tipologia", tooltip: "" },
    { field: "importo-totale", header: "Importo Totale", tooltip: "" },
    { field: "importo-liquidato", header: "Importo Liquidato", tooltip: "" },
    ];


  constructor(
    protected _http: HttpClient, 
    private route: ActivatedRoute,
    private lottoService: LottoService,
    private docDetailService: DocDetailService,
    private messageService: MessageService ) { }

  ngOnInit(): void {
    this.loading = true;
    this.idEsterno = this.route.snapshot.queryParamMap.get('guid');
    const apiUrl = getInternautaUrl(BaseUrlType.Lotti)
    const filterAndSort = new FiltersAndSorts();
    filterAndSort.addFilter(new FilterDefinition("idDoc.idEsterno", FILTER_TYPES.string.equals, this.idEsterno));
    const pageConfNoLimit: PagingConf = {conf: {page: 0,size: 999999},mode: "PAGE_NO_COUNT"};
    this.lottoService.getData(
      ENTITIES_STRUCTURE.lotti.lotto.customProjections.LottoWithAll,
      filterAndSort, null,
      pageConfNoLimit
    ).subscribe(
      res => {
        this.totalRecords = 0;

        if (res.results && res.results.length > 0) {
          this.totalRecords = res.page.totalElements;
          this.listaLotti = [...res.results];
        } 
        this.loading = false;
      }
    );
  }

  onRowEditInit(rowdata: any): void {
    this.selectedRow = {...rowdata};
    this.dialogDisplay = true;
  }

  deleteRow(rowData: any): void {
    const index = this.listaLotti.indexOf(rowData);
    if (index !== -1) {
      this.listaLotti.splice(index, 1);
    }
    this.lottoService.deleteHttpCall(rowData.id).subscribe(
      res => {
        this.messageService.add({
          severity: "success",
          summary: "Lotto",
          detail: "Lotto eliminato con successo"
        });
      }
    );
  }
  
  aggiungiLotto(): void {
    this.dialogDisplay = true;
    //this.listaLotti.push({cig: "second", oggetto: "Oggetto", cf_struttura_proponente: 1, denominazione_struttura: "demo"});
  }

  public cancelDialog() {
    this.dialogDisplay = false;
  }

  public chiudiLottoList(): void {
    const apiUrl = getInternautaUrl(BaseUrlType.Lotti) + "/refreshLotti" + "?guid=" + this.idEsterno ;
    this._http.get(apiUrl).subscribe(
      res => {
        window.close();
      }
    );
  }
}

export class LottiList {
  public cig: string;
  public oggetto: string;
  public cf_struttura_proponente: number;
  public denominazione_struttura: string;
  }