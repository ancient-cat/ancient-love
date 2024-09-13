import type { BuildArgs, Builder } from "./build";
import * as path from "node:path";
import { error_log, info_log, success_log } from "./logger";
import * as fs from "node:fs/promises";
import plist from "plist";
import kleur from "kleur";
import { spawnSync } from "node:child_process";

/**
 * Builds a windows executable of the game
 */
export const win_builder: Builder = async (
  build_args: BuildArgs,
  temp_dir,
  love_executable_files,
  love_game,
  dist_filename
) => {
  const exe = await create_executable(build_args, temp_dir, love_executable_files, love_game);
  if (exe) {
    info_log(`Created ${exe}`);
  } else {
    error_log("Unable to create executable");
    return;
  }

  const zipResult = spawnSync(`zip -y -j -r ${dist_filename}.zip ${love_executable_files}/`, {
    shell: true,
    cwd: process.cwd(),
  });

  if (zipResult.error) {
    error_log("Unable to create final zip");
    return;
  }

  //   await fs.cp();
};

async function create_executable(
  build_args: BuildArgs,
  temp_dir: string,
  love_executable_files: string,
  love_game: string
): Promise<string | undefined> {
  //   copy /b love.exe+SuperGame.love SuperGame.exe

  const love_dot_exe = path.join(love_executable_files, "love.exe");

  const fused_file = path.join(love_executable_files, `${build_args.game_name}.exe`);

  const command = `copy /b ${love_dot_exe}+${love_game} ${fused_file}`;

  const result = spawnSync(command, {
    cwd: process.cwd(),
    shell: true,
  });

  if (result.error) {
    return undefined;
  } else {
    return fused_file;
  }
}
