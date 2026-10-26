import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { Pressable, Text, View } from 'react-native';

import { HydrationProvider } from '@/controllers/hydration-provider';
import { useHydration } from '@/controllers/use-hydration';
import { appError } from '@/domain/errors';
import { createInitialState } from '@/storage/schema';
import { FakeRepository } from '../helpers/fake-repository';
import { FIXED_NOW, makeEntry, makeState } from '../helpers/fixtures';

function Probe() {
  const hydration = useHydration();
  return (
    <View>
      <Text testID="status">{hydration.status}</Text>
      <Text testID="total">{hydration.today?.totalMl ?? -1}</Text>
      <Text testID="goal">{hydration.today?.goalMl ?? -1}</Text>
      <Text testID="warning">{hydration.warning?.code ?? 'none'}</Text>
      <Text testID="saving">{String(hydration.isSaving)}</Text>
      <Pressable
        testID="add"
        onPress={() => {
          void hydration.addIntake(250);
        }}>
        <Text>Adicionar</Text>
      </Pressable>
      <Pressable
        testID="retry"
        onPress={() => {
          void hydration.retry();
        }}>
        <Text>Tentar novamente</Text>
      </Pressable>
    </View>
  );
}

async function renderProvider(repository: FakeRepository) {
  return render(
    <HydrationProvider nowProvider={() => FIXED_NOW} repository={repository}>
      <Probe />
    </HydrationProvider>
  );
}

async function expectStatus(status: string) {
  await waitFor(() => {
    expect(screen.getByTestId('status').props.children).toBe(status);
  });
}

describe('HydrationProvider', () => {
  it('loads an existing state', async () => {
    const repository = new FakeRepository(
      makeState({ entriesByDay: { '2026-10-25': [makeEntry({ volumeMl: 500 })] } })
    );
    await renderProvider(repository);

    await expectStatus('ready');
    expect(screen.getByTestId('total').props.children).toBe(500);
    expect(screen.getByTestId('goal').props.children).toBe(2000);
  });

  it('starts with an empty state when storage is empty', async () => {
    await renderProvider(new FakeRepository(createInitialState()));

    await expectStatus('ready');
    expect(screen.getByTestId('total').props.children).toBe(0);
    expect(screen.getByTestId('warning').props.children).toBe('none');
  });

  it('exposes a corrupted storage warning', async () => {
    const repository = new FakeRepository(createInitialState());
    repository.loadWarning = appError('STORAGE_CORRUPTED');
    await renderProvider(repository);

    await expectStatus('ready');
    await waitFor(() => {
      expect(screen.getByTestId('warning').props.children).toBe('STORAGE_CORRUPTED');
    });
  });

  it('retries after a load failure', async () => {
    const repository = new FakeRepository(createInitialState());
    repository.loadError = appError('STORAGE_ERROR');
    await renderProvider(repository);

    await expectStatus('error');
    repository.loadError = null;
    await fireEvent.press(screen.getByTestId('retry'));

    await expectStatus('ready');
    expect(repository.loadCalls).toBe(2);
  });

  it('persists additions across a provider remount', async () => {
    const repository = new FakeRepository(createInitialState());
    const first = await renderProvider(repository);

    await expectStatus('ready');
    await fireEvent.press(screen.getByTestId('add'));
    await waitFor(() => {
      expect(screen.getByTestId('total').props.children).toBe(250);
    });
    await waitFor(() => {
      expect(screen.getByTestId('saving').props.children).toBe('false');
    });
    expect(repository.saveCalls).toBe(1);

    first.rerender(
      <HydrationProvider key="remount" nowProvider={() => FIXED_NOW} repository={repository}>
        <Probe />
      </HydrationProvider>
    );
    await waitFor(() => {
      expect(screen.getByTestId('status').props.children).toBe('ready');
      expect(screen.getByTestId('total').props.children).toBe(250);
    });
  });

  it('keeps the previous state and warns when saving fails', async () => {
    const repository = new FakeRepository(createInitialState());
    repository.saveError = appError('STORAGE_ERROR');
    await renderProvider(repository);

    await expectStatus('ready');
    await fireEvent.press(screen.getByTestId('add'));

    await waitFor(() => {
      expect(screen.getByTestId('warning').props.children).toBe('STORAGE_ERROR');
    });
    await waitFor(() => {
      expect(screen.getByTestId('saving').props.children).toBe('false');
    });
    expect(screen.getByTestId('total').props.children).toBe(0);
  });

  it('does not commit before the save finishes', async () => {
    const repository = new FakeRepository(createInitialState());
    let releaseSave: () => void = () => undefined;
    repository.saveGate = new Promise<void>((resolve) => {
      releaseSave = resolve;
    });
    await renderProvider(repository);

    await expectStatus('ready');
    await fireEvent.press(screen.getByTestId('add'));

    await waitFor(() => {
      expect(screen.getByTestId('saving').props.children).toBe('true');
    });
    expect(screen.getByTestId('total').props.children).toBe(0);

    await act(async () => {
      releaseSave();
      await Promise.resolve();
    });

    await waitFor(() => {
      expect(screen.getByTestId('total').props.children).toBe(250);
    });
    await waitFor(() => {
      expect(screen.getByTestId('saving').props.children).toBe('false');
    });
  });
});
