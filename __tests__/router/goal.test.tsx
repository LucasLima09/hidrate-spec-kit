import { fireEvent, screen, testRouter, waitFor } from 'expo-router/testing-library';

import { createInitialState } from '@/storage/schema';
import { FakeRepository } from '../helpers/fake-repository';
import { renderApp } from '../helpers/render-app';

describe('Goal flow', () => {
  it('saves a goal and recalculates the current day', async () => {
    const repository = new FakeRepository(createInitialState());
    await renderApp(repository, { initialUrl: '/goal' });

    await screen.findByText('Meta diária');
    await fireEvent.changeText(screen.getByTestId('goal-input'), '2500');
    await fireEvent.press(screen.getByLabelText('Salvar meta'));

    expect(await screen.findByText('Meta atualizada com sucesso.')).toBeTruthy();
    expect(repository.state.settings.defaultGoalMl).toBe(2500);

    await testRouter.navigate('/');
    await waitFor(() => {
      expect(screen.getByLabelText(/Consumo de hoje: 0 de 2500 mililitros/)).toBeTruthy();
    });
  });

  it('shows inline validation and does not persist an invalid goal', async () => {
    const repository = new FakeRepository(createInitialState());
    await renderApp(repository, { initialUrl: '/goal' });

    await screen.findByText('Meta diária');
    await fireEvent.changeText(screen.getByTestId('goal-input'), '499');
    await fireEvent.press(screen.getByLabelText('Salvar meta'));

    expect(await screen.findByText(/Informe uma meta inteira entre 500 e 10.000 ml/)).toBeTruthy();
    expect(repository.state.settings.defaultGoalMl).toBe(2000);
    expect(repository.saveCalls).toBe(0);
  });

  it('keeps the saved goal after remounting the provider', async () => {
    const repository = new FakeRepository(createInitialState());
    const first = await renderApp(repository, { initialUrl: '/goal' });

    await screen.findByText('Meta diária');
    await fireEvent.changeText(screen.getByTestId('goal-input'), '2500');
    await fireEvent.press(screen.getByLabelText('Salvar meta'));
    await screen.findByText('Meta atualizada com sucesso.');

    first.unmount();
    await renderApp(repository);
    await waitFor(() => {
      expect(screen.getByLabelText(/Consumo de hoje: 0 de 2500 mililitros/)).toBeTruthy();
    });
  });
});
