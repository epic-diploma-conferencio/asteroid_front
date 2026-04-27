import { unzip, zip } from 'fflate';

import { buildPreparedArchive, describeFile, normalizeArchivePath } from './file-tree';
import type { NormalizedArchiveFile, PreparedArchive } from '../model/project-loading.types';

const MAX_ARCHIVE_BYTES = 528 * 1024 * 1024;
const MAX_FILE_COUNT = 5000;
const MAX_TOTAL_UNPACKED_BYTES = 1024 * 1024 * 1024;

const ZIP_EXTENSION = '.zip';
const LANGUAGE_BY_EXTENSION = new Map<string, string>([
  ['ts', 'TypeScript'],
  ['tsx', 'TypeScript'],
  ['js', 'JavaScript'],
  ['jsx', 'JavaScript'],
  ['mjs', 'JavaScript'],
  ['cjs', 'JavaScript'],
  ['java', 'Java'],
  ['kt', 'Kotlin'],
  ['kts', 'Kotlin'],
  ['py', 'Python'],
  ['go', 'Go'],
  ['rs', 'Rust'],
  ['cs', 'C#'],
  ['php', 'PHP'],
  ['rb', 'Ruby'],
  ['swift', 'Swift'],
  ['scala', 'Scala'],
  ['dart', 'Dart'],
  ['vue', 'Vue'],
  ['svelte', 'Svelte'],
  ['cpp', 'C++'],
  ['cc', 'C++'],
  ['c', 'C'],
]);

const promisifiedUnzip = (data: Uint8Array) =>
  new Promise<Record<string, Uint8Array>>((resolve, reject) => {
    unzip(data, (error, unzipped) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(unzipped);
    });
  });

const promisifiedZip = (entries: Record<string, Uint8Array>) =>
  new Promise<Uint8Array>((resolve, reject) => {
    zip(entries, { level: 6 }, (error, zipped) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(zipped);
    });
  });

const isZipFile = (file: File) => file.name.toLowerCase().endsWith(ZIP_EXTENSION);

const isSupportedStandaloneFile = (file: File) => describeFile(file.name).isSelectable;

const ensureArchiveBounds = (file: File) => {
  if (file.size > MAX_ARCHIVE_BYTES) {
    throw new Error('Архив слишком большой. Сейчас поддерживаются файлы до 528 МБ.');
  }
};

const normalizeEntries = (entries: Record<string, Uint8Array>) => {
  const normalizedFiles: NormalizedArchiveFile[] = [];
  let totalBytes = 0;

  for (const [rawPath, content] of Object.entries(entries)) {
    if (/[\\/]$/.test(rawPath)) {
      continue;
    }

    const path = normalizeArchivePath(rawPath);
    if (!path) {
      continue;
    }

    totalBytes += content.byteLength;
    if (totalBytes > MAX_TOTAL_UNPACKED_BYTES) {
      throw new Error(
        'Архив слишком тяжёлый после распаковки. Попробуйте загрузить меньший проект.',
      );
    }

    const segments = path.split('/');
    const name = segments[segments.length - 1];
    const descriptor = describeFile(name, content.byteLength);

    normalizedFiles.push({
      path,
      name,
      parentPath: segments.length > 1 ? segments.slice(0, -1).join('/') : null,
      size: content.byteLength,
      extension: descriptor.extension,
      typeLabel: descriptor.typeLabel,
      isSelectable: descriptor.isSelectable,
      disabledReason: descriptor.disabledReason,
      content,
    });
  }

  if (normalizedFiles.length === 0) {
    throw new Error('В архиве не нашлось файлов, которые можно обработать.');
  }

  if (normalizedFiles.length > MAX_FILE_COUNT) {
    throw new Error('В архиве слишком много файлов. Попробуйте загрузить меньшую часть проекта.');
  }

  return normalizedFiles.sort((left, right) => left.path.localeCompare(right.path));
};

export const unpackProjectInput = async (file: File): Promise<PreparedArchive> => {
  ensureArchiveBounds(file);

  if (isZipFile(file)) {
    const bytes = new Uint8Array(await file.arrayBuffer());
    const unzippedEntries = await promisifiedUnzip(bytes);
    const files = normalizeEntries(unzippedEntries);
    return buildPreparedArchive(file.name, files);
  }

  if (!isSupportedStandaloneFile(file)) {
    throw new Error(
      'Сейчас можно загрузить zip-архив или исходный файл проекта, который относится к анализируемому коду.',
    );
  }

  const descriptor = describeFile(file.name, file.size);
  const content = new Uint8Array(await file.arrayBuffer());

  return buildPreparedArchive(file.name, [
    {
      path: file.name,
      name: file.name,
      parentPath: null,
      size: file.size,
      extension: descriptor.extension,
      typeLabel: descriptor.typeLabel,
      isSelectable: descriptor.isSelectable,
      disabledReason: descriptor.disabledReason,
      content,
    },
  ]);
};

export const validateSelectedArchiveFiles = (
  archive: PreparedArchive,
  selectedPaths: string[],
): NormalizedArchiveFile[] => {
  const uniquePaths = Array.from(new Set(selectedPaths));

  if (uniquePaths.length < 1) {
    throw new Error('Для продолжения выберите минимум один поддерживаемый файл.');
  }

  const selectedFiles = uniquePaths
    .map((path) => archive.filesByPath[path])
    .filter((file): file is NormalizedArchiveFile => Boolean(file));

  if (selectedFiles.length !== uniquePaths.length) {
    throw new Error('Часть выбранных файлов потерялась. Попробуйте выбрать их заново.');
  }

  const invalidFile = selectedFiles.find((file) => !file.isSelectable);
  if (invalidFile) {
    throw new Error(`Файл ${invalidFile.name} нельзя отправить в анализ.`);
  }

  return selectedFiles;
};

export const detectArchiveLanguage = (archive: PreparedArchive, selectedPaths: string[]) => {
  const selectedFiles = validateSelectedArchiveFiles(archive, selectedPaths);
  const scores = new Map<string, number>();

  selectedFiles.forEach((file) => {
    const language = file.extension ? LANGUAGE_BY_EXTENSION.get(file.extension) : null;
    if (!language) {
      return;
    }

    scores.set(language, (scores.get(language) ?? 0) + 1);
  });

  const dominant = Array.from(scores.entries()).sort((left, right) => right[1] - left[1])[0]?.[0];
  return dominant ?? 'Mixed';
};

export const buildSelectedArchiveFile = async (
  archive: PreparedArchive,
  selectedPaths: string[],
): Promise<File> => {
  const selectedFiles = validateSelectedArchiveFiles(archive, selectedPaths);
  const entries = Object.fromEntries(selectedFiles.map((file) => [file.path, file.content]));
  const zipped = await promisifiedZip(entries);
  const fileName = archive.sourceName.toLowerCase().endsWith(ZIP_EXTENSION)
    ? archive.sourceName
    : `${archive.displayName}.zip`;

  return new File([zipped], fileName, {
    type: 'application/zip',
  });
};
