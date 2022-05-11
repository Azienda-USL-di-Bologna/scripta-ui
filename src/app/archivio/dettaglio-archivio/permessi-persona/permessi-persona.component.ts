import { Component, Input, OnInit } from '@angular/core';
import { Archivio, ArchivioDetail, PermessoEntitaStoredProcedure } from '@bds/ng-internauta-model';
import { PagingConf } from '@nfa/next-sdr';

@Component({
  selector: 'app-permessi-persona',
  templateUrl: './permessi-persona.component.html',
  styleUrls: ['./permessi-persona.component.scss']
})
export class PermessiPersonaComponent implements OnInit {
  
  public perms: any[]= [];
  cols: any[];
  private pageConfNoCountNoLimit: PagingConf = { mode: "LIMIT_OFFSET_NO_COUNT", conf: { limit: 9999, offset: 0 } };
  private _archivio: Archivio | ArchivioDetail;

  get archivio(): Archivio | ArchivioDetail { return this._archivio; }
  @Input() set archivio(archivio: Archivio | ArchivioDetail) {
    this._archivio = archivio;
    this.buildPermessoPersona(this.archivio.permessi);
  }
  constructor(
    // permessiService: PermessiService
  ) { }
  
  ngOnInit(): void {
    this.cols = [
      { field: 'persona', header: 'Persona' },
      { field: 'struttura', header: 'Struttura' },
      { field: 'permesso', header: 'Permesso' },
      { field: 'propaga', header: 'Propaga a sottolivelli' },
      { field: 'ereditato', header: 'Ereditato da sopralivello' },
      { field: 'azione', header: 'Azione' }
    ];
  }
  
  private buildPermessoPersona(oggettone: PermessoEntitaStoredProcedure[]) {
    let struttura:string = "";
    oggettone.forEach(oggetto => {
      if (oggetto.soggetto.table === "persone") {
        oggetto.categorie.forEach(categoria => {
          categoria.permessi.forEach(permesso => {
            if (permesso.entita_veicolante) {
              struttura = permesso.entita_veicolante.descrizione;
            } else {
              struttura = 'none';
            }
            this.perms.push({
              'persona': oggetto.soggetto.descrizione.split(" [")[0],
              'struttura': struttura,
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
  }
}

