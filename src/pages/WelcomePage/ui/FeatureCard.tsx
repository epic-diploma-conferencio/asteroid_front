import type { WelcomeFeature } from './features';

type Props = {
  feature: WelcomeFeature;
};

export const FeatureCard = ({ feature }: Props) => (
  <article className="welcome-card">
    <div className="welcome-card__image">
      <img src={feature.image} alt="" loading="lazy" />
    </div>
    <div className="welcome-card__body">
      <h3 className="welcome-card__title">{feature.title}</h3>
      <p className="welcome-card__text">{feature.description}</p>
    </div>
  </article>
);
