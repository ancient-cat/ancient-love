import { blue, cyan, green, magenta, bold, red, underline, gray, white } from "kleur/colors";

const prefix = `${magenta("「Ancient Love 」")}`;

export const log = console.log;
export const info_log = (...args: any[]) => {
  log(prefix, bold(blue("i ")), ...args);
};

export const success_log = (...args: any[]) => {
  log(prefix, green("✔ "), ...args);
};

export const error_log = (...args: any[]) => {
  log(prefix, bold(red("×")), red(...args));
};
