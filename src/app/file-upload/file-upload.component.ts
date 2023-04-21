import { Component, Input, OnInit } from '@angular/core';
import { CaptionFunctionalOperationsComponent } from '../generic-caption-table/caption-functional-operations.component';

@Component({
  selector: 'file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.scss']
})

export class FileUploadComponent implements OnInit {
  public maxSizeUpload: Number = 500000000;
  public uploadedFiles: File[] = [];
  public nomiNuovi: string[] = [];

  @Input() functionalOperationsComponent: CaptionFunctionalOperationsComponent;

  constructor() { }

  ngOnInit(): void {
  }

  public onSelect(event: any) {
    //this.nomiNuovi = [];
    this.uploadedFiles = [];
    console.log(event);
    event.currentFiles.forEach((file: File, index: number) => {
      this.uploadedFiles.push(file);
      if (this.nomiNuovi.length <= index) {
        this.nomiNuovi.push(file.name);
      }
    });
  }

  public onRename(event: any, file: File, index: Number) {
    /* console.log(index);
    console.log(event);
    console.log(file); */
    //const blob = file.slice(0, file.size, file.type); 
    //const newFile: any = new File([blob], this.nomiNuovi[index], {type: file.type});
    //console.log(newFile);
    //this.uploadedFiles[index] = newFile;
  }

  public manageFile(event: any) {
    console.log(event);
    this.functionalOperationsComponent.uploadDocument(event, this.nomiNuovi);
    this.nomiNuovi = [];
  }

}
