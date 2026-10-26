import { fireEvent, screen, waitFor } from 'expo-router/testing-library';

import { createInitialState } from '@/storage/schema';
import { FakeRepository } from '../helpers/fake-repository';
import { renderApp } from '../helpers/render-app';

describe('Today flow', () => {
  it('adds water with a quick action and a custom volume', async () => {
    const repository = new FakeRepository(createInitialState());
    await renderApp(repository);

    await screen.findByText('Consumo de hoje');
    await fireEvent.press(screen.getByLabelText('Adicionar 250 mililitros'));

    await waitFor(() => {
      expect(screen.getByLabelText(/Consumo de hoje: 250 de 2000 mililitros/)).toBeTruthy();
    });

    await fireEvent.changeText(screen.getByTestId('intake-volume-input'), '300');
    await fireEvent.press(screen.getByLabelText('Adicionar volume personalizado'));

    await waitFor(() => {
      expect(screen.getByLabelText(/Consumo de hoje: 550 de 2000 mililitros/)).toBeTruthy();
    });
    expect(repository.state.entriesByDay['2026-10-25']).toHaveLength(2);
  });

  it('blocks invalid custom volumes without changing the total', async () => {
    const repository = new FakeRepository(createInitialState());
    await renderApp(repository);

    await screen.findByText('Consumo de hoje');
    await fireEvent.press(screen.getByLabelText('Adicionar 250 mililitros'));
    await waitFor(() => {
      expect(screen.getByLabelText(/Consumo de hoje: 250 de 2000 mililitros/)).toBeTruthy();
    });

    await fireEvent.changeText(screen.getByTestId('intake-volume-input'), '0');
    await fireEvent.press(screen.getByLabelText('Adicionar volume personalizado'));

    expect(await screen.findByText(/Informe um volume inteiro entre 1 e 5.000 ml/)).toBeTruthy();
    expect(screen.getByLabelText(/Consumo de hoje: 250 de 2000 mililitros/)).toBeTruthy();
    expect(repository.saveCalls).toBe(1);
  });
});
