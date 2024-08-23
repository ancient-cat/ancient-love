/** @noSelf **/
export interface LurkerModule {
  _version: string;
  path: string;
  preswap: (file: string) => boolean | void;
  postswap: (file: string) => void;
  interval: number;
  protected: boolean;
  quiet: boolean;
  lastscan: number;
  lasterrorfile: string | null;
  files: Record<string, number>;
  funcwrappers: Record<string, Function>;
  lovefuncs: Record<string, Function>;
  state: "init" | "error" | "normal";

  init(): LurkerModule;
  print(...args: any[]): void;
  listdir(path: string, recursive: boolean, skipdotfiles: boolean): string[];
  initwrappers(): void;
  updatewrappers(): void;
  onerror(error: any, nostacktrace?: boolean): void;
  exitinitstate(): void;
  exiterrorstate(): void;
  update(): void;
  getchanged(): string[];
  modname(file: string): string;
  resetfile(file: string): void;
  hotswapfile(file: string): void;
  scan(): string[];
}
