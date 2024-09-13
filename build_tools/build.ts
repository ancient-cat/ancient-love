#!/usr/bin/env -S npx tsx
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { download_love, type Platform } from "get-love2d";
import { spawnSync } from "child_process";
import { blue, cyan, green, magenta, bold, red, underline, gray, white } from "kleur/colors";
import * as path from "node:path";
import * as os from "node:os";
import game from "../game.json";
import { mkdir, copyFile } from "fs/promises";
import { error_log, info_log, log, success_log } from "./logger";
import { mac_builder } from "./macos-builder";

export type BuildArgs = Omit<typeof game, "$schema">;
export type Builder = (
  build_args: BuildArgs,
  temp_dir: string,
  love_executable_files: string,
  love_game: string,
  dist_filename: string
) => Promise<void>;

const cli = yargs(hideBin(process.argv))
  .string("game_name")
  .default("game_name", game.game_name)
  .string("love_version")
  .default("love_version", game.love_version)
  .string("game_version")
  .default("game_version", game.game_version ?? "")
  .array("platforms")
  .default("platforms", game.platforms as Platform[])
  .string("org_name")
  .default("org_name", game.org_name ?? "");

const argv: BuildArgs = cli.argv as BuildArgs;

const { platforms, game_name, love_version, game_version } = argv;
const current_platform = os.platform();
const love_archive = `${game_name}.love`;
const build_dir = "./build";
const temp_dir = "./temp";
const outdir = "./dist/";
const cwd = process.cwd();

// if (game.game_name === "YOUR_GAME_NAME") {
//   error_log(`Hey — Your ${white(underline("game.json"))} is not configured, yet.`);
//   process.exit(1);
// }

info_log(`Building for ${platforms.map((a) => cyan(a)).join(", ")}`);

// First step: Zip the contents of /build into a zip file, with a ".love" extension

const [was_zipped, error] = zip_game(love_archive, build_dir);

if (!was_zipped) {
  error_log(error?.message ?? "Failed to zip game");
  process.exit(1);
} else {
  success_log(`Zip'd game into`, underline(path.join(cwd, love_archive)));
}

info_log(gray(`Downloading love binaries — into ${white(temp_dir)}`));
console.log = (...args: any[]) => {
  if (args[0] === green("All downloads complete!")) {
    success_log(...args);
  } else {
    info_log(...args);
  }
};
const [err, downloads] = await download_love(temp_dir, love_version, platforms as Platform[]);
console.log = log;

if (err) {
  process.exit(1);
}

let builds: number = 0;
await mkdir("dist", { recursive: true });
for (let download of downloads) {
  const platform = platforms.find((p) => download.includes(p)) as Platform;
  info_log(`${cyan(platform)}:`);

  let result;

  result = spawnSync(`unzip -o ${download} -d ${temp_dir}`, {
    cwd,
    shell: true,
  });

  if (result.error) {
    error_log(result.error ?? "failed to unzip " + download);
  }

  const ext = platform === "macos" ? "zip" : "exe";
  const filename = `${game_name.toLowerCase()}_${platform}${game_version === "" ? "" : "-" + game_version}.${ext}`;
  if (platform === "macos") {
    const final_path = path.join(outdir, filename);
    await mac_builder(argv, temp_dir, "love.app", love_archive, final_path);
    // result = spawnSync(`cat ${download} ${love_archive} > ${final_path}`, {
    //   cwd,
    //   shell: true,
    // });
  } else if (platform === "win32" || platform === "win64") {
    // result = spawnSync(`cat ${path.join(download.replace(".zip", ""), "love.exe")} ${love_archive} > ${final_path}`, {
    //   cwd,
    //   shell: true,
    // });
    error_log(red("TODO"));
  }

  if (result.error) {
    error_log(result.error ?? `Unable to build for ${filename}`);
  } else {
    builds += 1;
    success_log(`Built ${filename}`);
  }
}

if (builds === downloads.length) {
  success_log(green("All builds complete."));
}

function zip_game(filename: string, directory: string): [success: boolean, error: Error | undefined] {
  const result = spawnSync(`zip -9 -r ${path.join(temp_dir, filename)} ${directory}`, {
    cwd: process.cwd(),
    shell: true,
  });

  return [result.error === undefined, result.error];
}
