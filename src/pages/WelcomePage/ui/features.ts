export type WelcomeFeature = {
  title: string;
  description: string;
  image: string;
};

export const welcomeFeatures: WelcomeFeature[] = [
  {
    title: 'Загрузите проект/файл',
    description: 'Подойдет любой файл популярного языка программирования или проект в zip-архиве',
    image: 'https://picsum.photos/seed/asteroid-upload/720/420',
  },
  {
    title: 'Выберите нужные файлы',
    description: 'С помощью галочек отметьте те файлы, которые хотели бы включить в анализ проекта',
    image: 'https://picsum.photos/seed/asteroid-files/720/420',
  },
  {
    title: 'Выберите правила анализа',
    description: 'Вы сами решаете, по каким критериям/правилам будет проводиться анализ проекта',
    image: 'https://picsum.photos/seed/asteroid-rules/720/420',
  },
  {
    title: 'Получите полный отчет',
    description:
      'Система предоставит вам полную графическую сводку по указанным правилам и фильтрам',
    image: 'https://picsum.photos/seed/asteroid-report/720/420',
  },
  {
    title: 'Сохраните ваше исследование',
    description: 'Экспортируйте его в любой удобный формат, или сохраните в личном кабинете',
    image: 'https://picsum.photos/seed/asteroid-save/720/420',
  },
];
