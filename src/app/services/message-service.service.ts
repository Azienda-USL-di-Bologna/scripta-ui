import { Injectable } from '@angular/core';
import { MessageService } from 'primeng-lts/api';

@Injectable({
  providedIn: 'root',
})
export class MessageServiceService {
  constructor(private messageService: MessageService) { }

  public showMessageSuccessfulMessage(_summary: string, _detail: string, _sticky?: boolean){
    this.messageService.add({sticky: _sticky, severity: 'success', summary: _summary, detail: _detail, life: 2000});
  }

  public cleaMessages() {
    this.messageService.clear();
  }
}
