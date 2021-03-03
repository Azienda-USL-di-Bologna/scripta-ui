import { NTJWTModuleConfig, LogoutType } from "@bds/nt-jwt-login";
import { LOGIN_ROUTE, HOME_ROUTE, LOGGED_OUT_ROUTE, LOCALHOST_PORT, APPLICATION } from "../../environments/app-constants";

export const loginModuleConfig: NTJWTModuleConfig = {
    loginURL: ""/* relativeURL: LOGIN_RELATIVE_URL */,
    passTokenGeneratorURL: "",
    refreshSessionInternautaUrl: "",
    loginComponentRoute: "/" +  LOGIN_ROUTE,
    homeComponentRoute: "/" +  HOME_ROUTE,
    localhostPort: LOCALHOST_PORT,
    applicazione: APPLICATION,
    logoutRedirectRoute: "/" +  LOGIN_ROUTE,
    // loggedOutComponentRoute: "/" + LOGGED_OUT_ROUTE,
    // sessionExpireSeconds: 1800, // 0 = distattivato
    pingInterval: 10, //  0 disattivato, 900 parametro deciso per prod
    // logout type SSO sync oppure local
    logoutType: LogoutType.SSO_SYNC,
    mainApp: false
};
