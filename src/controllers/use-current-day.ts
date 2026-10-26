import { useCallback, useEffect, useState } from 'react';
import { AppState } from 'react-native';

import { dayKeyFromDate, millisecondsUntilNextLocalMidnight } from '@/utils/date';

export type NowProvider = () => Date;

const defaultNow: NowProvider = () => new Date();

export function useCurrentDay(nowProvider: NowProvider = defaultNow) {
  const [todayKey, setTodayKey] = useState(() => dayKeyFromDate(nowProvider()));

  const refresh = useCallback(() => {
    setTodayKey((current) => {
      const next = dayKeyFromDate(nowProvider());
      return current === next ? current : next;
    });
  }, [nowProvider]);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout> | undefined;

    const scheduleMidnightRefresh = () => {
      const delay = Math.max(millisecondsUntilNextLocalMidnight(nowProvider()), 1000);
      timeout = setTimeout(() => {
        refresh();
        scheduleMidnightRefresh();
      }, delay);
      (timeout as unknown as { unref?: () => void }).unref?.();
    };

    scheduleMidnightRefresh();
    const subscription = AppState.addEventListener('change', (status) => {
      if (status === 'active') {
        refresh();
      }
    });

    return () => {
      if (timeout !== undefined) {
        clearTimeout(timeout);
      }
      subscription.remove();
    };
  }, [nowProvider, refresh]);

  return { todayKey, refresh };
}
