import { Injectable } from '@angular/core';
import { promise } from 'protractor';
import { UnitaDocumentaria, Registro, DocumentoRegistro } from '@bds/ng-internauta-model';
import { RegistrationServiceService } from './registration-service.service';
import { registerLocaleData } from '@angular/common';
import { resolve } from 'dns';
import { async } from '@angular/core/testing';

@Injectable({
  providedIn: 'root'
})

export class DocumentServiceService {
  private propostaNumberForTest = Math.round(Math.random() * 100);

  constructor(private registrationService: RegistrationServiceService) { }

  public loadDocumentDataById(id: number): Promise<UnitaDocumentaria>{
    // per test
    // const doc = this.getFakeUD();


    // TODO: implementazione della loadById

    return new Promise((resolve) => resolve(this.getFakeUD()));
  }

  private getFakeUD(): UnitaDocumentaria{
    const doc: UnitaDocumentaria = new UnitaDocumentaria();
    doc.dataCreazione = new Date();
    // doc.idUtenteCreazione.idPersona.descrizione = 'Campa Rosanna';
    doc.numeroProposta = '2021-' + this.propostaNumberForTest; ;
    return doc;
  }

  public registerDocument(doc: UnitaDocumentaria, codiceRegistro: string): Promise<UnitaDocumentaria>{
    const documentoRegistro = this.registrationService.getNewDocumentoRegistro(doc, codiceRegistro);
    doc.dataRegistrazione = documentoRegistro.dataRegistrazione;
    if (!doc.registriList) {
      doc.registriList = [];
    }
    doc.registriList.push(documentoRegistro);
    console.log('Risolvo doc', doc);

    return new Promise((resolve) => resolve(doc) );
  }

  public async protocollaIn(doc: UnitaDocumentaria): Promise<UnitaDocumentaria> {
      const res = await this.registerDocument(doc, 'PG_IN');
      console.log('Ho aspettato la Res', res);

      return new Promise((resolve) => resolve(res) );
  }

}
