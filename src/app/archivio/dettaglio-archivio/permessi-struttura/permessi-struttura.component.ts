import { Component, Input, OnInit } from '@angular/core';
import { Archivio, ArchivioDetail, PermessoEntitaStoredProcedure } from '@bds/ng-internauta-model';
import { PagingConf } from '@nfa/next-sdr';
import {TableModule} from 'primeng/table';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-permessi-struttura',
  templateUrl: './permessi-struttura.component.html',
  styleUrls: ['./permessi-struttura.component.scss']
})
export class PermessiStrutturaComponent implements OnInit {
 public perms: any[]=[];
  public cols: any[];
  public subscriptions: Subscription[] = [];
  private pageConfNoCountNoLimit: PagingConf = { mode: "LIMIT_OFFSET_NO_COUNT", conf: { limit: 9999, offset: 0 } };
  private _archivio: Archivio | ArchivioDetail;

  get archivio(): Archivio | ArchivioDetail { return this._archivio; }
  @Input() set archivio(archivio: Archivio | ArchivioDetail) {
    this._archivio = archivio;
    this.buildPermessiStruttura(this.archivio.permessi);
  }
  constructor(
    // private permessiService: PermessiService
  ) { }

  ngOnInit(): void {
    
    this.cols = [
      { field: 'struttura', header: 'Struttura' },
      { field: 'permesso', header: 'Permesso' },
      { field: 'trasmetti', header: 'Trasmetti a strutture figlie' },
      { field: 'propaga', header: 'Propaga a sottolivelli' },
      { field: 'ereditato', header: 'Ereditato da sopralivello' },
      { field: 'azione', header: 'Azione' }
    ];
    
  }
  private buildPermessiStruttura(oggettone: PermessoEntitaStoredProcedure[]) {
    let struttura: string = "";
    console.log(oggettone);
      oggettone.forEach(oggetto => {
        if (oggetto.soggetto.table === "strutture") {
          oggetto.categorie.forEach(categoria => {
            categoria.permessi.forEach(permesso => {
              this.perms.push({
                'struttura': oggetto.soggetto.descrizione,
                'trasmetti': permesso.propaga_soggetto,
                'permesso': permesso.predicato,
                'propaga': permesso.propaga_oggetto,
                'ereditato': permesso.virtuale,
                'azione': ""
              })
            })
          }
          )
        }
      })
      console.log('permessi buildati');
      console.log(this.perms);
    }
}
