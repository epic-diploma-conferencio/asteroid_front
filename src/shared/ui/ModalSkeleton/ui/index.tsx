import './modal-skeleton.scss';

export const ModalSkeleton = () => (
  <div className="modal-skeleton">
    <div className="modal-skeleton__icon" />
    <div className="modal-skeleton__text-block">
      <div className="modal-skeleton__line modal-skeleton__line--title" />
      <div className="modal-skeleton__line modal-skeleton__line--subtitle" />
    </div>
    <div className="modal-skeleton__fields">
      <div className="modal-skeleton__line modal-skeleton__line--label" />
      <div className="modal-skeleton__line modal-skeleton__line--input" />
      <div className="modal-skeleton__line modal-skeleton__line--label" />
      <div className="modal-skeleton__line modal-skeleton__line--input" />
      <div className="modal-skeleton__line modal-skeleton__line--label" />
      <div className="modal-skeleton__line modal-skeleton__line--input" />
    </div>
    <div className="modal-skeleton__line modal-skeleton__line--button" />
  </div>
);
