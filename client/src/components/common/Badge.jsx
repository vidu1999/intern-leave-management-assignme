import { classNames } from '../../utils/format.js';

/** Small rounded label, e.g. a department chip. */
export default function Badge({ children, className, dotClassName }) {
  return (
    <span
      className={classNames(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset',
        className,
      )}
    >
      {dotClassName && <span className={classNames('h-1.5 w-1.5 rounded-full', dotClassName)} aria-hidden="true" />}
      {children}
    </span>
  );
}
