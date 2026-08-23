import { ButtonLink } from "./button";

/**
 * The backend is inconsistent about list envelopes — some endpoints return
 * `{ items, total }`, others a bare array with no total (confirmed against
 * a real running instance; see docs/BUILD-PROGRESS.md). Pass `total` +
 * `limit` when you have a real count; pass `hasMore` (a full page came
 * back) when you don't.
 */
export function Paginator({
  page,
  total,
  limit,
  hasMore,
  hrefFor,
}: {
  page: number;
  total?: number;
  limit?: number;
  hasMore?: boolean;
  hrefFor: (page: number) => string;
}) {
  const totalPages = total !== undefined && limit ? Math.max(1, Math.ceil(total / limit)) : null;
  const more = totalPages !== null ? page < totalPages : Boolean(hasMore);

  if (page <= 1 && !more) return null;

  return (
    <div className="border-border flex items-center justify-between border-t px-5 py-3">
      <ButtonLink
        href={hrefFor(page - 1)}
        variant="secondary"
        size="sm"
        className={page <= 1 ? "pointer-events-none opacity-50" : undefined}
      >
        Previous
      </ButtonLink>
      <span className="text-fg-subtle text-xs">
        {totalPages !== null ? `Page ${page} of ${totalPages}` : `Page ${page}`}
      </span>
      <ButtonLink
        href={hrefFor(page + 1)}
        variant="secondary"
        size="sm"
        className={!more ? "pointer-events-none opacity-50" : undefined}
      >
        Next
      </ButtonLink>
    </div>
  );
}
