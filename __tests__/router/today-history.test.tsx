import { fireEvent, screen, waitFor, within } from 'expo-router/testing-library';

import { makeEntry, makeState } from '../helpers/fixtures';
import { FakeRepository } from '../helpers/fake-repository';
import { renderApp } from '../helpers/render-app';

function historyState() {
  return makeState({
    entriesByDay: {
      '2026-10-25': [
        makeEntry({
          id: 'morning',
          volumeMl: 500,
          localTime: '10:00',
          createdAt: '2026-10-25T10:00:00.000Z',
        }),
        makeEntry({
          id: 'later',
          volumeMl: 1000,
          localTime: '11:00',
          createdAt: '2026-10-25T11:00:00.000Z',
        }),
      ],
    },
  });
}

describe('Today history flow', () => {
  it('shows entries newest first and formats 1,5 L', async () => {
    await renderApp(new FakeRepository(historyState()));
    await screen.findByText('Histórico do dia');

    const entries = screen.getAllByLabelText(/^Registro das/);
    expect(entries[0].props.accessibilityLabel).toContain('11:00');
    expect(entries[1].props.accessibilityLabel).toContain('10:00');
    expect(screen.getByText('1,5 L')).toBeTruthy();
  });

  it('edits a volume, cancels an edit and removes with confirmation', async () => {
    const repository = new FakeRepository(historyState());
    await renderApp(repository);
    await screen.findByText('Histórico do dia');

    await fireEvent.press(screen.getByLabelText('Editar registro das 10:00'));
    await screen.findByTestId('edit-volume-input');
    await fireEvent.changeText(screen.getByTestId('edit-volume-input'), '300');
    await fireEvent.press(screen.getByLabelText('Salvar novo volume'));

    await waitFor(() => {
      expect(screen.getByText('1,3 L')).toBeTruthy();
    });
    const morning = repository.state.entriesByDay['2026-10-25'].find(
      (entry) => entry.id === 'morning'
    );
    expect(morning?.volumeMl).toBe(300);
    expect(morning?.localTime).toBe('10:00');

    await fireEvent.press(screen.getByLabelText('Editar registro das 11:00'));
    await fireEvent.changeText(screen.getByTestId('edit-volume-input'), '999');
    await fireEvent.press(screen.getByLabelText('Cancelar edição'));

    expect(screen.getByText('1,3 L')).toBeTruthy();

    await fireEvent.press(screen.getByLabelText('Remover registro das 11:00'));
    await fireEvent.press(screen.getByLabelText('Remover'));

    await waitFor(() => {
      expect(screen.getByLabelText(/Consumo de hoje: 300 de 2000 mililitros/)).toBeTruthy();
    });
    expect(screen.queryByLabelText('Registro das 11:00: 1000 mililitros')).toBeNull();
  });
});
