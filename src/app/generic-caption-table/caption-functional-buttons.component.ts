import { NewArchivoButton } from "./functional-buttons/new-archivo-button";
import { UploadDocumentButton } from "./functional-buttons/upload-document-button";

export interface CaptionFunctionalButtonsComponent {
    //newArchivio: (codiceAzienda: number) => void;
    newArchivoButton: NewArchivoButton;
    uploadDocumentButton?: UploadDocumentButton;
}