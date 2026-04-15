import clsx from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';
import './error-message.scss';

export const ErrorMessage = ({ message, className }: { message?: string; className?: string }) => (
  <AnimatePresence>
    {message && (
      <motion.span
        className={clsx('error', className)}
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        transition={{ duration: 0.2 }}
      >
        {message}
      </motion.span>
    )}
  </AnimatePresence>
);
