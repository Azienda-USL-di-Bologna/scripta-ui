import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ArchivioDetailService } from '@bds/ng-internauta-model';

@Injectable({
  providedIn: 'root'
})
export class ArchivioService extends ArchivioDetailService {


  constructor(protected _http: HttpClient, protected _datepipe: DatePipe) {
    super(_http, _datepipe);
  }
}
