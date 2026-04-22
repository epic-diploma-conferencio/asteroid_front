import './modal-skeleton.scss';

export const ModalSkeleton = () => (
  <div className="modal-skeleton">
    <div className="modal-skeleton__fields">
      <div className="modal-skeleton__line modal-skeleton__line--label" />
      <div className="modal-skeleton__line modal-skeleton__line--input" />
      <div className="modal-skeleton__line modal-skeleton__line--label" />
      <div className="modal-skeleton__line modal-skeleton__line--input" />
      <div className="modal-skeleton__line modal-skeleton__line--label" />
      <div className="modal-skeleton__line modal-skeleton__line--input" />
    </div>
    <div className="modal-skeleton__line modal-skeleton__line--checkbox" />
    <div className="modal-skeleton__line modal-skeleton__line--button" />
    <div className="modal-skeleton__footer">
      <div className="modal-skeleton__line modal-skeleton__line--link" />
      <div className="modal-skeleton__line modal-skeleton__line--link" />
    </div>
  </div>
);
