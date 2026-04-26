export interface NormalizedArchiveFile {
  path: string;
  name: string;
  parentPath: string | null;
  size: number;
  extension: string | null;
  typeLabel: string;
  isSelectable: boolean;
  disabledReason: string | null;
  content: Uint8Array;
}

interface TreeRowBase {
  path: string;
  name: string;
  parentPath: string | null;
  depth: number;
  typeLabel: string;
  isSelectable: boolean;
}

export interface FileTreeDirectoryRow extends TreeRowBase {
  kind: 'directory';
  childrenPaths: string[];
  selectableLeafPaths: string[];
}

export interface FileTreeFileRow extends TreeRowBase {
  kind: 'file';
  size: number;
  extension: string | null;
  disabledReason: string | null;
  content: Uint8Array;
}

export type FileTreeRow = FileTreeDirectoryRow | FileTreeFileRow;

export interface PreparedArchive {
  sourceName: string;
  displayName: string;
  rootChildrenPaths: string[];
  rowsByPath: Record<string, FileTreeRow>;
  allDirectoryPaths: string[];
  selectableFilePaths: string[];
  filesByPath: Record<string, NormalizedArchiveFile>;
}

export interface RulePresentation {
  ruleName: string;
  groupId: 'group-a' | 'group-b';
  groupTitle: string;
  previewTitle: string;
  previewText: string;
  previewCode: string;
}
