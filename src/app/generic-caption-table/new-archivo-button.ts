import { MenuItem } from "primeng/api";

export interface NewArchivoButton {
    tooltip: string;
    livello: number;
    aziendeItems: MenuItem[];
    hasPermessi: boolean;
  }