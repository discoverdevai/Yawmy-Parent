import React, { createContext, useContext, useMemo, useState } from 'react';
import { useParentChildren } from '@nms/data';

/**
 * Which child the app is currently showing.
 *
 * Every screen used to take `children?.[0]` independently, which is correct only
 * for a family with one child — and silently wrong for a family with two, where
 * the whole app would show the elder sibling and offer no way to reach the
 * younger one. It also cannot support chat, whose contact list is derived from
 * the selected child's room: the teachers a parent may message depend on which
 * child they are asking about.
 *
 * Holding the selection in one place means switching child changes every screen
 * at once, and — because the chat directory query is keyed by child id — the
 * chat list refetches on its own rather than each screen remembering to.
 *
 * Deliberately not persisted: a parent opening the app is usually thinking about
 * whichever child the last notification concerned, and yesterday's choice is a
 * worse guess than the first child.
 */
const ActiveChildContext = createContext(null);

export function ActiveChildProvider({ children: reactChildren }) {
  const { data: children, isLoading, error } = useParentChildren();
  const [selectedId, setSelectedId] = useState(null);

  const value = useMemo(() => {
    const list = children ?? [];
    // Fall back to the first child until one is picked, and again if the
    // selected child stops being listed (unenrolled, or the guardian link was
    // removed) — a dangling id would otherwise blank every screen.
    const active = list.find((c) => c.id === selectedId) ?? list[0] ?? null;
    return {
      children: list,
      activeChild: active,
      activeChildId: active?.id ?? null,
      setActiveChildId: setSelectedId,
      hasMultiple: list.length > 1,
      isLoading,
      error,
    };
  }, [children, selectedId, isLoading, error]);

  return <ActiveChildContext.Provider value={value}>{reactChildren}</ActiveChildContext.Provider>;
}

export function useActiveChild() {
  const ctx = useContext(ActiveChildContext);
  if (!ctx) throw new Error('useActiveChild must be used inside <ActiveChildProvider>');
  return ctx;
}
