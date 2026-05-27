import { useEffect, useState } from 'react';

import { Loader } from '@/shared/ui/Loader';

import type { WelcomeFeature } from './features';

type Props = {
  feature: WelcomeFeature;
};

export const FeatureCard = ({ feature }: Props) => {
  const [isImageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    setImageLoaded(false);
  }, [feature.image]);

  return (
    <article className="welcome-card">
      <div className="welcome-card__image">
        {!isImageLoaded ? <Loader className="welcome-card__image-loader" size="md" /> : null}
        <img
          src={feature.image}
          alt=""
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
          className={
            isImageLoaded ? 'welcome-card__img welcome-card__img--loaded' : 'welcome-card__img'
          }
        />
      </div>
      <div className="welcome-card__body">
        <h3 className="welcome-card__title">{feature.title}</h3>
        <p className="welcome-card__text">{feature.description}</p>
      </div>
    </article>
  );
};
