#!/usr/bin/env -S npx tsx
import yargs from "yargs";
import { hashElement } from "folder-hash";
import { hideBin } from "yargs/helpers";
import { download_love, type Platform } from "get-love2d";

import { cyan, green, bold, underline, gray, white } from "kleur/colors";
import * as path from "node:path";
import game from "../game.json";
import { mkdir } from "fs/promises";
import { error_log, info_log, intro, log, success_log } from "./logger";
import { mac_builder } from "./macos-builder";
import { win_builder } from "./win-builder";
import { unzip, zip_folder } from "./zip";

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

const build_hash = (await hashElement("./build", { encoding: "hex" })).hash.toString().substring(0, 6);

if (argv.game_version === "") {
  argv.game_version = build_hash;
}

intro();

const { platforms, game_name, love_version, game_version, org_name } = argv;
info_log(
  `Building with the following config\n`,
  JSON.stringify({ platforms, game_name, love_version, game_version, org_name }, null, 2)
);

const love_archive = `${game_name}.love`;
const build_dir = "./build";
const temp_dir = "./temp";
const outdir = "./dist/";
const cwd = process.cwd();

// if (game.game_name === "YOUR_GAME_NAME") {
//   error_log(`Hey — Your ${white(underline("game.json:3:31"))} is not configured, yet.\n\n`);
//   execSync("code -r -g game.json:3:31"); // open in vscode
//   process.exit(1);
// }

info_log(`Building for ${platforms.map((a) => cyan(a)).join(", ")}`);
info_log(gray(`Build Id: ${build_hash}`));

// First step: Zip the contents of /build into a zip file, with a ".love" extension

const error = await zip_game(love_archive, build_dir);

if (error) {
  error_log(error.message ?? "Failed to zip game");
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
  info_log();
  info_log(`${bold(cyan(platform))}:`);
  info_log();

  let result: Error | undefined;

  const extracted_dir = download.replace(".zip", "");
  info_log(gray(`Extracting ${download} into ${extracted_dir}...`));
  result = await unzip(download, temp_dir);

  const filename = `${game_name.toLowerCase()}_${platform}${game_version === "" ? "" : "-" + game_version}`;
  const final_path = path.join(outdir, filename);

  if (result) {
    error_log(error ?? "failed to unzip " + download);
    error_log(result.message ?? `Unable to build for ${filename}`);
    continue;
  }

  if (platform === "macos") {
    await mac_builder(argv, temp_dir, "love.app", love_archive, final_path);
  } else if (platform === "win32" || platform === "win64") {
    const unzipped_love = download.replace(path.extname(download), "");
    await win_builder(argv, temp_dir, unzipped_love, love_archive, final_path);
  }

  builds += 1;
  success_log(`Built ${filename}`);
}

if (builds === downloads.length) {
  success_log(green("All builds complete."));
}

async function zip_game(filename: string, directory: string): Promise<Error | undefined> {
  return await zip_folder(directory, path.join(temp_dir, filename));
}
