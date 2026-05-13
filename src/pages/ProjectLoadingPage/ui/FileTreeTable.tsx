import type { CheckedState } from '@radix-ui/react-checkbox';
import {
  ChevronDown,
  ChevronRight,
  FileCode2,
  FileJson,
  FileText,
  Folder,
  FolderOpen,
} from 'lucide-react';
import { useMemo } from 'react';

import { SelectionCheckbox } from './SelectionCheckbox';
import { flattenVisibleRows } from '../lib/file-tree';
import type { PreparedArchive } from '../model/project-loading.types';

interface Props {
  archive: PreparedArchive;
  selectedPaths: string[];
  expandedDirectoryPaths: string[];
  onSelectedPathsChange: (paths: string[]) => void;
  onExpandedDirectoryPathsChange: (paths: string[]) => void;
}

const getCheckedState = (selectedCount: number, totalCount: number): CheckedState => {
  if (totalCount === 0 || selectedCount === 0) {
    return false;
  }

  if (selectedCount === totalCount) {
    return true;
  }

  return 'indeterminate';
};

const fileIcon = (rowTypeLabel: string, isSelectable: boolean) => {
  if (!isSelectable) {
    return <FileText size={20} strokeWidth={1.9} />;
  }

  if (rowTypeLabel.includes('JSON')) {
    return <FileJson size={20} strokeWidth={1.9} />;
  }

  return <FileCode2 size={20} strokeWidth={1.9} />;
};

export const FileTreeTable = ({
  archive,
  selectedPaths,
  expandedDirectoryPaths,
  onSelectedPathsChange,
  onExpandedDirectoryPathsChange,
}: Props) => {
  const selectedSet = useMemo(() => new Set(selectedPaths), [selectedPaths]);
  const visibleRows = useMemo(
    () => flattenVisibleRows(archive, expandedDirectoryPaths),
    [archive, expandedDirectoryPaths],
  );

  const toggleSelection = (paths: string[], nextChecked: CheckedState) => {
    const nextSelected = new Set(selectedSet);
    const shouldSelect = nextChecked === true;

    paths.forEach((path) => {
      if (shouldSelect) {
        nextSelected.add(path);
      } else {
        nextSelected.delete(path);
      }
    });

    onSelectedPathsChange(
      Array.from(nextSelected).sort((left, right) => left.localeCompare(right)),
    );
  };

  const toggleDirectory = (path: string) => {
    const nextExpanded = new Set(expandedDirectoryPaths);
    if (nextExpanded.has(path)) {
      nextExpanded.delete(path);
    } else {
      nextExpanded.add(path);
    }

    onExpandedDirectoryPathsChange(Array.from(nextExpanded));
  };

  const allCheckedState = getCheckedState(
    archive.selectableFilePaths.filter((path) => selectedSet.has(path)).length,
    archive.selectableFilePaths.length,
  );

  return (
    <div className="project-load__table-shell">
      <table className="project-load__table">
        <thead>
          <tr>
            <th className="project-load__table-check">
              <SelectionCheckbox
                checked={allCheckedState}
                disabled={archive.selectableFilePaths.length === 0}
                onCheckedChange={(checked) => toggleSelection(archive.selectableFilePaths, checked)}
                ariaLabel="Выбрать все поддерживаемые файлы"
              />
            </th>
            <th>Имя</th>
            <th className="project-load__table-type">Тип</th>
          </tr>
        </thead>

        <tbody>
          {visibleRows.map((row) => {
            const isDirectoryExpanded =
              row.kind === 'directory' ? expandedDirectoryPaths.includes(row.path) : false;

            const branchPaths = row.kind === 'directory' ? row.selectableLeafPaths : [row.path];
            const selectedCount = branchPaths.filter((path) => selectedSet.has(path)).length;
            const checkedState = getCheckedState(selectedCount, branchPaths.length);

            return (
              <tr
                key={row.path}
                className={`project-load__row${row.kind === 'file' && !row.isSelectable ? ' project-load__row--disabled' : ''}`}
              >
                <td className="project-load__table-check">
                  <SelectionCheckbox
                    checked={checkedState}
                    disabled={!row.isSelectable}
                    onCheckedChange={(checked) => toggleSelection(branchPaths, checked)}
                    ariaLabel={
                      row.kind === 'directory'
                        ? `Выбрать файлы в папке ${row.name}`
                        : `Выбрать файл ${row.name}`
                    }
                  />
                </td>

                <td>
                  <div
                    className={`project-load__name-cell${row.kind === 'directory' ? ' project-load__name-cell--folder' : ''}`}
                    style={{ paddingLeft: `${row.depth * 20 + 16}px` }}
                  >
                    {row.kind === 'directory' ? (
                      <>
                        <button
                          type="button"
                          className="project-load__tree-toggle"
                          onClick={() => toggleDirectory(row.path)}
                          aria-label={
                            isDirectoryExpanded ? `Свернуть ${row.name}` : `Развернуть ${row.name}`
                          }
                        >
                          {isDirectoryExpanded ? (
                            <ChevronDown size={18} />
                          ) : (
                            <ChevronRight size={18} />
                          )}
                        </button>
                        {isDirectoryExpanded ? (
                          <FolderOpen size={20} strokeWidth={1.9} />
                        ) : (
                          <Folder size={20} strokeWidth={1.9} />
                        )}
                      </>
                    ) : (
                      <>
                        <span className="project-load__tree-spacer" aria-hidden="true" />
                        {fileIcon(row.typeLabel, row.isSelectable)}
                      </>
                    )}

                    <span className="project-load__row-name">{row.name}</span>
                  </div>
                </td>

                <td className="project-load__table-type">
                  <span>{row.typeLabel}</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
