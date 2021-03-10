import { Component, OnInit } from '@angular/core';
import { MessageService } from 'primeng-lts/api';

@Component({
  selector: 'allegati',
  templateUrl: './allegati.component.html',
  styleUrls: ['./allegati.component.scss']
})
export class AllegatiComponent implements OnInit {


  uploadedFiles: any[] = [];

  constructor(private messageService: MessageService) {}

  ngOnInit(): void {
  }
  
  onUpload(event: any) {
      for(let file of event.files) {
          this.uploadedFiles.push(file);
      }

      this.messageService.add({severity: 'info', summary: 'File Uploaded', detail: ''});
  }
}
