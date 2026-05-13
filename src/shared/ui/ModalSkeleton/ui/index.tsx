import { Loader } from '@/shared/ui/Loader';

import './modal-skeleton.scss';

export const ModalSkeleton = () => (
  <div className="modal-skeleton">
    <Loader size="lg" />
  </div>
);
