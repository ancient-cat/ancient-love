export interface JsonModule {
  _version: string;

  encode(value: any): string;
  decode(value: string): any;
}
