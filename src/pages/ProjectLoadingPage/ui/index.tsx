import { Archive, Upload } from 'lucide-react';
import { startTransition, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useDropzone, type FileRejection } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import {
  useAvailableRules,
  useStartAnalysis,
  useUploadProjectArchive,
  type AvailableRule,
} from '@/entities/analysis';
import { Loader } from '@/shared/ui/Loader';

import { buildSelectedArchiveFile, unpackProjectInput } from '../lib/archive';
import { RULE_PRESENTATIONS, describeFile } from '../lib/file-tree';
import type { PreparedArchive } from '../model/project-loading.types';
import { FileTreeTable } from './FileTreeTable';
import { RulesGroupTable } from './RulesGroupTable';

import './project-loading-page.scss';

type BusyState = 'extracting' | 'uploading' | 'resetting' | 'starting' | null;

const busyLabels: Record<Exclude<BusyState, null>, string> = {
  extracting: 'Распаковка проекта...',
  uploading: 'Отправка файла...',
  resetting: 'Подготовка новой загрузки...',
  starting: 'Запуск анализа...',
};

const rulesSectionCopy = {
  title: 'Критерии анализа',
  subtitle:
    'Выберите правила, которые считаете нужными включить в анализ. Можно комбинировать критерии из обеих групп.',
};

const groupCopy = {
  'group-a': {
    title: 'Группа А',
    subtitle: 'Архитектура, структура проекта и карта зависимостей.',
  },
  'group-b': {
    title: 'Группа Б',
    subtitle: 'Качество кода, риски, уязвимости и технические сигналы.',
  },
};

const waitForPaint = () =>
  new Promise<void>((resolve) => {
    window.requestAnimationFrame(() => resolve());
  });

const scrollToHeader = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const fileValidator = (file: File) => {
  if (file.size > 528 * 1024 * 1024) {
    return {
      code: 'file-too-large',
      message: 'Сейчас поддерживаются архивы и исходники размером до 500 МБ.',
    };
  }

  if (file.name.toLowerCase().endsWith('.zip')) {
    return null;
  }

  const descriptor = describeFile(file.name, file.size);
  if (descriptor.isSelectable) {
    return null;
  }

  return {
    code: 'file-invalid-type',
    message: 'Сейчас можно загрузить zip-архив или исходный файл проекта.',
  };
};

const groupRules = (rules: AvailableRule[]) => {
  const groups: Record<'group-a' | 'group-b', AvailableRule[]> = {
    'group-a': [],
    'group-b': [],
  };

  rules.forEach((rule, index) => {
    const fallbackGroup = index % 2 === 0 ? 'group-a' : 'group-b';
    const groupId = RULE_PRESENTATIONS[rule.ruleName]?.groupId ?? fallbackGroup;
    groups[groupId].push(rule);
  });

  return groups;
};

export const ProjectLoadingPage = () => {
  const rootRef = useRef<HTMLElement>(null);
  const filesSectionRef = useRef<HTMLElement>(null);
  const rulesSectionRef = useRef<HTMLElement>(null);

  const [busyState, setBusyState] = useState<BusyState>(null);
  const [archive, setArchive] = useState<PreparedArchive | null>(null);
  const [expandedDirectoryPaths, setExpandedDirectoryPaths] = useState<string[]>([]);
  const [selectedFilePaths, setSelectedFilePaths] = useState<string[]>([]);
  const [selectedRuleNames, setSelectedRuleNames] = useState<string[]>([]);
  const [showRulesSection, setShowRulesSection] = useState(false);
  const [uploadedArchiveId, setUploadedArchiveId] = useState<string | null>(null);

  const { mutateAsync: uploadArchive } = useUploadProjectArchive();
  const { mutateAsync: startAnalysis } = useStartAnalysis();
  const { data: rulesResponse, isLoading: rulesLoading } = useAvailableRules(showRulesSection);

  const navigate = useNavigate();

  const rulesByGroup = useMemo(
    () => groupRules(rulesResponse?.rules ?? []),
    [rulesResponse?.rules],
  );

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) {
      return;
    }

    const initialTop = root.getBoundingClientRect().top;

    const updateScreenHeight = () => {
      const screenHeight = Math.max(window.innerHeight - initialTop + 80, 560);
      root.style.setProperty('--project-load-screen-min-height', `${screenHeight - 20}px`);
    };

    updateScreenHeight();
    window.addEventListener('resize', updateScreenHeight);

    return () => {
      window.removeEventListener('resize', updateScreenHeight);
    };
  }, []);

  useEffect(() => {
    if (!showRulesSection) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      rulesSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [showRulesSection]);

  const handleDropAccepted = async (files: File[]) => {
    const [file] = files;
    if (!file) {
      return;
    }

    setBusyState('extracting');
    await waitForPaint();

    try {
      const nextArchive = await unpackProjectInput(file);
      startTransition(() => {
        setArchive(nextArchive);
        setExpandedDirectoryPaths(
          nextArchive.rootChildrenPaths.filter(
            (path) => nextArchive.rowsByPath[path]?.kind === 'directory',
          ),
        );
        setSelectedFilePaths([]);
        setSelectedRuleNames([]);
        setUploadedArchiveId(null);
        setShowRulesSection(false);
      });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Не удалось распаковать выбранный файл.',
      );
    } finally {
      setBusyState(null);
    }
  };

  const handleDropRejected = (rejections: FileRejection[]) => {
    const firstError = rejections[0]?.errors[0]?.message;
    toast.error(firstError ?? 'Не удалось обработать выбранный файл.');
  };

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    maxFiles: 1,
    multiple: false,
    disabled: busyState !== null,
    validator: fileValidator,
    onDropAccepted: handleDropAccepted,
    onDropRejected: handleDropRejected,
  });

  const selectableCount = archive?.selectableFilePaths.length ?? 0;
  const canChooseFiles = selectedFilePaths.length >= 2;
  const canStartAnalysis = selectedRuleNames.length >= 2;

  const handleChooseFiles = async () => {
    if (!archive) {
      return;
    }

    setBusyState('uploading');
    await waitForPaint();

    try {
      const uploadFile = await buildSelectedArchiveFile(archive, selectedFilePaths);
      const response = await uploadArchive(uploadFile);
      setUploadedArchiveId(response.archiveId);

      if (showRulesSection) {
        rulesSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        setShowRulesSection(true);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Не удалось отправить выбранные файлы.');
    } finally {
      setBusyState(null);
    }
  };

  const handleBackToFiles = () => {
    scrollToHeader();
  };

  const handleReset = async () => {
    setBusyState('resetting');
    await waitForPaint();

    window.setTimeout(() => {
      startTransition(() => {
        setArchive(null);
        setExpandedDirectoryPaths([]);
        setSelectedFilePaths([]);
        setSelectedRuleNames([]);
        setUploadedArchiveId(null);
        setShowRulesSection(false);
      });
      scrollToHeader();
      setBusyState(null);
    }, 360);
  };

  const handleStartAnalysis = async () => {
    if (!canStartAnalysis) {
      toast.error('Для старта анализа выберите минимум два правила.');
      return;
    }

    setBusyState('starting');
    await waitForPaint();

    try {
      await startAnalysis({
        rules: selectedRuleNames.map((ruleName) => ({
          ruleName,
          value: true,
        })),
        uploadId: uploadedArchiveId,
      });

      toast.success('Исследование начато!', {
        description:
          'Пожалуйста, дождитесь окончания исследования. Прогресс можно отследить на странице Сохраненных исследований.',
      });
      setTimeout(async () => await navigate('/saved'), 1000);
    } catch {
      toast.error('Не удалось запустить анализ. Попробуйте ещё раз.');
    } finally {
      setBusyState(null);
    }
  };

  return (
    <section ref={rootRef} className="project-load">
      <section ref={filesSectionRef} className="project-load__screen">
        <div className="project-load__inner">
          <header className="project-load__header">
            <div className="project-load__copy">
              <h1 className="project-load__title t-h-40">Загрузка проекта</h1>
              <p className="project-load__subtitle t-common-big">
                {archive
                  ? 'Отметьте галочкой те файлы, которые хотите включить в анализ. Неподдерживаемые типы приглушены и недоступны для выбора.'
                  : 'Вы можете загрузить отдельный файл или проект в zip-архиве — система сама распакует его и подготовит структуру для выбора.'}
              </p>
            </div>

            {archive ? (
              <p className="project-load__archive-name">
                <Archive size={28} strokeWidth={2.2} />
                <span>- {archive.sourceName}</span>
              </p>
            ) : null}
          </header>

          {!archive ? (
            <div
              {...getRootProps()}
              className={`project-load__dropzone${isDragActive ? ' project-load__dropzone--active' : ''}${isDragReject ? ' project-load__dropzone--reject' : ''}`}
            >
              <input {...getInputProps()} />
              <div className="project-load__dropzone-icon" aria-hidden="true">
                <Upload size={76} strokeWidth={1.8} />
              </div>
              <p className="project-load__dropzone-text t-common-big">
                {isDragActive
                  ? 'Отпустите архив, чтобы начать распаковку'
                  : 'Нажмите, чтобы загрузить файл или перетащите его сюда'}
              </p>
            </div>
          ) : (
            <>
              <div className="project-load__selection-meta">
                <span>
                  Выбрано <strong>{selectedFilePaths.length}</strong> из{' '}
                  <strong>{selectableCount}</strong> поддерживаемых файлов
                </span>
              </div>

              <FileTreeTable
                archive={archive}
                selectedPaths={selectedFilePaths}
                expandedDirectoryPaths={expandedDirectoryPaths}
                onSelectedPathsChange={setSelectedFilePaths}
                onExpandedDirectoryPathsChange={setExpandedDirectoryPaths}
              />

              <div className="project-load__footer">
                <div className="project-load__hint">
                  {canChooseFiles
                    ? 'Выбранные файлы будут отправлены на сервер.'
                    : 'Для продолжения выберите минимум два поддерживаемых файла.'}
                </div>

                <div className="project-load__actions">
                  <button type="button" className="project-load__link" onClick={handleReset}>
                    Загрузить другой файл
                  </button>

                  <button
                    type="button"
                    className="project-load__primary"
                    disabled={!canChooseFiles || busyState !== null}
                    onClick={handleChooseFiles}
                  >
                    Выбрать файлы
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      {showRulesSection ? (
        <section ref={rulesSectionRef} className="project-load__screen project-load__screen--rules">
          <div className="project-load__inner">
            <header className="project-load__header project-load__header--rules">
              <div className="project-load__copy">
                <h1 className="project-load__title t-h-40">{rulesSectionCopy.title}</h1>
                <p className="project-load__subtitle t-common-big">{rulesSectionCopy.subtitle}</p>
              </div>
            </header>

            {rulesLoading ? (
              <div className="project-load__rules-loader">
                <Loader size="lg" />
              </div>
            ) : (
              <>
                <div className="project-load__rules-grid">
                  <RulesGroupTable
                    title={groupCopy['group-a'].title}
                    subtitle={groupCopy['group-a'].subtitle}
                    rules={rulesByGroup['group-a']}
                    selectedRuleNames={selectedRuleNames}
                    onSelectedRuleNamesChange={setSelectedRuleNames}
                  />

                  <RulesGroupTable
                    title={groupCopy['group-b'].title}
                    subtitle={groupCopy['group-b'].subtitle}
                    rules={rulesByGroup['group-b']}
                    selectedRuleNames={selectedRuleNames}
                    onSelectedRuleNamesChange={setSelectedRuleNames}
                  />
                </div>

                <div className="project-load__footer project-load__footer--rules">
                  <div className="project-load__hint">
                    {canStartAnalysis
                      ? 'Выбраны критерии, с которыми можно запускать исследование.'
                      : 'Для старта анализа отметьте минимум два правила.'}
                  </div>

                  <div className="project-load__actions">
                    <button
                      type="button"
                      className="project-load__link"
                      onClick={handleBackToFiles}
                    >
                      Вернуться к выбору файлов
                    </button>
                    <button
                      type="button"
                      className="project-load__primary"
                      disabled={!canStartAnalysis || busyState !== null}
                      onClick={handleStartAnalysis}
                    >
                      Приступить к анализу
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </section>
      ) : null}

      {busyState ? (
        <div className="project-load__busy">
          <Loader size="lg" />
          <p className="project-load__busy-text t-common-big">{busyLabels[busyState]}</p>
        </div>
      ) : null}
    </section>
  );
};
