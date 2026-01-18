import { useContext, useEffect, useMemo, useState } from "react";
import {
  FiLoader,
  FiAlertTriangle,
  FiRefreshCcw,
  FiChevronDown,
  FiSearch,
  FiCalendar,
  FiX,
  FiSliders,
} from "react-icons/fi";

import eventsService from "../services/events.service";
import EventCard from "../components/EventCard";
import PageLayout from "../layouts/PageLayout";
import { LangContext } from "../context/lang.context";

function IconText({ icon: Icon, children, className = "" }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <Icon />
      {children}
    </span>
  );
}

function toISOStartOfDay(value) {
  if (!value) return "";
  const d = new Date(`${value}T00:00:00`);
  return Number.isNaN(d.getTime()) ? "" : d.toISOString();
}

function toISOEndOfDay(value) {
  if (!value) return "";
  const d = new Date(`${value}T23:59:59`);
  return Number.isNaN(d.getTime()) ? "" : d.toISOString();
}

export default function EventsListPage() {
  const { t } = useContext(LangContext);

  const LIMIT = 12;

  const [events, setEvents] = useState([]);
  const [meta, setMeta] = useState({
    page: 1,
    pages: 1,
    total: 0,
    limit: LIMIT,
  });
  const [page, setPage] = useState(1);

  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState("");

  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  // Draft filters
  const [q, setQ] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [sort, setSort] = useState("date"); // "date" | "-date"

  // Applied filters
  const [applied, setApplied] = useState({
    q: "",
    from: "",
    to: "",
    sort: "date",
  });

  const canLoadMore = useMemo(() => {
    return meta?.pages ? page < meta.pages : false;
  }, [page, meta]);

  const hasActiveFilters = useMemo(() => {
    return (
      (applied.q && applied.q.trim().length > 0) ||
      !!applied.from ||
      !!applied.to ||
      applied.sort !== "date"
    );
  }, [applied]);

  const buildParams = (nextPage, appliedState) => {
    const params = {
      page: nextPage,
      limit: LIMIT,
      sort: appliedState.sort || "date",
    };

    if (appliedState.q?.trim()) params.q = appliedState.q.trim();

    const fromIso = toISOStartOfDay(appliedState.from);
    const toIso = toISOEndOfDay(appliedState.to);

    if (fromIso) params.from = fromIso;
    if (toIso) params.to = toIso;

    return params;
  };

  const fetchPage = (nextPage, mode = "replace", appliedState = applied) => {
    const isFirst = nextPage === 1;

    if (isFirst) setIsLoading(true);
    else setIsLoadingMore(true);

    setError("");

    const params = buildParams(nextPage, appliedState);

    eventsService
      .getPublicEvents(params)
      .then((res) => {
        const list = res.data?.data || [];
        const newMeta = res.data?.meta || {};

        const metaPage = newMeta.page ?? nextPage;
        const metaPages = newMeta.pages ?? 1;
        const metaTotal = newMeta.total ?? list.length;
        const metaLimit = newMeta.limit ?? LIMIT;

        setMeta({
          page: metaPage,
          pages: metaPages,
          total: metaTotal,
          limit: metaLimit,
        });

        if (mode === "append") setEvents((prev) => [...prev, ...list]);
        else setEvents(list);

        setPage(metaPage);
      })
      .catch((err) => {
        console.log(err);
        setError(t?.errorLoad || "Could not load events.");
      })
      .finally(() => {
        setIsLoading(false);
        setIsLoadingMore(false);
      });
  };

  useEffect(() => {
    fetchPage(1, "replace");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRefresh = () => fetchPage(1, "replace");

  const handleLoadMore = () => {
    if (!canLoadMore || isLoadingMore) return;
    fetchPage(page + 1, "append");
  };

  const handleApply = (e) => {
    e.preventDefault();

    const nextApplied = {
      q: q.trim(),
      from,
      to,
      sort,
    };

    setApplied(nextApplied);
    fetchPage(1, "replace", nextApplied);
  };

  const handleClear = () => {
    setQ("");
    setFrom("");
    setTo("");
    setSort("date");

    const nextApplied = { q: "", from: "", to: "", sort: "date" };
    setApplied(nextApplied);

    if (isFiltersOpen) setIsFiltersOpen(false);
    fetchPage(1, "replace", nextApplied);
  };

  const chipClass =
    "badge badge-outline border-base-300 gap-2 py-3 px-3 rounded-2xl";

  return (
    <PageLayout>
      {/* Header */}
      <header className="mb-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-black">
              {t?.eventsTitle || "Events"}
            </h1>
            <p className="opacity-70 mt-2">{t?.eventsSubtitle || ""}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="btn btn-ghost btn-sm rounded-full gap-2 bg-base-100/70 border border-base-300 shadow-sm backdrop-blur opacity-80 hover:opacity-100 hover:bg-base-100"
              onClick={handleRefresh}
              disabled={isLoading || isLoadingMore}
            >
              <FiRefreshCcw />
              {t?.refresh || "Refresh"}
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <form onSubmit={handleApply} className="mt-5 grid gap-3">
          <div className="flex items-center gap-2 w-full">
            <div className="w-full lg:max-w-[38ch]">
              {/* OPTION A: Join input + button into one block */}
              <div className="join w-full">
                <label className="input input-bordered border-r-0 join-item flex items-center gap-3 w-full h-9 px-4 rounded-l-2xl rounded-r-none">
                  <FiSearch className="opacity-70" />
                  <input
                    type="text"
                    className="grow"
                    placeholder={t?.searchPlaceholder || "Search..."}
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    autoComplete="off"
                  />
                  {q.trim() && (
                    <button
                      type="submit"
                      className="btn join-item h-12 min-h-12 px-8 bg-primary text-primary-content border border-primary shadow-md font-semibold rounded-r-full rounded-l-none hover:brightness-95 active:scale-[0.98] transition"
                      disabled={isLoading || isLoadingMore}
                    >
                      {t?.search || "Search"}
                    </button>
                  )}
                </label>

                {/* ONLY CHANGE: make it look/feel like a real button (no icon) */}
                <button
                  type="submit"
                  className="btn join-item h-9 min-h-9 px-4 bg-primary text-primary-content border border-primary shadow-sm font-medium rounded-r-full rounded-l-none hover:brightness-95 active:scale-[0.98] transition"
                  disabled={isLoading || isLoadingMore}
                >
                  {t?.search || "Search"}
                </button>
              </div>
            </div>

            {/* Keep the rest of the toolbar exactly as it was, aligned to the right */}
            <div className="ml-auto flex flex-wrap items-center gap-2 justify-end">
              <button
                type="button"
                className="btn btn-outline rounded-2xl"
                onClick={() => setIsFiltersOpen((v) => !v)}
              >
                <IconText icon={FiSliders}>{t?.filters || "Filters"}</IconText>
              </button>

              {hasActiveFilters && (
                <button
                  type="button"
                  className="btn btn-ghost border border-base-300 rounded-2xl"
                  onClick={handleClear}
                >
                  <IconText icon={FiX}>{t?.clear || "Clear"}</IconText>
                </button>
              )}
              <div className="flex items-center gap-2">
                <span className="text-sm opacity-70 hidden sm:inline">
                  {t?.sort || "Sort"}
                </span>
                <select
                  className="select select-bordered rounded-full h-9 px-4 pr-8 text-sm font-medium"
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                >
                  <option value="date">{t?.dateAsc || "Soonest"}</option>
                  <option value="-date">{t?.dateDesc || "Latest"}</option>
                </select>
              </div>
            </div>
          </div>

          {/* Applied chips */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2">
              {applied.q?.trim() && (
                <span className={chipClass}>
                  <FiSearch />
                  <span className="max-w-[240px] truncate">
                    {applied.q.trim()}
                  </span>
                </span>
              )}
              {applied.from && (
                <span className={chipClass}>
                  <FiCalendar />
                  {t?.from || "From"}: {applied.from}
                </span>
              )}
              {applied.to && (
                <span className={chipClass}>
                  <FiCalendar />
                  {t?.to || "To"}: {applied.to}
                </span>
              )}
              {applied.sort !== "date" && (
                <span className={chipClass}>
                  <FiChevronDown />
                  {t?.dateDesc || "Latest"}
                </span>
              )}
            </div>
          )}

          {/* Collapsible filters */}
          {isFiltersOpen && (
            <div className="card bg-base-100 border border-base-300 rounded-2xl">
              <div className="card-body p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                  {/* FROM */}

                  <label className="form-control w-full">
                    <div className="flex items-center gap-3">
                      <span className="font-bold flex items-center gap-2">
                        <FiCalendar />
                        {t?.from || "From"}
                      </span>
                    </div>

                    <input
                      type="date"
                      value={from}
                      onChange={(e) => setFrom(e.target.value)}
                      className="
        input input-bordered
        rounded-full
        h-9 min-h-9
        px-4
        bg-base-100
        shadow-sm
        border border-base-300
        focus:outline-none
        focus:border-primary/60
        focus:shadow-md
        w-fit
        min-w-[160px]
        max-w-[180px]
      "
                    />
                  </label>
                  {/* TO */}
                  <label className="form-control w-full">
                    <div className="flex items-center gap-3 md:justify-start">
                      <span className="font-bold flex items-center gap-2">
                        <FiCalendar />
                        {t?.to || "To"}
                      </span>
                    </div>

                    <input
                      type="date"
                      value={to}
                      onChange={(e) => setTo(e.target.value)}
                      min={from || undefined}
                      className="
   input input-bordered
   rounded-full
   h-9 min-h-9
     px-4
    bg-base-100
     shadow-sm
    border border-base-300
    focus:outline-none
    focus:border-primary/60
  focus:shadow-md
   w-fit
  min-w-[160px]
   max-w-[180px]
      "
                    />
                  </label>
                  {/* APPLY */}
                  <div className="flex items-center md:justify-end justify-center">
                    <button
                      type="submit"
                      className="
   btn
   rounded-full
    h-9 min-h-9
    px-6
   text-sm font-semibold
    bg-primary text-primary-content
    border border-primary/70
    shadow-sm
    hover:shadow-md hover:brightness-95
    active:scale-95
    transition
     w-fit
     "
                    >
                      {t?.apply || "Apply"}
                    </button>
                  </div>

                  {/* TIP */}
                  <p className="text-sm opacity-60 leading-snug md:col-span-3">
                    {t?.tip || "Tip: search first, then narrow by dates."}
                  </p>
                </div>
              </div>
            </div>
          )}
        </form>
      </header>

      {/* Body */}
      {isLoading ? (
        <p className="opacity-75">
          <IconText icon={FiLoader}>{t?.loading || "Loading..."}</IconText>
        </p>
      ) : error ? (
        <div className="alert alert-error">
          <IconText icon={FiAlertTriangle}>{error}</IconText>
          <button
            type="button"
            onClick={handleRefresh}
            className="btn btn-sm btn-outline"
          >
            {t?.retry || "Retry"}
          </button>
        </div>
      ) : events.length === 0 ? (
        <div className="card bg-base-100 border rounded-2xl">
          <div className="card-body">
            <p className="opacity-75">{t?.empty || "No events found."}</p>
          </div>
        </div>
      ) : (
        <>
          {/* Meta row */}
          <div className="flex flex-wrap items-center justify-between mb-4 text-sm opacity-70 gap-2">
            <span>
              {t?.showing || "Showing"} {events.length} {t?.of || "of"}{" "}
              {meta.total}
            </span>
            <span>
              {t?.page || "Page"} {meta.page} {t?.of || "of"} {meta.pages}
            </span>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch">
            {events.map((ev) => (
              <EventCard key={ev._id} event={ev} />
            ))}
          </div>

          {/* Load more */}
          <div className="mt-6 flex justify-center pb-20 md:pb-0">
            {canLoadMore ? (
              <button
                type="button"
                className="btn btn-primary btn-wide gap-2 rounded-2xl"
                onClick={handleLoadMore}
                disabled={isLoadingMore}
              >
                {isLoadingMore ? (
                  <span className="loading loading-spinner loading-sm" />
                ) : (
                  <FiChevronDown />
                )}
                {isLoadingMore
                  ? t?.loading || "Loading..."
                  : t?.loadMore || "Load more"}
              </button>
            ) : (
              <p className="text-sm opacity-60">
                {t?.caughtUp || "You are all caught up."}
              </p>
            )}
          </div>
        </>
      )}
    </PageLayout>
  );
}
