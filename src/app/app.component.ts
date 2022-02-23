import { Component, OnInit } from '@angular/core';
import { HeaderFeaturesConfig } from '@bds/common-components';
import { NtJwtLoginService, UtenteUtilities, UtilityFunctions } from '@bds/nt-jwt-login';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { IntimusClientService, PRIMENG_ITA_TRANSALATION } from '@bds/nt-communicator';
import { getInternautaUrl, BaseUrlType, Azienda } from '@bds/ng-internauta-model';
import { Subscription } from 'rxjs';
import { APPLICATION, LOGIN_ROUTE, SCRIPTA_ROUTE } from 'src/environments/app-constants';
import { AppService } from './app.service';
import { PrimeNGConfig } from 'primeng/api';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  public headerFeaturesConfig: HeaderFeaturesConfig = new HeaderFeaturesConfig();
  private subscriptions: Subscription[] = [];
  public utenteConnesso: UtenteUtilities | undefined;
  public appName = "";

  constructor(
    public loginService: NtJwtLoginService,
    private config: PrimeNGConfig,
    private route: ActivatedRoute,
    private router: Router,
    private intimusClient: IntimusClientService,
    private appService: AppService) {
  }

  ngOnInit(): void {
    this.config.setTranslation(PRIMENG_ITA_TRANSALATION);
    this.headerFeaturesConfig = new HeaderFeaturesConfig();
    this.headerFeaturesConfig.showCambioUtente = true;
    this.headerFeaturesConfig.showLogOut = true;
    this.headerFeaturesConfig.showUserFullName = true;
    this.headerFeaturesConfig.showUserMenu = true;
    this.headerFeaturesConfig.showManuale = true;
    this.headerFeaturesConfig.showProfilo = true;
    this.headerFeaturesConfig.logoutRedirectRoute = "/" + SCRIPTA_ROUTE;
    this.headerFeaturesConfig.logoutIconPath = 'assets/images/signout.svg';
    

    // configurazione login
    this.loginService.setLoginUrl(getInternautaUrl(BaseUrlType.Login));
    this.loginService.setImpostazioniApplicazioniUrl(getInternautaUrl(BaseUrlType.ConfigurazioneImpostazioniApplicazioni));
    this.loginService.setPassTokenGeneratorURL(getInternautaUrl(BaseUrlType.PassTokenGenerator));

    this.subscriptions.push(this.loginService.loggedUser$.subscribe((utente: UtenteUtilities) => {
      if (utente) {
        this.utenteConnesso = utente;
        const intimusUrl = getInternautaUrl(BaseUrlType.Intimus);
        this.intimusClient.start(
          intimusUrl,
          APPLICATION,
          this.utenteConnesso.getUtente().idPersona.id,
          this.utenteConnesso.getUtente().aziendaLogin.id,
          this.utenteConnesso.getUtente().aziende.map(a => a.id));
      }
    }));
    this.subscriptions.push(this.route.queryParams.subscribe(
      (params: Params) => UtilityFunctions.manageChangeUserLogin(
        params, this.loginService, this.router, '/' + LOGIN_ROUTE)));

    this.subscriptions.push(this.appService.appNameEvent.subscribe((appName: string) => {
      this.appName = appName;
    }));
  }
}
