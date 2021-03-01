import { Injectable } from '@angular/core';
import { UnitaDocumentaria, Registro, DocumentoRegistro } from '@bds/ng-internauta-model';

@Injectable({
  providedIn: 'root'
})
export class RegistrationServiceService {
  constructor() { }
  private registerNumberForTest = Math.round(Math.random() * 1000);

  private staccaNuovoNumero(): number{
    return this.registerNumberForTest++;
  }

  getNewDocumentoRegistro(doc: UnitaDocumentaria, codiceRegistro: string): DocumentoRegistro{
    const r = new Registro();
    r.codiceRegistro = codiceRegistro;
    r.nomeRegistro = 'Protocollo';
    r.tipoOggetto = 'DocumentoPico';

    const dc = new DocumentoRegistro();
    dc.idDocumento = doc;
    dc.idRegistro = r;
    dc.dataRegistrazione = new Date();
    dc.numero = this.staccaNuovoNumero();

    return dc;

  }
}
