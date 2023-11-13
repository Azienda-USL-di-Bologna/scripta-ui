import { HttpClient } from '@angular/common/http';
import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Lotto, LottoService, getInternautaUrl, BaseUrlType, ENTITIES_STRUCTURE } from '@bds/internauta-model';
import { FILTER_TYPES, FilterDefinition, FiltersAndSorts, PagingConf } from '@bds/next-sdr';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Table } from 'primeng/table';
import { AppService } from 'src/app/app.service';

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
  public totalRecords: number;
  public editLottoRow: Lotto = null;
  public appName: string = "Trasparenza  - Legge 190 - Elenco Lotti";

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
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private appService: AppService ) { }

  ngOnInit(): void {
    this.appService.appNameSelection(this.appName);
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

  onRowEditInit(lotto: Lotto) {
    this.dialogDisplay = true;
    this.editLottoRow = lotto;
  }

  deleteRow(rowData: any): void {
    const index = this.listaLotti.indexOf(rowData);
    this.confirmationService.confirm({
      message: 'Sei sicuro di voler eliminare il lotto?',
        header: 'Conferma',
        icon: 'pi pi-exclamation-triangle',
        accept: () => { 
          this.loading = true;    
          if (index !== -1) {
            this.listaLotti.splice(index, 1);
          }
          this.lottoService.deleteHttpCall(rowData.id).subscribe(
            res => {
              this.messageService.add({
                severity: "success",
                summary: "Successo",
                detail: "Lotto eliminato con successo"
              });
              this.totalRecords = this.totalRecords - 1;
              this.loading = false;
            }
          );
        },
        reject: () => {
          /* L'utente ha cambaito idea. Non faccio nulla */ 
        }
    });
    
  }
  
  aggiungiLotto(): void {
    this.dialogDisplay = true;
    this.editLottoRow = null;
  }

  public cancelDialog() {
    this.dialogDisplay = false;
  }

  public saveDialog() {
    this.dialogDisplay = false;
    this.lottoService.postHttpCall(new Lotto())
      .subscribe(result => {
        this.listaLotti.push(result);
      }
    );
  }

  public refreshLotti() {
    const apiUrl = getInternautaUrl(BaseUrlType.Lotti) + "/refreshLotti" + "?guid=" + this.idEsterno ;
    this._http.get(apiUrl).subscribe(
      res => {
        window.close();
      }
    );
  }
    
  @HostListener('window:beforeunload', ['$event'])
  public onWindowClose(event: BeforeUnloadEvent): void {
    this.refreshLotti();
  }
  
  public chiudiLottoList(): void {
    this.refreshLotti();
  }
}

export class LottiList {
  public cig: string;
  public oggetto: string;
  public cf_struttura_proponente: number;
  public denominazione_struttura: string;
}