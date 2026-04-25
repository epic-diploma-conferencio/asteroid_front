export const formatCreatedAt = (iso: string): string => {
  const date = new Date(iso);

  if (Number.isNaN(date.getTime())) {
    return iso;
  }

  const diffMs = Date.now() - date.getTime();
  const days = Math.floor(diffMs / 86400000);

  if (days <= 0) {
    return 'сегодня';
  }

  if (days === 1) {
    return 'вчера';
  }

  if (days < 7) {
    return `${days} дн. назад`;
  }

  const weeks = Math.floor(days / 7);

  if (weeks === 1) {
    return 'неделю назад';
  }

  if (weeks < 4) {
    return `${weeks} нед. назад`;
  }

  const months = Math.floor(days / 30);

  if (months === 1) {
    return 'месяц назад';
  }

  if (months < 12) {
    return `${months} мес. назад`;
  }

  return `${Math.floor(days / 365)} г. назад`;
};
