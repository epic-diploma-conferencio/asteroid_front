import type {
  FileTreeDirectoryRow,
  FileTreeFileRow,
  FileTreeRow,
  NormalizedArchiveFile,
  PreparedArchive,
  RulePresentation,
} from '../model/project-loading.types';

const SKIPPED_NAMES = new Set(['.ds_store', 'thumbs.db']);
const SKIPPED_ROOT_SEGMENTS = new Set(['__MACOSX']);
const SKIPPED_PATH_SEGMENTS = new Set(['.git']);

const SELECTABLE_EXTENSIONS = new Map<string, string>([
  ['ts', 'Файл TypeScript'],
  ['tsx', 'Файл TypeScript React'],
  ['js', 'Файл JavaScript'],
  ['jsx', 'Файл JavaScript React'],
  ['mjs', 'Файл ECMAScript Module'],
  ['cjs', 'Файл CommonJS'],
  ['json', 'Файл JavaScript Object Notation'],
  ['jsonc', 'Файл JSON with Comments'],
  ['yml', 'Файл YAML'],
  ['yaml', 'Файл YAML'],
  ['toml', 'Файл TOML'],
  ['xml', 'Файл XML'],
  ['html', 'Файл HTML'],
  ['htm', 'Файл HTML'],
  ['css', 'Файл CSS'],
  ['scss', 'Файл SCSS'],
  ['less', 'Файл Less'],
  ['java', 'Файл Java'],
  ['kt', 'Файл Kotlin'],
  ['kts', 'Файл Kotlin Script'],
  ['groovy', 'Файл Groovy'],
  ['gradle', 'Файл Gradle Script'],
  ['properties', 'Файл Properties'],
  ['py', 'Файл Python'],
  ['go', 'Файл Go'],
  ['rs', 'Файл Rust'],
  ['c', 'Файл C'],
  ['cc', 'Файл C++'],
  ['cpp', 'Файл C++'],
  ['h', 'Файл Header'],
  ['hpp', 'Файл Header C++'],
  ['cs', 'Файл C#'],
  ['swift', 'Файл Swift'],
  ['php', 'Файл PHP'],
  ['rb', 'Файл Ruby'],
  ['scala', 'Файл Scala'],
  ['dart', 'Файл Dart'],
  ['vue', 'Файл Vue'],
  ['svelte', 'Файл Svelte'],
  ['sh', 'Файл Shell Script'],
  ['sql', 'Файл SQL'],
]);

const SELECTABLE_FILENAMES = new Map<string, string>([
  ['dockerfile', 'Файл Dockerfile'],
  ['makefile', 'Файл Makefile'],
  ['justfile', 'Файл Justfile'],
  ['jenkinsfile', 'Файл Jenkinsfile'],
]);

const SPECIAL_FILENAMES = new Map<string, string>([
  ['.prettierrc', 'Файл Prettier Config'],
  ['.prettierignore', 'Файл Prettier Ignore'],
  ['.gitignore', 'Файл Gitignore'],
  ['.gitattributes', 'Файл Git Attributes'],
  ['.eslintignore', 'Файл ESLint Ignore'],
  ['.editorconfig', 'Файл EditorConfig'],
  ['.env', 'Файл Environment Config'],
]);

const DISABLED_EXTENSION_LABELS = new Map<string, string>([
  ['md', 'Файл Markdown'],
  ['txt', 'Файл Plain Text'],
  ['doc', 'Файл Microsoft Word'],
  ['docx', 'Файл Microsoft Word'],
  ['pdf', 'Файл PDF'],
  ['png', 'Файл PNG'],
  ['jpg', 'Файл JPEG'],
  ['jpeg', 'Файл JPEG'],
  ['gif', 'Файл GIF'],
  ['svg', 'Файл SVG'],
  ['mp4', 'Файл Video'],
  ['mov', 'Файл Video'],
  ['mp3', 'Файл Audio'],
  ['wav', 'Файл Audio'],
]);

const MAX_SELECTABLE_FILE_BYTES = 5 * 1024 * 1024;

const compareRows = (left: FileTreeRow, right: FileTreeRow) => {
  if (left.kind !== right.kind) {
    return left.kind === 'directory' ? -1 : 1;
  }

  return left.name.localeCompare(right.name);
};

const createDirectoryRow = (
  path: string,
  name: string,
  parentPath: string | null,
  depth: number,
): FileTreeDirectoryRow => ({
  kind: 'directory',
  path,
  name,
  parentPath,
  depth,
  typeLabel: 'Папка',
  isSelectable: false,
  childrenPaths: [],
  selectableLeafPaths: [],
});

const getExtension = (name: string) => {
  const lastDot = name.lastIndexOf('.');
  if (lastDot === name.length - 1) {
    return null;
  }

  if (lastDot === 0) {
    return name.length > 1 ? name.slice(1).toLowerCase() : null;
  }

  if (lastDot < 0) {
    return null;
  }

  return name.slice(lastDot + 1).toLowerCase();
};

export const describeFile = (name: string, size = 0) => {
  const lowerName = name.toLowerCase();
  const extension = getExtension(lowerName);

  if (size > MAX_SELECTABLE_FILE_BYTES) {
    return {
      extension,
      typeLabel:
        SPECIAL_FILENAMES.get(lowerName) ??
        SELECTABLE_EXTENSIONS.get(extension ?? '') ??
        (extension ? `Файл ${extension.toUpperCase()}` : 'Файл'),
      isSelectable: false,
      disabledReason: 'Файл слишком большой для клиентской обработки',
    };
  }

  const specialByName = SPECIAL_FILENAMES.get(lowerName);
  if (specialByName) {
    return {
      extension,
      typeLabel: specialByName,
      isSelectable: false,
      disabledReason: 'Формат пока не участвует в анализе',
    };
  }

  const selectableByName = SELECTABLE_FILENAMES.get(lowerName);
  if (selectableByName) {
    return {
      extension: null,
      typeLabel: selectableByName,
      isSelectable: true,
      disabledReason: null,
    };
  }

  if (extension && SELECTABLE_EXTENSIONS.has(extension)) {
    return {
      extension,
      typeLabel: SELECTABLE_EXTENSIONS.get(extension) as string,
      isSelectable: true,
      disabledReason: null,
    };
  }

  if (extension && DISABLED_EXTENSION_LABELS.has(extension)) {
    return {
      extension,
      typeLabel: DISABLED_EXTENSION_LABELS.get(extension) as string,
      isSelectable: false,
      disabledReason: 'Файл не участвует в AST-анализе',
    };
  }

  return {
    extension,
    typeLabel: extension ? `Файл ${extension.toUpperCase()}` : 'Файл',
    isSelectable: false,
    disabledReason: 'Формат пока не участвует в анализе',
  };
};

export const normalizeArchivePath = (rawPath: string) => {
  const cleanedPath = rawPath
    .replaceAll('\\', '/')
    .trim()
    .replace(/^\/+/, '')
    .replace(/^[A-Za-z]:/, '');
  if (!cleanedPath) {
    return null;
  }

  const segments = cleanedPath.split('/').filter(Boolean);
  if (segments.length === 0) {
    return null;
  }

  const normalizedSegments: string[] = [];
  for (const segment of segments) {
    if (segment === '.' || segment === '') {
      continue;
    }

    if (segment === '..') {
      return null;
    }

    if (normalizedSegments.length === 0 && SKIPPED_ROOT_SEGMENTS.has(segment)) {
      return null;
    }

    if (SKIPPED_PATH_SEGMENTS.has(segment)) {
      return null;
    }

    normalizedSegments.push(segment);
  }

  if (normalizedSegments.length === 0) {
    return null;
  }

  const fileName = normalizedSegments[normalizedSegments.length - 1];
  if (SKIPPED_NAMES.has(fileName.toLowerCase())) {
    return null;
  }

  return normalizedSegments.join('/');
};

export const buildPreparedArchive = (
  sourceName: string,
  normalizedFiles: NormalizedArchiveFile[],
): PreparedArchive => {
  const rowsByPath: Record<string, FileTreeRow> = {};
  const filesByPath: Record<string, NormalizedArchiveFile> = {};

  for (const file of normalizedFiles) {
    filesByPath[file.path] = file;

    const segments = file.path.split('/');
    for (let index = 0; index < segments.length - 1; index += 1) {
      const directoryPath = segments.slice(0, index + 1).join('/');
      const parentPath = index > 0 ? segments.slice(0, index).join('/') : null;
      if (!rowsByPath[directoryPath]) {
        rowsByPath[directoryPath] = createDirectoryRow(
          directoryPath,
          segments[index],
          parentPath,
          index,
        );
      }
    }

    const fileRow: FileTreeFileRow = {
      kind: 'file',
      path: file.path,
      name: file.name,
      parentPath: file.parentPath,
      depth: segments.length - 1,
      typeLabel: file.typeLabel,
      isSelectable: file.isSelectable,
      size: file.size,
      extension: file.extension,
      disabledReason: file.disabledReason,
      content: file.content,
    };

    if (rowsByPath[file.path]?.kind === 'directory') {
      continue;
    }

    rowsByPath[file.path] = fileRow;
  }

  for (const row of Object.values(rowsByPath)) {
    if (!row.parentPath) {
      continue;
    }

    const parent = rowsByPath[row.parentPath];
    if (parent?.kind === 'directory') {
      parent.childrenPaths.push(row.path);
    }
  }

  for (const file of normalizedFiles) {
    if (!file.isSelectable) {
      continue;
    }

    let currentPath = file.parentPath;
    while (currentPath) {
      const parent = rowsByPath[currentPath];
      if (parent?.kind === 'directory' && !parent.selectableLeafPaths.includes(file.path)) {
        parent.selectableLeafPaths.push(file.path);
        parent.isSelectable = true;
      }

      currentPath = parent?.parentPath ?? null;
    }
  }

  for (const row of Object.values(rowsByPath)) {
    if (row.kind === 'directory') {
      row.childrenPaths.sort((leftPath, rightPath) =>
        compareRows(rowsByPath[leftPath], rowsByPath[rightPath]),
      );
      row.selectableLeafPaths.sort((left, right) => left.localeCompare(right));
    }
  }

  const rootChildrenPaths = Object.values(rowsByPath)
    .filter((row) => row.parentPath === null)
    .sort(compareRows)
    .map((row) => row.path);

  const allDirectoryPaths = Object.values(rowsByPath)
    .filter((row): row is FileTreeDirectoryRow => row.kind === 'directory')
    .map((row) => row.path);

  const selectableFilePaths = normalizedFiles
    .filter((file) => file.isSelectable)
    .map((file) => file.path)
    .sort((left, right) => left.localeCompare(right));

  return {
    sourceName,
    displayName: sourceName.replace(/\.zip$/i, ''),
    rootChildrenPaths,
    rowsByPath,
    allDirectoryPaths,
    selectableFilePaths,
    filesByPath,
  };
};

export const flattenVisibleRows = (archive: PreparedArchive, expandedDirectoryPaths: string[]) => {
  const expanded = new Set(expandedDirectoryPaths);
  const result: FileTreeRow[] = [];

  const visit = (path: string) => {
    const row = archive.rowsByPath[path];
    if (!row) {
      return;
    }

    result.push(row);

    if (row.kind === 'directory' && expanded.has(row.path)) {
      row.childrenPaths.forEach(visit);
    }
  };

  archive.rootChildrenPaths.forEach(visit);

  return result;
};

export const RULE_PRESENTATIONS: Record<string, RulePresentation> = {
  structAnalysis: {
    ruleName: 'structAnalysis',
    groupId: 'group-a',
    groupTitle: 'Группа А',
    previewTitle: 'Проверка структуры проекта',
    previewText:
      'Система сверит расположение файлов, модулей и слоёв с ожидаемой структурой проекта.',
    previewCode: `src/\n  app/\n  pages/\n  widgets/\n  features/\n  entities/\n  shared/`,
  },
  archAnalysis: {
    ruleName: 'archAnalysis',
    groupId: 'group-a',
    groupTitle: 'Группа А',
    previewTitle: 'Архитектурный анализ',
    previewText:
      'Поиск нарушений между слоями, циклических импортов и опасных зависимостей между модулями.',
    previewCode: `entities -> shared\nfeatures -> entities\npages -> widgets\nshared -/-> pages`,
  },
  dependencyAnalysis: {
    ruleName: 'dependencyAnalysis',
    groupId: 'group-a',
    groupTitle: 'Группа А',
    previewTitle: 'Карта зависимостей',
    previewText:
      'Покажет плотные участки проекта, критические связи между пакетами и подозрительные внешние зависимости.',
    previewCode: `app -> widgets -> features\nfeatures -> entities\nshared -> npm packages`,
  },
  buildAnalysis: {
    ruleName: 'buildAnalysis',
    groupId: 'group-a',
    groupTitle: 'Группа А',
    previewTitle: 'Анализ сборки',
    previewText:
      'Проверка конфигов сборки, alias-ов, путей и сценариев, которые могут ломать запуск проекта.',
    previewCode: `vite.config.ts\nwebpack.config.js\ntsconfig.json\npackage.json`,
  },
  lintAnalysis: {
    ruleName: 'lintAnalysis',
    groupId: 'group-b',
    groupTitle: 'Группа Б',
    previewTitle: 'Линт-анализ',
    previewText:
      'Подсветит распространённые проблемы стиля, потенциальные баги и подозрительные конструкции.',
    previewCode: `if (foo = bar) {\n  console.log(foo)\n}\n// <- подозрительное присваивание`,
  },
  unusedVarsAnalysis: {
    ruleName: 'unusedVarsAnalysis',
    groupId: 'group-b',
    groupTitle: 'Группа Б',
    previewTitle: 'Неиспользуемые переменные',
    previewText:
      'Найдёт забытые импорты, мёртвые переменные и параметры, которые больше не участвуют в логике.',
    previewCode: `const response = fetchData();\nconst cached = normalize(data);\nreturn response;`,
  },
  vulnerabilityAnalysis: {
    ruleName: 'vulnerabilityAnalysis',
    groupId: 'group-b',
    groupTitle: 'Группа Б',
    previewTitle: 'Уязвимости в проекте',
    previewText:
      'Проверка известных рискованных зависимостей и конфигураций, которые могут требовать обновления.',
    previewCode: `dependencies:\n  lodash: 4.17.15\n  minimist: 0.0.8`,
  },
  complexityAnalysis: {
    ruleName: 'complexityAnalysis',
    groupId: 'group-b',
    groupTitle: 'Группа Б',
    previewTitle: 'Сложность и поддерживаемость',
    previewText:
      'Оценит самые тяжёлые участки кода: длинные функции, вложенные условия и перегруженные модули.',
    previewCode: `if (...) {\n  if (...) {\n    if (...) {\n      return compute();\n    }\n  }\n}`,
  },
};
