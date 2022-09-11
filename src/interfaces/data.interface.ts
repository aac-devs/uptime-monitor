export interface FileManager {
  dirPath?: string;
  (fileName: string): Function;
}

export interface ManageFileOptions {
  [index: string]: Function;
}
