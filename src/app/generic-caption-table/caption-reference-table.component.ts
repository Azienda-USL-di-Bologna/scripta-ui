import { ColonnaBds } from "@bds/common-tools";
import { Table } from "primeng/table";

/**
 * Interfaccia di supporto per i componenti che contengono una tabella
 * che vuole usare come caption il generic-caption-table
 */
export interface CaptionReferenceTableComponent {
  removeSort: () => void;
  applyFilterGlobal: (event: Event, matchMode: string) => void;
  resetPaginationAndLoadData: () => void;
  clear: () => void;
  exportCsvInProgress: boolean;
  exportCSV: (table: Table) => void;
  selectableColumns?: ColonnaBds[];
  selectedColumns?: ColonnaBds[];
  onChangeSelectedColumns?: (event: any) => void;
  dataTable?: Table,
  rowCountInProgress: boolean,
  rowCount: number
}
