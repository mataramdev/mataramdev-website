/**
 * FAQ display ordering.
 *
 * The ordering rules live in `src/lib/ordering.ts` because Activities needs the
 * exact same logic (Task 9.7). These names are kept so existing FAQ code and
 * the notes in docs/PROGRESS.md still read naturally.
 */
import {
  moveOrderedRow,
  orderUpdates,
  sortByOrder,
  type OrderRow,
  type OrderUpdate,
} from "./ordering";

export type FaqOrderRow = OrderRow;
export type FaqOrderUpdate = OrderUpdate;
export const sortFaqRows = sortByOrder;
export const faqOrderUpdates = orderUpdates;
export const moveFaqRow = moveOrderedRow;
