export type LogLevel = "none" | "verbose" | "info" | "warning" | "error";
export type LogService = {
  set_log_level: (this: void, level: LogLevel) => void;
  log: (this: void, ...args: any[]) => void;
  info: (this: void, ...args: any[]) => void;
  warn: (this: void, ...args: any[]) => void;
  error: (this: void, ...args: any[]) => void;
};

// ANSI escape codes for colored text and text formatting in TypeScript
const colors = {
  // Reset
  reset: "\x1b[0m",

  // Text colors
  black: "\x1b[30m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",

  // Bright text colors
  brightBlack: "\x1b[90m",
  brightRed: "\x1b[91m",
  brightGreen: "\x1b[92m",
  brightYellow: "\x1b[93m",
  brightBlue: "\x1b[94m",
  brightMagenta: "\x1b[95m",
  brightCyan: "\x1b[96m",
  brightWhite: "\x1b[97m",

  // Background colors
  bgBlack: "\x1b[40m",
  bgRed: "\x1b[41m",
  bgGreen: "\x1b[42m",
  bgYellow: "\x1b[43m",
  bgBlue: "\x1b[44m",
  bgMagenta: "\x1b[45m",
  bgCyan: "\x1b[46m",
  bgWhite: "\x1b[47m",

  // Bright background colors
  bgBrightBlack: "\x1b[100m",
  bgBrightRed: "\x1b[101m",
  bgBrightGreen: "\x1b[102m",
  bgBrightYellow: "\x1b[103m",
  bgBrightBlue: "\x1b[104m",
  bgBrightMagenta: "\x1b[105m",
  bgBrightCyan: "\x1b[106m",
  bgBrightWhite: "\x1b[107m",

  // Text formatting
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  underline: "\x1b[4m",
  blink: "\x1b[5m",
  inverse: "\x1b[7m",
  hidden: "\x1b[8m",
} as const;

const colored = (color: keyof typeof colors, text: string) => `${colors[color]}${text}${colors.reset}`;
const string_color = (text: string) => colored("green", `"${text}"`);
const number_color = (text: string) => colored("brightBlue", `${text}`);
const boolean_color = (text: string) => colored("bold", colored("blue", `${text}`));
const muted_color = (text: string) => colored("white", colored("dim", `${text}`));
const null_color = (text: string) => colored("bold", colored("magenta", `${text}`));

export const JSON = {
  stringify: (obj: any, indent: number = 0): string => {
    const padding = "  ".repeat(indent);
    let result = "";

    if (Array.isArray(obj)) {
      result += muted_color("[ ");
      for (let i = 0; i < obj.length; i++) {
        result += output(obj[i]);
        result += ", ";
      }
      result += padding + muted_color("]");
    } else if (typeof obj === "object" && obj !== null) {
      result += muted_color("{\n");
      const keys = Object.keys(obj);
      keys.forEach((key, index) => {
        result += padding + "  " + key + ": " + JSON.stringify(obj[`${key}`], indent + 1);
        result += ",\n";
      });
      result += padding + muted_color("}");
    } else {
      result += output(obj);
    }

    return result;
  },
};

const output = (thing: unknown) => {
  if (typeof thing === null || typeof thing === "undefined") {
    return null_color("nil");
  } else if (typeof thing == "string") {
    return string_color(thing);
  } else if (typeof thing === "number") {
    return number_color(`${thing}`);
  } else if (typeof thing === "object") {
    return "\n" + JSON.stringify(thing);
  } else if (typeof thing === "boolean") {
    return boolean_color(`${thing}`);
  } else if (typeof thing === "function") {
    const meta = debug.getinfo(thing);

    const fnName = meta.name;
    if (fnName !== undefined) {
      return muted_color(`[function ${fnName}]`);
    } else {
      return muted_color(`[() => ]`);
    }
  } else return muted_color(`\n[${typeof thing}]`);
};

export const create_log_service: (init_level?: LogLevel) => LogService = (init_level) => {
  let log_level: LogLevel = init_level ?? "info";

  const set_log_level = (level: LogLevel) => {
    log_level = level;
  };

  const log = (...args: any[]) => {
    if (log_level === "verbose" || log_level === "info") {
      const msg = args.map((thing) => output(thing)).join(" ");
      print(msg);
    }
  };

  const info = (...args: any[]) => {
    if (log_level === "verbose" || log_level === "info") {
      const msg = args.map((thing) => output(thing)).join(" ");
      print(msg);
    }
  };
  const warn = (...args: any[]) => {
    if (log_level === "verbose" || log_level === "warning") {
      const msg = args.map((thing) => output(thing)).join(" ");
      print(`${colored("yellow", "warn:")} ${msg}`);
    }
  };

  const error = (...args: any[]) => {
    if (log_level === "verbose" || log_level === "warning") {
      const msg = args.map((thing) => output(thing)).join(" ");
      print(`${colored("red", "error:")} ${msg}`);
    }
  };

  return {
    set_log_level,
    log,
    info,
    warn,
    error,
  };
};
