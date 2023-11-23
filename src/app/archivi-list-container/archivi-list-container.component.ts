import { Component, OnInit } from '@angular/core';
import { CODICI_RUOLO } from '@bds/internauta-model';
import { JwtLoginService, UtenteUtilities } from '@bds/jwt-login';
import { Subscription } from 'rxjs';
import { first } from 'rxjs/operators'
import { CaptionComponent, CaptionConfiguration } from '../generic-caption-table/caption-configuration';

@Component({
  selector: 'app-archivi-list-container',
  templateUrl: './archivi-list-container.component.html',
  styleUrls: ['./archivi-list-container.component.scss']
})
export class ArchiviListContainerComponent implements OnInit {
  public subscriptions: Subscription[] = [];
  public captionConfiguration: CaptionConfiguration;

  constructor(private loginService: JwtLoginService) {
    this.subscriptions.push(this.loginService.loggedUser$.pipe(first()).subscribe(
      (utenteUtilities: UtenteUtilities) => {
        this.captionConfiguration = new CaptionConfiguration(
          CaptionComponent.ARCHIVI_LIST, 
          true, 
          true, 
          true, 
          true, 
          true, 
          false, 
          false, 
          true, 
          false, 
          utenteUtilities.isAG()
        );
      }
    ));
  }

  ngOnInit(): void {
  }

}
