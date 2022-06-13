import { Component, Input, OnInit } from '@angular/core';
import { Archivio, ArchivioDetail, AttoreArchivio, AttoreArchivioService, ENTITIES_STRUCTURE, RuoloAttoreArchivio } from '@bds/ng-internauta-model';
import { FilterDefinition, FiltersAndSorts, FILTER_TYPES, PagingConf, SortDefinition, SORT_MODES } from '@nfa/next-sdr';
import { Subscription } from 'rxjs/internal/Subscription';
@Component({
  selector: 'app-responsabili',
  templateUrl: './responsabili.component.html',
  styleUrls: ['./responsabili.component.scss']
})
export class ResponsabiliComponent implements OnInit {
  public responsabiliArchivi: AttoreArchivio[] = [];
  public subscriptions: Subscription[] = [];
  private pageConfNoCountNoLimit: PagingConf = { mode: "LIMIT_OFFSET_NO_COUNT", conf: { limit: 9999, offset: 0 } };
  private _archivio: Archivio | ArchivioDetail;

  get archivio(): Archivio | ArchivioDetail { return this._archivio; }
  @Input() set archivio(archivio: Archivio | ArchivioDetail) {
    this._archivio = archivio;
  }

  public _loggedUserIsResponsbaileOrVicario: Boolean;
  get loggedUserIsResponsbaileOrVicario(): Boolean { return this._loggedUserIsResponsbaileOrVicario; }
  @Input() set loggedUserIsResponsbaileOrVicario(loggedUserIsResponsbaileOrVicario: Boolean) {
    this._loggedUserIsResponsbaileOrVicario = loggedUserIsResponsbaileOrVicario;
  }
  
  constructor(private attoreArchivioService: AttoreArchivioService) { }

  ngOnInit(): void {
    this.getResponsabili();
  }


  private getResponsabili(): void {
    const filterAndSort: FiltersAndSorts = new FiltersAndSorts();
    filterAndSort.addFilter(new FilterDefinition("idArchivio.id",  FILTER_TYPES.not_string.equals, this.archivio.id));
    filterAndSort.addFilter(new FilterDefinition("ruolo", FILTER_TYPES.not_string.equals, RuoloAttoreArchivio.RESPONSABILE));
    filterAndSort.addFilter(new FilterDefinition("ruolo", FILTER_TYPES.not_string.equals, RuoloAttoreArchivio.VICARIO));
    filterAndSort.addFilter(new FilterDefinition("ruolo", FILTER_TYPES.not_string.equals, RuoloAttoreArchivio.RESPONSABILE_PROPOSTO));
    filterAndSort.addSort(new SortDefinition("ruolo", SORT_MODES.asc));
    this.subscriptions.push(this.attoreArchivioService.getData(
      ENTITIES_STRUCTURE.scripta.attorearchivio.standardProjections.AttoreArchivioWithIdPersonaAndIdStruttura,
      filterAndSort,
      null, 
      this.pageConfNoCountNoLimit).subscribe(
      res => {
        console.log(res.results);
        this.responsabiliArchivi = res.results;
      }
    ));
  }
}
