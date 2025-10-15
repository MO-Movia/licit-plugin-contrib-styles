import { Style } from "../StyleRuntime";

export interface CustomStylesService {
  openCustomStyleDialog(styleObj: any): Promise<any>;
  getStylesAsync(): Promise<Style[]> 
  canEditStyle?: boolean
  saveStyle(style: Style): Promise<Style>;
  renameStyle: (oldStyleName: string, newStyleName: string) => Promise<Style[]>;
  removeStyle: (name: string) => Promise<Style[]>;
  saveStyleSet(styles: Style[]): Promise<Style[]>;
  openJSONEditorDialog(): Promise<any>;
}
export interface CustomStylesRuntime {
  customStylesService: CustomStylesService;
}
