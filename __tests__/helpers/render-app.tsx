import { Slot } from 'expo-router';
import { renderRouter } from 'expo-router/testing-library';

import { HydrationProvider } from '@/controllers/hydration-provider';
import type { WaterRepository } from '@/storage/repository';
import { GoalPage } from '@/pages/goal/goal-page';
import { TodayPage } from '@/pages/today/today-page';
import { WeekPage } from '@/pages/week/week-page';
import type { NowProvider } from '@/controllers/use-current-day';

export function renderApp(
  repository: WaterRepository,
  options: { initialUrl?: string; nowProvider?: NowProvider } = {}
) {
  const { initialUrl = '/', nowProvider } = options;

  function TestLayout() {
    return (
      <HydrationProvider nowProvider={nowProvider} repository={repository}>
        <Slot />
      </HydrationProvider>
    );
  }

  function TodayRoute() {
    return <TodayPage />;
  }

  function WeekRoute() {
    return <WeekPage />;
  }

  function GoalRoute() {
    return <GoalPage />;
  }

  return renderRouter(
    {
      _layout: TestLayout,
      index: TodayRoute,
      week: WeekRoute,
      goal: GoalRoute,
    },
    { initialUrl }
  );
}
