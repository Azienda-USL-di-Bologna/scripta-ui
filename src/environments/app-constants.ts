import { EntitiesConfiguration } from '@nfa/next-sdr';

// ========================= Url =====================================
// export const ODATA_BASE_URL: string = environment.odataStoreRootUrl;
/* const hostname: string = window.location.hostname;
const originalPort: string = window.location.port; */


// const port: string = hostname === "localhost" ? ":" + LOCALHOST_PORT : ":" + originalPort; // qui c'era : ":443"

/* export const RELATIVE_BASE_URL: string = "/internauta-api/resources/baborg";
export const BASE_URL: string = window.location.protocol + "//" + hostname + port + RELATIVE_BASE_URL; */


// login
/* export const LOGOUT_RELATIVE_URL: string = "/Shibboleth.sso/Logout";
export const LOGOUT_URL = window.location.protocol + "//" + hostname + port + LOGOUT_RELATIVE_URL;
export const LOGIN_RELATIVE_URL: string = "/internauta-api/login";
export const LOGIN_URL: string = window.location.protocol + "//" + hostname + port + LOGIN_RELATIVE_URL; */
export const LOCALHOST_PORT = '10005';
export const LOGIN_ROUTE = 'login';
export const HOME_ROUTE = 'home';
export const IDOCX_ROUTE = 'i-docx';
// export const BABORG_ROUTE = 'baborg';
export const LOGGED_OUT_ROUTE = 'logged-out';
export const BABELMAN_URL = 'https://babelman-auslbo.avec.emr.it/';
export const APPLICATION = 'scripta';

export enum BaseUrlType {
  Baborg,
  Permessi,
  Messaggero,
  Login,
  Logout,
  Ribaltone,
  RibaltoneUtils,
  Configurazione,
  ConfigurazioneImpostazioniApplicazioni
}

export const BaseUrls: Map<BaseUrlType, string> = new Map<BaseUrlType, string>([
  [BaseUrlType.Baborg, '/internauta-api/resources/baborg'],
  [BaseUrlType.Messaggero, '/internauta-api/resources/messaggero'],
  [BaseUrlType.Permessi, '/internauta-api/resources/permessi'],
  [BaseUrlType.Login, '/internauta-api/login'],
  [BaseUrlType.Logout, '/Shibboleth.sso/Logout'],
  [BaseUrlType.Ribaltone, '/internauta-api/resources/baborg/ribaltone/lanciaRibaltone'],
  [BaseUrlType.RibaltoneUtils, '/internauta-api/resources/ribaltoneutils'],
  [BaseUrlType.Configurazione, '/internauta-api/resources/configurazione'],
  [BaseUrlType.ConfigurazioneImpostazioniApplicazioni, '/internauta-api/resources/configurazione/custom/setImpostazioniApplicazioni'],
]);

export function getInternautaUrl(type: BaseUrlType, relative = false): string | undefined{
    if (!BaseUrls.has(type)) {
        throw new Error('Failed to obtain internauta url, type does not exists!');
    }

    if (!!relative) {
        return BaseUrls.get(type);
    }

    const wl = window.location;
    const out: string = wl.protocol + '//'
    + wl.hostname + (wl.hostname === 'localhost' ? ':'
    + LOCALHOST_PORT : ':' + wl.port) + BaseUrls.get(type);

    return out;
}

// Ribaltone
/* export const LANCIA_RIBALTONE: string = "/ribaltone/lanciaRibaltone"; */

// valore che passiamo come limit quando non vogliamo Limitare i risultati (visto che il server se non glielo passi limita a 20)
// il server limita comunque a 2000 anche se gli metto un numero più alto
export const NO_LIMIT = 2000;

export const CUSTOM_SERVER_METHODS = {
    struttureAntenate: 'struttureAntenate',
    insertImpOrgRowAndCsvUpload: 'insertImpOrgRowAndCsvUpload',
    downloadCSVFileFromIdAzienda: 'downloadCSVFileFromIdAzienda',
    downloadFileFromUUIDAndidAzienda: 'downloadFileFromUUIDAndidAzienda',
    getPermissionsAdvanced: 'getPermissionsAdvanced',
    getDelegatiMatrint: 'getDelegatiMatrint'
};


// DEPRECATO - usa ENTITIES_STRUCTURE nel definition.ts di bds-lib
export const PROJECTIONS = {
    azienda: {
        standardProjections: {
            AziendaWithPlainFields: 'AziendaWithPlainFields',
        },
        customProjections: {
        }
    },
    struttura: {
        standardProjections: {
        },
        customProjections: {
            StrutturaPlainWithPermessiCustom: 'StrutturaPlainWithPermessiCustom',
            StrutturaWithIdAziendaAndPermessiCustom: 'StrutturaWithIdAziendaAndPermessiCustom'
        }
    },
    utente: {
        standardProjections: {
            UtenteWithPlainFields: 'UtenteWithPlainFields',
            UtenteWithIdPersona: 'UtenteWithIdPersona',
            UtenteWithIdAziendaAndIdPersona: 'UtenteWithIdAziendaAndIdPersona'
        },
        customProjections: {
            customUtenteProjection1: 'customUtenteProjection1',
            customUtenteProjection2: 'customUtenteProjection2',
        }
    },
    utentestruttura: {
        standardProjections: {
        },
        customProjections: {
            UtenteStrutturaWithIdAfferenzaStrutturaCustom: 'UtenteStrutturaWithIdAfferenzaStrutturaCustom',
        }
    },
    strutturaunificata: {
        standardProjections: {
            StrutturaUnificataWithIdStrutturaDestinazioneAndIdStrutturaSorgente: 'StrutturaUnificataWithIdStrutturaDestinazioneAndIdStrutturaSorgente'
        },
        customProjections: {
            StrutturaUnificataCustom: 'StrutturaUnificataCustom'
        }
    },
    pec: {
        standardProjections: {
            PecWithPlainFields: 'PecWithPlainFields',
            PecWithIdPecProvider: 'PecWithIdPecProvider'
        },
        customProjections: {
            PecPlainWithPermessiCustom: 'PecPlainWithPermessiCustom',
            PecPlainWithPermessiAndGestoriCustom: 'PecPlainWithPermessiAndGestoriCustom',
            PecWithPecProviderAndAziendaCustom: 'PecWithPecProviderAndAziendaCustom'
        }
    },
    persona: {
        standardProjections: {
          PersonaWithPlainFields: 'PersonaWithPlainFields',
          PersonaWithAttivitaList: 'PersonaWithAttivitaList'
      },
      customProjections: {
          PersonaPlainWithPermessiCustom: 'PersonaPlainWithPermessiCustom'
       }
    },
    pecazienda: {
        standardProjections: {
            PecAziendaWithIdAziendaAndIdPec: 'PecAziendaWithIdAziendaAndIdPec',
        },
        customProjections: {
         }
    }
};

export const ADDIDTIONAL_DATA = {
    azienda: {},
    utente: {},
    struttura: {},
    utentestruttura: {
        filterCombo: 'filterCombo'
    },
    strutturaunificata: {}
};

export const TIPO_OPERAZIONE = {
    fusione: 'FUSIONE',
    replica: 'REPLICA'
};

export const TIPI_OPERAZIONE: string[] =
[
TIPO_OPERAZIONE.fusione,
TIPO_OPERAZIONE.replica
];

export const STATI_STR_UNIFICATE = {
    Bozza: 'Bozza',
    Corrente: 'Corrente',
    Storico: 'Storico'
};

export const PERMESSI_PEC = [
  'Elimina',
  'Risponde',
  'Legge'
];

// valori che il server interpreta come null e notNull quando esegue i binding
export const dataNull = '9999-01-01T00:00:00';
export const dataNotNull = '9998-01-01T00:00:00';

// modo brutto per far si che quando filtro per codice azienda non mi venga restituito niente
// utile quando ho controllato il ruolo e non posso vedere nessun'azienda
export const COD_AZIENDA_INESISTENTE = '999';

export interface HeaderFeaturesParams {
    showUserFullName: boolean;
    showUserMenu: boolean;
    showCambioUtente: boolean;
    showImpostazioni: boolean;
    showLogOut: boolean;
}
export const AFFERENZA_STRUTTURA = {
    DIRETTA: 1,
    FUNZIONALE: 3,
    UNIFICATA: 9,
    TEST: 7
};
