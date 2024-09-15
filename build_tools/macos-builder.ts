import type { BuildArgs, Builder } from "./build";
import * as path from "node:path";
import { error_log, info_log, success_log } from "./logger";
import * as fs from "node:fs/promises";
import plist from "plist";
import kleur from "kleur";
import { spawnSync } from "node:child_process";
import { zip_folder } from "./zip";

/**
 *
 * @param extracted_dir
 * @param love_game
 * @param dist_filename
 */
export const mac_builder: Builder = async (
  build_args: BuildArgs,
  temp_dir,
  love_executable_files,
  love_game,
  dist_filename
) => {
  const love_dot_app = path.join(temp_dir, love_executable_files);
  const macos_temp = path.join(temp_dir, "macos_temp");
  const game_dot_app = path.join(macos_temp, `${build_args.game_name}.app`);

  // 1. Rename love.app to SuperGame.app
  try {
    info_log("Renaming", love_dot_app, "->", game_dot_app);

    // in case this wasn't cleaned out: we remove it
    await fs.rm(game_dot_app, {
      force: true,
      recursive: true,
    });

    // we do this inside of another temporary folder because zip will zip the _contents_ of a folder.
    // so for our zip to contain game.app — we need to zip `temp/macos_temp/`
    await fs.mkdir(macos_temp, {
      recursive: true,
    });
    await fs.rename(love_dot_app, game_dot_app);
  } catch (ex) {
    error_log(`Could not copy love.app. Verify it was extracted into ${temp_dir}`);
    return;
  }

  // 2. Copy your SuperGame.love to SuperGame.app/Contents/Resources/ (right-click/Ctrl+click and pick "Show Package Content" on macOS). This will result in the game running in fused mode.
  let copy_target = path.join(game_dot_app, "Contents/Resources/", path.basename(love_game));
  try {
    info_log("Copying", love_game, "->", copy_target);
    await fs.copyFile(path.join(temp_dir, love_game), copy_target);
  } catch (ex) {
    error_log(ex);
    error_log(`Unable to copy ${love_game} into ${copy_target}`);
  }

  // 3. Modify SuperGame.app/Contents/Info.plist (see below for details)
  await rewrite_plist(game_dot_app, build_args);

  info_log(`Zipping ${game_dot_app} into ${dist_filename}.zip...`);
  // 4. Zip the SuperGame.app folder (e.g. to SuperGame_osx.zip) and distribute it. Enable the -y flag of zip to keep the symlinks.
  // const dist_target = path.relative(temp_dir, dist_filename);
  // const command = `zip -y -r ${dist_target}.zip ${path.basename(game_dot_app)}`;

  const error = await zip_folder(macos_temp, `${dist_filename}.zip`);

  if (error) {
    error_log(error ?? "Failed to zip");
  }
};

async function rewrite_plist(game_dot_app: string, build_args: BuildArgs) {
  // When modifying SuperGame.app/Contents/Info.plist make sure to change the string values of the following XML-tags:

  const plist_file = path.join(game_dot_app, "/Contents/Info.plist");
  info_log("Modifying", plist_file);
  try {
    const xmlContent = await fs.readFile(plist_file, "utf-8");
    let plist_record: Record<string, any> = plist.parse(xmlContent) as plist.PlistObject;

    if (build_args.org_name !== "") {
      const game_name = build_args.game_name.replace(/ /g, "_");
      const org_name = build_args.org_name.replace(/ /g, "_");
      const val = `org.${org_name}.${game_name}`;
      info_log(kleur.gray(`\tSetting "CFBundleIdentifier": ${kleur.cyan(val)}`));
      plist_record.CFBundleIdentifier = val;
    }

    info_log(kleur.gray(`\tSetting "CFBundleName": ${kleur.cyan(build_args.game_name)}`));
    plist_record.CFBundleName = build_args.game_name;

    if ("UTExportedTypeDeclarations" in plist_record) {
      info_log(kleur.gray(`\tRemoving "${kleur.cyan("UTExportedTypeDeclarations")}"`));
      delete plist_record.UTExportedTypeDeclarations;
    }

    if ("plist" in build_args && typeof build_args.plist === "object") {
      info_log(kleur.gray(`Merging "plist" proprties from game.json`));
      plist_record = {
        ...plist_record,
        ...build_args.plist,
      };
    }

    // for debugging:
    // await fs.writeFile(`${plist_file},json`, JSON.stringify(plist_record, null, 2));

    await fs.writeFile(plist_file, plist.build(plist_record));
  } catch (ex) {
    info_log(ex);
    error_log(`Failed to modify ${plist_file}. You may need to manually update plist values.`);
  }
}
