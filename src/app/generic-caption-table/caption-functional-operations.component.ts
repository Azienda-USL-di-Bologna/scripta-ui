import { FunctionButton } from "./functional-buttons/functions-button";
import { NewArchivoButton } from "./functional-buttons/new-archivo-button";
import { UploadDocumentButton } from "./functional-buttons/upload-document-button";

export interface CaptionFunctionalOperationsComponent {
    //newArchivio: (codiceAzienda: number) => void;
    rightContentProgressSpinner: boolean;
    newArchivoButton: NewArchivoButton;
    functionButton?: FunctionButton;
    uploadDocumentButton?: UploadDocumentButton;
    uploadDocument?: (event: any, nomi: string[]) => {};
}