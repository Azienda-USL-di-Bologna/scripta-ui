import { Component, OnInit, SimpleChanges, OnChanges } from '@angular/core';
import { DocumentServiceService } from '../services/document-service.service';
import { UnitaDocumentaria } from '@bds/ng-internauta-model';
import { MessageService } from 'primeng-lts/api/public_api';
import { MessageServiceService } from '../services/message-service.service';

@Component({
  selector: 'app-i-doc',
  templateUrl: './i-doc.component.html',
  styleUrls: ['./i-doc.component.scss']
})
export class IDocComponent implements OnInit, OnChanges {
  private numeroProtocolloHardCodedTest = 500;
  public unitaDocumentaria!: UnitaDocumentaria;

  constructor(private documentService: DocumentServiceService, private messageService: MessageServiceService) { }

  ngOnInit(): void {
    this.loadDocument();
  }

  private loadDocument(): void{

    this.documentService.loadDocumentDataById(1236).then(res => {
      console.log('idoc->loadDocumentDataById', res);

      this.unitaDocumentaria = res;
    });

  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log('Parent onChanges', changes);

  }

  public onDoSave(event: any): void{
    console.log('Emittend event', event);
  }
  public onDoProtocolla(event: any): void{
    console.log('Emittend event', event);
    this.documentService.protocollaIn(event).then(res => {
      console.log('Res di onProtocolla', res);
      const d: UnitaDocumentaria = res;
      const registrazione = d.registriList[0];
      const messageHeader = 'Registrazione ' +  registrazione.idRegistro.nomeRegistro + ' ' + registrazione.numero;
      this.messageService.showMessageSuccessfulMessage(messageHeader, 'Resgistrazione avvenuta con successo');
    });



  }

  clearMessages(){
    this.messageService.cleaMessages();
  }

}
