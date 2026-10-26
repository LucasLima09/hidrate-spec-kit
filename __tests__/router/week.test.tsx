import { AppState } from 'react-native';
import { act, fireEvent, screen, testRouter, waitFor, within } from 'expo-router/testing-library';

import { makeEntry, makeState } from '../helpers/fixtures';
import { FakeClock } from '../helpers/fake-clock';
import { FakeRepository } from '../helpers/fake-repository';
import { renderApp } from '../helpers/render-app';

function weekState() {
  return makeState({
    entriesByDay: {
      '2026-10-23': [makeEntry({ id: 'friday', dayKey: '2026-10-23', volumeMl: 2000 })],
      '2026-10-25': [makeEntry({ id: 'today', dayKey: '2026-10-25', volumeMl: 500 })],
    },
  });
}

describe('Week flow', () => {
  it('shows seven days in chronological order with goal status', async () => {
    await renderApp(new FakeRepository(weekState()), { initialUrl: '/week' });
    await screen.findByText('Últimos 7 dias');

    const rows = screen.getAllByTestId(/^week-row-/);
    expect(rows).toHaveLength(7);
    expect(rows[0].props.testID).toBe('week-row-2026-10-19');
    expect(rows[6].props.testID).toBe('week-row-2026-10-25');
    expect(within(rows[6]).getByText('Hoje')).toBeTruthy();
    expect(within(rows[4]).getByText('Meta atingida')).toBeTruthy();
    expect(within(rows[6]).getByText('Meta não atingida')).toBeTruthy();
  });

  it('updates the today row after adding water', async () => {
    const repository = new FakeRepository(weekState());
    await renderApp(repository, { initialUrl: '/week' });
    await screen.findByText('Últimos 7 dias');

    await testRouter.navigate('/');
    await screen.findByText('Consumo de hoje');
    await fireEvent.press(screen.getByLabelText('Adicionar 250 mililitros'));
    await waitFor(() => {
      expect(screen.getByLabelText(/Consumo de hoje: 750 de 2000 mililitros/)).toBeTruthy();
    });

    await testRouter.navigate('/week');
    await waitFor(() => {
      expect(within(screen.getByTestId('week-row-2026-10-25')).getByText('750 ml')).toBeTruthy();
    });
  });

  it('rolls the seven day window over at midnight using a fake clock', async () => {
    const clock = new FakeClock(new Date(2026, 9, 25, 23, 59, 0, 0));
    const listeners: ((status: string) => void)[] = [];
    const appStateSpy = jest.spyOn(AppState, 'addEventListener').mockImplementation(((
      _type: string,
      handler: (status: string) => void
    ) => {
      listeners.push(handler);
      return { remove: jest.fn() };
    }) as unknown as typeof AppState.addEventListener);

    try {
      await renderApp(new FakeRepository(weekState()), {
        initialUrl: '/week',
        nowProvider: clock.now,
      });
      await screen.findByText('Últimos 7 dias');
      expect(screen.getByTestId('week-row-2026-10-25')).toBeTruthy();

      clock.set(new Date(2026, 9, 26, 0, 1, 0, 0));
      await act(async () => {
        listeners.forEach((listener) => listener('active'));
      });

      await waitFor(() => {
        expect(screen.getByTestId('week-row-2026-10-26')).toBeTruthy();
      });
      expect(screen.queryByTestId('week-row-2026-10-19')).toBeNull();
      expect(screen.queryByTestId('week-row-2026-10-20')).toBeTruthy();
    } finally {
      appStateSpy.mockRestore();
    }
  });
});
