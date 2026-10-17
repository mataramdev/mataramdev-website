/**
 * Shared display ordering for admin-managed lists with an `order` column.
 *
 * `order` is a nullable integer that multiple rows may share (or leave empty),
 * so "what the visitor sees" cannot come from a plain SQL sort alone. The
 * canonical order is computed here and reused by the admin list, the public
 * page, and the reorder action — all three must agree, otherwise the admin
 * buttons move the wrong row.
 *
 * The functions are pure so the ordering rules can be tested without a
 * database; the server actions only persist what they return. FAQ
 * (`src/lib/faq.ts`) and Activities both re-export this module.
 */

export interface OrderRow {
  id: string;
  order: number | null;
}

export interface OrderUpdate {
  id: string;
  order: number;
}

/**
 * Ascending by `order`, rows without one last, ties broken by id so the result
 * is stable for identical input. Never mutates the input array.
 */
export function sortByOrder<T extends OrderRow>(rows: T[]): T[] {
  return [...rows].sort((a, b) => {
    const orderA = a.order ?? Number.MAX_SAFE_INTEGER;
    const orderB = b.order ?? Number.MAX_SAFE_INTEGER;

    if (orderA !== orderB) return orderA - orderB;
    return a.id.localeCompare(b.id);
  });
}

/**
 * The writes needed to make the stored numbers match the canonical sequence
 * (0, 1, 2, …). Rows already in place are left out, so a two-row swap costs two
 * updates instead of rewriting the whole table — and the text columns are never
 * touched, so a reorder cannot clobber an edit.
 */
export function orderUpdates(ordered: OrderRow[]): OrderUpdate[] {
  const updates: OrderUpdate[] = [];

  ordered.forEach((row, index) => {
    if (row.order !== index) {
      updates.push({ id: row.id, order: index });
    }
  });

  return updates;
}

/**
 * Moves one entry one step up or down in the canonical order.
 *
 * Returns `null` when `id` is not in the list. A move at the very top or bottom
 * is not an error: the sequence is returned unchanged apart from renumbering,
 * so stale or duplicated `order` values get repaired instead of silently
 * breaking the next move.
 */
export function moveOrderedRow<T extends OrderRow>(
  rows: T[],
  id: string,
  direction: "up" | "down"
): { ordered: T[]; updates: OrderUpdate[] } | null {
  const ordered = sortByOrder(rows);
  const index = ordered.findIndex((row) => row.id === id);

  if (index === -1) {
    return null;
  }

  const targetIndex = direction === "up" ? index - 1 : index + 1;

  if (targetIndex >= 0 && targetIndex < ordered.length) {
    [ordered[index], ordered[targetIndex]] = [
      ordered[targetIndex],
      ordered[index],
    ];
  }

  return { ordered, updates: orderUpdates(ordered) };
}
