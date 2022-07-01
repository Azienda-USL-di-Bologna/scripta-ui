import { Injectable } from "@angular/core";
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from "@angular/router";
import { NtJwtLoginService, UtenteUtilities } from "@bds/nt-jwt-login";


@Injectable({
  providedIn: "root",
})
// TODO: potrebbe essere una buona idea che questa diventi una guardia che gestisce i ruoli per tutte le pagine
// adesso gestisce solo anagrafe-pec
export class RoleGuard implements CanActivate {
    private loggedUtenteUtilites: UtenteUtilities;
  constructor( private loginService: NtJwtLoginService, private router: Router) {
      this.loginService.loggedUser$.subscribe(loggedUser => {
        this.loggedUtenteUtilites = loggedUser;
      });
  }
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): boolean {
    const roles = next.data["roles"] as Array<string>;
    let can: boolean = false;
    for (let i = 0; i < roles.length; i++) {
      if (this.loggedUtenteUtilites.hasRole(roles[i])) {
        can = true;
        break;
      }
    }

    if (can === true) {
        return true;
    } else {
        this.router.navigate(["/homepage"]);
        return false;
    }
  }
}
