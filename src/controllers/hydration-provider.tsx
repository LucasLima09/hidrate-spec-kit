import { useCallback, useEffect, useMemo, useReducer, useRef, type ReactNode } from 'react';

import type { WaterState } from '@/domain/entities';
import type { AppError, Result } from '@/domain/errors';
import type { WaterRepository } from '@/storage/repository';
import { waterRepository } from '@/storage/async-storage-repository';
import { addIntake as addIntakeUseCase } from '@/usecases/add-intake';
import { editIntake as editIntakeUseCase } from '@/usecases/edit-intake';
import { removeIntake as removeIntakeUseCase } from '@/usecases/remove-intake';
import { selectDailySummary } from '@/usecases/select-daily-summary';
import { selectWeeklySummary } from '@/usecases/select-weekly-summary';
import { setDailyGoal as setDailyGoalUseCase } from '@/usecases/set-daily-goal';
import { generateId, type IdGenerator } from '@/utils/id';
import { HydrationContext, type HydrationController, type HydrationStatus } from '@/controllers/use-hydration';
import { useCurrentDay, type NowProvider } from '@/controllers/use-current-day';

interface ProviderState {
  status: HydrationStatus;
  state: WaterState | null;
  warning: AppError | null;
  pendingOperations: number;
}

type Action =
  | { type: 'LOAD_START' }
  | { type: 'LOAD_SUCCESS'; state: WaterState; warning: AppError | null }
  | { type: 'LOAD_FAILURE'; error: AppError }
  | { type: 'COMMIT'; state: WaterState }
  | { type: 'SET_WARNING'; warning: AppError }
  | { type: 'CLEAR_WARNING' }
  | { type: 'PENDING_START' }
  | { type: 'PENDING_END' };

const initialState: ProviderState = {
  status: 'loading',
  state: null,
  warning: null,
  pendingOperations: 0,
};

function reducer(state: ProviderState, action: Action): ProviderState {
  switch (action.type) {
    case 'LOAD_START':
      return { ...state, status: 'loading', warning: null };
    case 'LOAD_SUCCESS':
      return {
        ...state,
        status: 'ready',
        state: action.state,
        warning: action.warning,
      };
    case 'LOAD_FAILURE':
      return { ...state, status: 'error', state: null, warning: action.error };
    case 'COMMIT':
      return { ...state, state: action.state };
    case 'SET_WARNING':
      return { ...state, warning: action.warning };
    case 'CLEAR_WARNING':
      return { ...state, warning: null };
    case 'PENDING_START':
      return { ...state, pendingOperations: state.pendingOperations + 1 };
    case 'PENDING_END':
      return {
        ...state,
        pendingOperations: Math.max(0, state.pendingOperations - 1),
      };
    default:
      return state;
  }
}

const defaultNow: NowProvider = () => new Date();

export interface HydrationProviderProps {
  children: ReactNode;
  repository?: WaterRepository;
  nowProvider?: NowProvider;
  idGenerator?: IdGenerator;
}

export function HydrationProvider({
  children,
  repository = waterRepository,
  nowProvider = defaultNow,
  idGenerator = generateId,
}: HydrationProviderProps) {
  const [providerState, dispatch] = useReducer(reducer, initialState);
  const stateRef = useRef<WaterState | null>(null);
  const queueRef = useRef<Promise<void>>(Promise.resolve());
  const pendingRef = useRef(0);
  const { todayKey } = useCurrentDay(nowProvider);

  const load = useCallback(async () => {
    dispatch({ type: 'LOAD_START' });
    const result = await repository.load();
    if (!result.ok) {
      stateRef.current = null;
      dispatch({ type: 'LOAD_FAILURE', error: result.error });
      return;
    }
    stateRef.current = result.value.state;
    dispatch({
      type: 'LOAD_SUCCESS',
      state: result.value.state,
      warning: result.value.warning,
    });
  }, [repository]);

  useEffect(() => {
    void load();
  }, [load]);

  const beginOperation = useCallback(() => {
    pendingRef.current += 1;
    dispatch({ type: 'PENDING_START' });
  }, []);

  const endOperation = useCallback(() => {
    pendingRef.current = Math.max(0, pendingRef.current - 1);
    dispatch({ type: 'PENDING_END' });
  }, []);

  const enqueue = useCallback((task: () => Promise<boolean>): Promise<boolean> => {
    const operation = queueRef.current.then(task, task);
    queueRef.current = operation.then(
      () => undefined,
      () => undefined
    );
    return operation;
  }, []);

  const persist = useCallback(
    async (nextState: WaterState): Promise<boolean> => {
      const saved = await repository.save(nextState);
      if (!saved.ok) {
        dispatch({ type: 'SET_WARNING', warning: saved.error });
        return false;
      }
      stateRef.current = nextState;
      dispatch({ type: 'COMMIT', state: nextState });
      return true;
    },
    [repository]
  );

  const runStateUpdate = useCallback(
    (mutator: (current: WaterState) => Result<WaterState>): Promise<boolean> =>
      enqueue(async () => {
        const current = stateRef.current;
        if (!current) {
          return false;
        }
        beginOperation();
        try {
          const result = mutator(current);
          if (!result.ok) {
            return false;
          }
          return await persist(result.value);
        } finally {
          endOperation();
        }
      }),
    [beginOperation, enqueue, endOperation, persist]
  );

  const addIntake = useCallback(
    (volumeMl: number): Promise<boolean> =>
      runStateUpdate((current) => {
        const result = addIntakeUseCase(current, {
          volumeMl,
          now: nowProvider(),
          id: idGenerator(),
        });
        return result.ok ? { ok: true, value: result.value.state } : result;
      }),
    [idGenerator, nowProvider, runStateUpdate]
  );

  const editIntake = useCallback(
    (entryId: string, volumeMl: number): Promise<boolean> =>
      enqueue(async () => {
        const current = stateRef.current;
        if (!current) {
          return false;
        }
        const result = editIntakeUseCase(current, { entryId, volumeMl, now: nowProvider() });
        if (!result.ok) {
          if (result.error.code === 'ENTRY_NOT_EDITABLE') {
            dispatch({ type: 'SET_WARNING', warning: result.error });
          }
          return false;
        }
        beginOperation();
        try {
          return await persist(result.value.state);
        } finally {
          endOperation();
        }
      }),
    [beginOperation, enqueue, endOperation, nowProvider, persist]
  );

  const removeIntake = useCallback(
    (entryId: string): Promise<boolean> =>
      enqueue(async () => {
        const current = stateRef.current;
        if (!current) {
          return false;
        }
        const result = removeIntakeUseCase(current, { entryId, now: nowProvider() });
        if (!result.ok) {
          if (result.error.code === 'ENTRY_NOT_EDITABLE') {
            dispatch({ type: 'SET_WARNING', warning: result.error });
          }
          return false;
        }
        beginOperation();
        try {
          return await persist(result.value.state);
        } finally {
          endOperation();
        }
      }),
    [beginOperation, enqueue, endOperation, nowProvider, persist]
  );

  const setDailyGoal = useCallback(
    (goalMl: number): Promise<boolean> =>
      runStateUpdate((current) => {
        const result = setDailyGoalUseCase(current, { goalMl, now: nowProvider() });
        return result.ok ? { ok: true, value: result.value.state } : result;
      }),
    [nowProvider, runStateUpdate]
  );

  const retry = useCallback(async () => {
    await load();
  }, [load]);

  const clearWarning = useCallback(() => {
    dispatch({ type: 'CLEAR_WARNING' });
  }, []);

  const today = useMemo(() => {
    if (!providerState.state) {
      return null;
    }
    return selectDailySummary(providerState.state, { dayKey: todayKey });
  }, [providerState.state, todayKey]);

  const week = providerState.state
    ? selectWeeklySummary(providerState.state, { now: nowProvider() })
    : null;

  const value = useMemo<HydrationController>(
    () => ({
      status: providerState.status,
      state: providerState.state,
      today,
      week,
      warning: providerState.warning,
      isSaving: providerState.pendingOperations > 0,
      addIntake,
      editIntake,
      removeIntake,
      setDailyGoal,
      retry,
      clearWarning,
    }),
    [
      addIntake,
      clearWarning,
      editIntake,
      providerState.pendingOperations,
      providerState.state,
      providerState.status,
      providerState.warning,
      removeIntake,
      retry,
      setDailyGoal,
      today,
      week,
    ]
  );

  return <HydrationContext.Provider value={value}>{children}</HydrationContext.Provider>;
}
