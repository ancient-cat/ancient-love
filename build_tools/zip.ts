import zl from "zip-lib";

export const zip_folder = async (
  directory: string,
  archive: string,
  flattened: boolean = false
): Promise<Error | undefined> => {
  try {
    await zl.archiveFolder(directory, archive, {
      followSymlinks: true,
    });
  } catch (ex: unknown) {
    return ex as Error;
  }
};

export const unzip = async (archive: string, target: string): Promise<Error | undefined> => {
  try {
    await zl.extract(archive, target);
  } catch (ex: unknown) {
    return ex as Error;
  }
};
