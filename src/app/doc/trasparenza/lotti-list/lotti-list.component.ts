import { DatePipe } from '@angular/common';
import { HttpClient } from "@angular/common/http";
import { Component, OnInit, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from "@angular/router";
import {
  Lotto,
  LottoService,
  getInternautaUrl,
  BaseUrlType,
  ENTITIES_STRUCTURE,
  Tipologia,
  Doc,
  Contraente,
  DocService,
} from "@bds/internauta-model";
import {
  FILTER_TYPES,
  FilterDefinition,
  FiltersAndSorts,
  PagingConf,
} from "@bds/next-sdr";
import { MessageService } from "primeng/api";
import { Table } from "primeng/table";

@Component({
  selector: "app-lotti-list",
  templateUrl: "./lotti-list.component.html",
  styleUrls: ["./lotti-list.component.scss"],
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
  public editLottoRow: Lotto = null;
  public doc: Doc = null;

  public lottoForm: FormGroup = this.formBuilder.group({
    cig: ["", [Validators.required]],
    lotto: ["", [Validators.required]],
    idTipologia: [new Tipologia(), [Validators.required]],
    idContraente: [new Contraente(), [Validators.required]],
    oggetto: ["", [Validators.required]],
    importoTotale: ["", [Validators.required]],
    importoLiquidato: ["", [Validators.required]],
    dataInizio: ["", [Validators.required]],
    dataCompletamento: ["", [Validators.required]],
  });
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
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private lottoService: LottoService,
    private docService: DocService,
    private messageService: MessageService,
    private dataPipe: DatePipe
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.idEsterno = this.route.snapshot.queryParamMap.get("guid");
    const filterAndSortDoc = new FiltersAndSorts();
    filterAndSortDoc.addFilter(
      new FilterDefinition(
        "idEsterno",
        FILTER_TYPES.string.equals,
        this.idEsterno
      )
    );
    this.docService.getData(
      ENTITIES_STRUCTURE.scripta.docdetail.customProjections.DocWithAll,
      filterAndSortDoc
    ).subscribe((res) => {
      if (res.results && res.results.length == 1) {
        this.doc = res.results[0];
        
        const filterAndSort = new FiltersAndSorts();
        filterAndSort.addFilter(
          new FilterDefinition(
            "idDoc.id",
            FILTER_TYPES.not_string.equals,
            this.doc.id
          )
        );
        const pageConfNoLimit: PagingConf = {
          conf: { page: 0, size: 999999 },
          mode: "PAGE_NO_COUNT",
        };
        this.lottoService
          .getData(
            ENTITIES_STRUCTURE.lotti.lotto.customProjections.LottoWithAll,
            filterAndSort,
            null,
            pageConfNoLimit
          )
          .subscribe((res) => {
            this.totalRecords = 0;
    
            if (res.results && res.results.length > 0) {
              this.totalRecords = res.page.totalElements;
              this.listaLotti = [...res.results];
            }
            this.loading = false;
          });
      }
    });
  }

  onRowEditInit(lotto: Lotto) {
    this.dialogDisplay = true;
    this.editLottoRow = lotto;
    const lottoToEdit = {
      cig:lotto.cig,
      lotto: lotto.lotto,
      idTipologia: lotto.idTipologia,
      idContraente: lotto.idContraente,
      oggetto: lotto.oggetto,
      importoTotale: lotto.importoTotale,
      importoLiquidato: lotto.importoLiquidato,
      dataInizio: lotto.dataInizio,
      dataCompletamento: lotto.dataCompletamento,
    }
    this.lottoForm.reset(lottoToEdit);
  }

  deleteRow(rowData: any): void {
    const index = this.listaLotti.indexOf(rowData);
    if (index !== -1) {
      this.listaLotti.splice(index, 1);
    }
    this.lottoService.deleteHttpCall(rowData.id).subscribe((res) => {
      this.messageService.add({
        severity: "success",
        summary: "Lotto",
        detail: "Lotto eliminato con successo",
      });
      this.dt._filter();
    });
  }

  aggiungiLotto(): void {
    this.dialogDisplay = true;
    this.editLottoRow = new Lotto();
    const newLotto = {
      cig: "",
      lotto: "",
      idTipologia: new Tipologia(),
      idContraente:  new Contraente(),
      oggetto: "",
      importoTotale: "",
      importoLiquidato: "",
      dataInizio: "",
      dataCompletamento: "",
    }
    this.lottoForm.reset(newLotto);
  }

  public cancelDialog() {
    this.dialogDisplay = false;
  }

  public isRealyChangedAnything() {
    return this.lottoForm.controls.lotto.value !== this.editLottoRow.lotto ||
           this.lottoForm.controls.cig.value !== this.editLottoRow.cig ||
           this.lottoForm.controls.oggetto.value !== this.editLottoRow.oggetto ||
           this.lottoForm.controls.idTipologia.value.id !== this.editLottoRow.idTipologia.id || 
           this.lottoForm.controls.idContraente.value.id !== this.editLottoRow.idContraente.id || 
           this.lottoForm.controls.importoLiquidato.value !== this.editLottoRow.importoLiquidato ||
           this.lottoForm.controls.importoTotale.value !== this.editLottoRow.importoTotale || 
           this.lottoForm.controls.dataInizio.value !== this.editLottoRow.dataInizio || 
           this.lottoForm.controls.dataCompletamento.value !== this.editLottoRow.dataCompletamento
  }

  public saveDialog() {
    this.dialogDisplay = false;
    if (this.editLottoRow.id && this.editLottoRow.id > 0) {
      const campiModificatiDelLotto: Lotto = new Lotto();
      if (this.lottoForm.controls.lotto.dirty && this.lottoForm.controls.lotto.value !== this.editLottoRow.lotto){
        campiModificatiDelLotto.lotto = this.lottoForm.controls.lotto.value;        
      }
      if (this.lottoForm.controls.cig.dirty && this.lottoForm.controls.cig.value !== this.editLottoRow.cig){
        campiModificatiDelLotto.cig = this.lottoForm.controls.cig.value;        
      } 
      if (this.lottoForm.controls.oggetto.dirty && this.lottoForm.controls.oggetto.value !== this.editLottoRow.oggetto){
        campiModificatiDelLotto.oggetto = this.lottoForm.controls.oggetto.value;        
      } 
      if (this.lottoForm.controls.idContraente.dirty && this.lottoForm.controls.idContraente.value.id !== this.editLottoRow.idContraente.id){
        campiModificatiDelLotto.idContraente = {id: this.lottoForm.controls.idContraente.value.id} as any;        
      } 
      if (this.lottoForm.controls.idTipologia.dirty && this.lottoForm.controls.idTipologia.value.id !== this.editLottoRow.idTipologia.id){
        campiModificatiDelLotto.idTipologia = {id: this.lottoForm.controls.idTipologia.value.id} as any;       
      } 
      if (this.lottoForm.controls.importoLiquidato.dirty && this.lottoForm.controls.importoLiquidato.value !== this.editLottoRow.importoLiquidato){
        campiModificatiDelLotto.importoLiquidato = this.lottoForm.controls.importoLiquidato.value;        
      } 
      if (this.lottoForm.controls.importoTotale.dirty && this.lottoForm.controls.importoTotale.value !== this.editLottoRow.importoTotale){
        campiModificatiDelLotto.importoTotale = this.lottoForm.controls.importoTotale.value;        
      } 
      if (this.lottoForm.controls.dataInizio.dirty && this.lottoForm.controls.dataInizio.value !== this.editLottoRow.dataInizio){
        campiModificatiDelLotto.dataInizio = this.dataPipe.transform(this.lottoForm.controls.dataInizio.value, 'yyyy-MM-dd') as any;        
      } 
      if (this.lottoForm.controls.dataCompletamento.dirty && this.lottoForm.controls.dataCompletamento.value !== this.editLottoRow.dataCompletamento){
        campiModificatiDelLotto.dataCompletamento = this.dataPipe.transform(this.lottoForm.controls.dataCompletamento.value, 'yyyy-MM-dd') as any;        
      } 
      campiModificatiDelLotto.version = this.editLottoRow.version;
      delete campiModificatiDelLotto.nextSdrDateInformation;
      console.log(campiModificatiDelLotto);
      this.loading = true;
      this.lottoService.patchHttpCall(campiModificatiDelLotto, this.editLottoRow.id).subscribe(
        (res) => {
          const index = this.listaLotti.findIndex((x) => x.id == this.editLottoRow.id);
          this.listaLotti[index] = res;
          this.messageService.add({
            severity: "success",
            summary: "Lotto",
            detail: "Lotto aggiornato con successo"
          });
          this.loading = false;
        },
        (error) => {
          this.messageService.add({
            severity: "error",
            summary: "Errore",
            detail: "Errore durante il salvataggio",
          });
          this.loading = false;
        }
      )
    } else {
      const newLotto = new Lotto();
      newLotto.id = null;
      newLotto.cig = this.lottoForm.value['cig'];
      newLotto.lotto = this.lottoForm.value['lotto'];
      newLotto.idTipologia = {id: this.lottoForm.value['idTipologia'].id} as any;
      newLotto.idContraente = {id: this.lottoForm.value['idContraente'].id} as any;
      newLotto.idDoc = {id: this.doc.id} as any;
      newLotto.oggetto = this.lottoForm.value['oggetto'];
      newLotto.importoLiquidato = this.lottoForm.value['importoLiquidato'];
      newLotto.importoTotale = this.lottoForm.value['importoTotale'];
      newLotto.dataCompletamento = this.dataPipe.transform(this.lottoForm.value['dataCompletamento'], 'yyyy-MM-dd') as any;
      newLotto.dataInizio = this.dataPipe.transform(this.lottoForm.value['dataInizio'], 'yyyy-MM-dd') as any;
      delete newLotto.nextSdrDateInformation;
      console.log(newLotto);
      this.loading = true;
      this.lottoService.postHttpCall(newLotto).subscribe(
        (result) => {
          this.messageService.add({
            severity: "success",
            summary: "Lotto",
            detail: "Lotto aggiunto con successo",
          });
          this.loading = false;
          this.listaLotti.unshift(result);
        },
        (error) => {
          this.messageService.add({
            severity: "error",
            summary: "Errore",
            detail: "Errore durante il salvataggio",
          });
          this.loading = false;
        }
      );
    }
  }

  public chiudiLottoList(): void {
    const apiUrl =
      getInternautaUrl(BaseUrlType.Lotti) +
      "/refreshLotti" +
      "?guid=" +
      this.idEsterno;
    this._http.get(apiUrl).subscribe((res) => {
      window.close();
    });
  }
}

export class LottiList {
  public cig: string;
  public oggetto: string;
  public cf_struttura_proponente: number;
  public denominazione_struttura: string;
}
