import type { CheckedState } from '@radix-ui/react-checkbox';
import * as Tooltip from '@radix-ui/react-tooltip';

import type { AvailableRule } from '@/entities/analysis';

import { SelectionCheckbox } from './SelectionCheckbox';
import { RULE_PRESENTATIONS } from '../lib/file-tree';

interface Props {
  title: string;
  subtitle: string;
  rules: AvailableRule[];
  selectedRuleNames: string[];
  onSelectedRuleNamesChange: (rules: string[]) => void;
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

export const RulesGroupTable = ({
  title,
  subtitle,
  rules,
  selectedRuleNames,
  onSelectedRuleNamesChange,
}: Props) => {
  const selected = new Set(selectedRuleNames);
  const groupRuleNames = rules.map((rule) => rule.ruleName);
  const groupSelectedCount = groupRuleNames.filter((ruleName) => selected.has(ruleName)).length;

  const updateRules = (ruleNames: string[], checked: CheckedState) => {
    const nextSelected = new Set(selected);
    const shouldSelect = checked === true;

    ruleNames.forEach((ruleName) => {
      if (shouldSelect) {
        nextSelected.add(ruleName);
      } else {
        nextSelected.delete(ruleName);
      }
    });

    onSelectedRuleNamesChange(
      Array.from(nextSelected).sort((left, right) => left.localeCompare(right)),
    );
  };

  return (
    <section className="project-load__rule-group">
      <header className="project-load__rule-group-head">
        <h2 className="project-load__rule-group-title">{title}</h2>
        <p className="project-load__rule-group-subtitle">{subtitle}</p>
      </header>

      <div className="project-load__rule-table">
        <div className="project-load__rule-row project-load__rule-row--head">
          <div className="project-load__rule-check">
            <SelectionCheckbox
              checked={getCheckedState(groupSelectedCount, groupRuleNames.length)}
              disabled={groupRuleNames.length === 0}
              onCheckedChange={(checked) => updateRules(groupRuleNames, checked)}
              ariaLabel={`Выбрать все правила группы ${title}`}
            />
          </div>
          <div className="project-load__rule-main">Правило</div>
        </div>

        <Tooltip.Provider delayDuration={160}>
          {rules.map((rule, index) => {
            const preview = RULE_PRESENTATIONS[rule.ruleName];
            return (
              <div key={rule.ruleName} className="project-load__rule-row">
                <div className="project-load__rule-check">
                  <SelectionCheckbox
                    checked={selected.has(rule.ruleName)}
                    onCheckedChange={(checked) => updateRules([rule.ruleName], checked)}
                    ariaLabel={`Выбрать правило ${rule.ruleRussian}`}
                  />
                </div>

                <Tooltip.Root>
                  <Tooltip.Trigger asChild>
                    <button type="button" className="project-load__rule-trigger">
                      <span className="project-load__rule-index">{index + 1}.</span>
                      <span className="project-load__rule-copy">
                        <span className="project-load__rule-name">{rule.ruleRussian}</span>
                        <span className="project-load__rule-description">
                          {rule.ruleDescription}
                        </span>
                      </span>
                    </button>
                  </Tooltip.Trigger>

                  <Tooltip.Portal>
                    <Tooltip.Content
                      className="project-load__rule-preview"
                      side="top"
                      align="start"
                      sideOffset={14}
                    >
                      <div className="project-load__rule-preview-code">
                        <pre>{preview?.previewCode ?? rule.ruleName}</pre>
                      </div>
                      <div className="project-load__rule-preview-body">
                        <p className="project-load__rule-preview-title">
                          {preview?.previewTitle ?? rule.ruleRussian}
                        </p>
                        <p className="project-load__rule-preview-text">
                          {preview?.previewText ?? rule.ruleDescription}
                        </p>
                      </div>
                    </Tooltip.Content>
                  </Tooltip.Portal>
                </Tooltip.Root>
              </div>
            );
          })}
        </Tooltip.Provider>
      </div>
    </section>
  );
};
