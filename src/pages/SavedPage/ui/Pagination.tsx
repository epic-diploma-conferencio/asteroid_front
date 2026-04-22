import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}

export const Pagination = ({ page, totalPages, onChange }: Props) => {
  if (totalPages <= 1) {
    return null;
  }

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const canPrev = page > 1;
  const canNext = page < totalPages;

  return (
    <nav className="saved-pagination" aria-label="Страницы исследований">
      <button
        type="button"
        className="saved-pagination__arrow"
        onClick={() => canPrev && onChange(page - 1)}
        disabled={!canPrev}
        aria-label="Предыдущая страница"
      >
        <ChevronLeft size={20} strokeWidth={2} />
      </button>

      {pages.map((p) => (
        <button
          key={p}
          type="button"
          className={`saved-pagination__page${
            p === page ? ' saved-pagination__page--active' : ''
          }`}
          aria-current={p === page ? 'page' : undefined}
          onClick={() => onChange(p)}
        >
          {p}
        </button>
      ))}

      <button
        type="button"
        className="saved-pagination__arrow"
        onClick={() => canNext && onChange(page + 1)}
        disabled={!canNext}
        aria-label="Следующая страница"
      >
        <ChevronRight size={20} strokeWidth={2} />
      </button>
    </nav>
  );
};
