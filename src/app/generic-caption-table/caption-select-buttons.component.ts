import { SelectButtonItem } from "./select-button-item";

/**
 * Interfaccia di supporto per i componenti che 
 * volgiono usare il generic-caption-table per esprimere l'elenco di select-buttons
 */
export interface CaptionSelectButtonsComponent {
  selectButtonItems: SelectButtonItem[];
  selectedButtonItem: SelectButtonItem;
  onSelectButtonItemSelection: (event: any) => void;
}
