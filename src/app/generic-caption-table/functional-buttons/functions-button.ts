import { MenuItem } from "primeng/api";

export interface FunctionButton {
  tooltip: string;
  functionItems: MenuItem[];
  enable: boolean;
}