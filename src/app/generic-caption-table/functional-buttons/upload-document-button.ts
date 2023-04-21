export interface UploadDocumentButton {
  command: (event: any, nomi: string[]) => void;
  enable: boolean;
}