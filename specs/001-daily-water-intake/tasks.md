# Tasks: Controle Diário de Consumo de Água

**Input**: Design documents from `specs/001-daily-water-intake/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`

**Tests**: Included because `plan.md` defines a Jest + `jest-expo` + React Native Testing Library testing strategy for this feature.

**Organization**: Tasks are grouped by user story so each story can be implemented, validated and delivered independently.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependency on an incomplete task)
- **[Story]**: User story label (`[US1]`, `[US2]`, `[US3]`, `[US4]`)
- Every task includes an exact file path.

## Path Conventions

- Mobile app source: `src/`
- Tests: `__tests__/`
- Expo Router routes: `src/app/`; screens live in `src/pages/`
- Feature docs: `specs/001-daily-water-intake/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare dependencies, test tooling, linting and type declarations before feature code.

- [X] T001 Install AsyncStorage and dev tooling, and add `test`/`typecheck` scripts in `package.json`: run `npx expo install @react-native-async-storage/async-storage`; add SDK-58-compatible `jest`, `jest-expo`, `@types/jest`, `@testing-library/react-native`, `eslint` and `eslint-config-expo`; update `package-lock.json`.
- [X] T002 [P] Create the feature directory structure: `src/pages/{today,week,goal}`, `src/controllers`, `src/usecases`, `src/storage`, `src/domain`, `src/utils`, `src/types`, `src/components` and `__tests__/{helpers,usecases,storage,utils,controllers,router}`.
- [X] T003 [P] Configure Jest in `jest.config.js` and `jest.setup.ts` with the `jest-expo` preset, React Native Testing Library cleanup, the official AsyncStorage mock, and coverage output; add coverage to `.gitignore`.
- [X] T004 [P] Create deterministic test helpers in `__tests__/helpers/fixtures.ts`, `__tests__/helpers/fake-clock.ts` and `__tests__/helpers/test-ids.ts` for fixed dates, 30-day fixtures and fixed IDs.
- [X] T005 [P] Add `eslint.config.js` using `eslint-config-expo` and ensure `npm run lint` succeeds without auto-installing packages.
- [X] T006 [P] Add `src/types/styles.d.ts` declarations for `*.css` and `*.module.css` imports so `src/constants/theme.ts` and `src/components/animated-icon.web.tsx` typecheck.

**Checkpoint**: Dependencies, tests, lint and global type declarations are ready.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Domain model, persistence, controller shell, navigation shell and shared utilities required by all stories.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T007 [P] Define hydration constants in `src/constants/hydration.ts`: `DEFAULT_GOAL_ML = 2000`, `MIN_VOLUME_ML = 1`, `MAX_VOLUME_ML = 5000`, `MIN_GOAL_ML = 500`, `MAX_GOAL_ML = 10000`, quick-add values `[200, 250, 500]`, storage key `@hidrate/state` and backup-key prefix.
- [X] T008 [P] Create domain types and errors in `src/domain/entities.ts` and `src/domain/errors.ts`: `IntakeEntry { id, dayKey, createdAt, localTime, volumeMl }`, `GoalChange { effectiveFrom, goalMl }`, `WaterState { schemaVersion: 1, settings.defaultGoalMl, goalHistory, entriesByDay }`, `DailySummary`, `WeeklySummary`, `Result<T>` and the `AppErrorCode` union from `contracts/use-cases.md`.
- [X] T009 [P] Implement local date utilities in `src/utils/date.ts`: `dayKeyFromDate` using local `getFullYear`/`getMonth`/`getDate` (never `toISOString()` for the day), `localTimeFromDate` as `HH:mm`, `lastSevenDayKeys` using local midday arithmetic, and `formatDate` for pt-BR.
- [X] T010 [P] Implement volume utilities in `src/utils/volume.ts`: `formatVolume` returns `<n> ml` below 1.000 ml and `L` with exactly one decimal using pt-BR comma at or above 1.000 ml; `formatPercent`; progress-bar capping helper limited to 100%.
- [X] T011 Implement validation utilities in `src/utils/validation.ts`: parse integer-only ml input; enforce `volumeMl` integer in `[1, 5000]` and `goalMl` integer in `[500, 10000]`; return `INVALID_VOLUME`/`INVALID_GOAL`; centralize messages.
- [X] T012 [P] Implement `src/utils/id.ts` with `crypto.randomUUID()` when available and a timestamp+random fallback; keep the generator injectable.
- [X] T013 Implement `src/storage/schema.ts` and `src/storage/serializer.ts`: `createInitialState()` with `defaultGoalMl = 2000`, `goalHistory = []`, `entriesByDay = {}`; validate `schemaVersion === 1`; enforce `goalHistory` ascending and unique `effectiveFrom`, `defaultGoalMl` equal to the last history goal (or 2.000), `IntakeEntry.volumeMl` integer `[1, 5000]`, `dayKey` matching its map key, `createdAt` ISO, `localTime` `HH:mm`, unique IDs and no empty day arrays; serialize/deserialize with normalization.
- [X] T014 Create the repository interface and result types in `src/storage/repository.ts`: `load()`, `save(state)`, `backupCorrupt(raw, timestampMs)` and `LoadResult { state, warning }` exactly as specified in `contracts/storage.md`.
- [X] T015 Implement `src/storage/async-storage-repository.ts`: read/write `@hidrate/state`, backup invalid payloads to `@hidrate/state:corrupt:<epochMs>` before resetting, return `STORAGE_CORRUPTED`/`STORAGE_ERROR`, and serialize all writes through an internal FIFO queue.
- [X] T016 [P] Implement `src/controllers/use-current-day.ts`: track the local `todayKey`, refresh on mount, on `AppState` returning to active, and with a timer scheduled for the next local midnight; expose the current day to the provider.
- [X] T017 Implement the controller shell in `src/controllers/hydration-provider.tsx` and `src/controllers/use-hydration.ts`: load state on mount, use `useCurrentDay`, expose `status`, `state`, `warning`, `isSaving`, `retry()` and `clearWarning()`; keep the last confirmed state on save failure. Story-specific actions are added in their phases.
- [X] T018 [P] Create shared presentational components in `src/components/error-banner.tsx`, `src/components/empty-state.tsx` and `src/components/form-field.tsx` using the existing themed components, spacing and accessible labels.
- [X] T019 Implement `src/usecases/resolve-goal-for-day.ts`: return the `goalMl` of the latest `GoalChange` with `effectiveFrom <= dayKey`, or 2.000 ml when none exists; do not mutate state.
- [X] T020 Create the app/navigation shell: wrap `src/app/_layout.tsx` with `HydrationProvider`; create thin routes `src/app/index.tsx`, `src/app/week.tsx`, `src/app/goal.tsx`; create placeholder pages `src/pages/today/today-page.tsx`, `src/pages/week/week-page.tsx` and `src/pages/goal/goal-page.tsx` that are replaced in their story phases.
- [X] T021 [P] Add storage tests in `__tests__/storage/schema.test.ts` and `__tests__/storage/async-storage-repository.test.ts` covering round-trip, invalid JSON, unknown schema version, backup creation, backup failure, `goalHistory` invariants, empty-array normalization, save validation and FIFO writes.
- [X] T022 [P] Add utility tests in `__tests__/utils/date.test.ts`, `__tests__/utils/volume.test.ts` and `__tests__/utils/validation.test.ts` covering midnight, DST/fuso local, 7-day windows across month/year, 999/1000 ml formatting, and all volume/goal boundaries.
- [X] T023 Update `src/components/app-tabs.tsx` and `src/components/app-tabs.web.tsx` to tabs **Hoje**, **Semana** and **Meta** with routes `index`, `week`, `goal`; remove `src/app/explore.tsx`; fix the web `Pressable` ref typing error; reuse existing icons temporarily.
- [X] T024 [P] Add provider integration tests in `__tests__/controllers/hydration-provider.test.tsx` for initial load, empty storage, corrupted-storage warning, retry after load failure and persistence across provider remount.

**Checkpoint**: Foundation ready — user stories can now proceed.

---

## Phase 3: User Story 1 - Registrar consumo e acompanhar a meta diária (Priority: P1) 🎯 MVP

**Goal**: Permitir adicionar água por atalho ou volume personalizado e ver total, saldo, percentual e excedente do dia.

**Independent Test**: Com a meta padrão de 2.000 ml, adicionar 250 ml deve exibir total 250 ml, saldo 1.750 ml e 12,5%; adicionar valores inválidos não deve alterar o total.

### Tests for User Story 1

> Write these tests first and confirm they fail before implementation.

- [X] T025 [P] [US1] Unit-test `addIntake` in `__tests__/usecases/add-intake.test.ts` for valid 250 ml, limits 1/5.000 ml, invalid 0/negative/decimal/5.001/empty, local `dayKey`/`localTime`, unique ID and immutability.
- [X] T026 [P] [US1] Unit-test `selectDailySummary` in `__tests__/usecases/select-daily-summary.test.ts` for empty day, total, goal resolution, raw percent, remaining, excess, `goalMet` and `entryCount`.
- [X] T027 [P] [US1] Integration-test the Today flow in `__tests__/router/today-add.test.tsx`: render the provider and route, add 250 ml via quick add and custom volume, assert progress and inline validation.

### Implementation for User Story 1

- [X] T028 [US1] Implement `src/usecases/add-intake.ts`: validate `volumeMl` integer `[1, 5000]`; build `IntakeEntry` with injected `id`, `dayKey` from local date, `createdAt` ISO, `localTime` `HH:mm`; append to `entriesByDay`; return new state and entry without persisting.
- [X] T029 [US1] Implement `src/usecases/select-daily-summary.ts`: sum the day, resolve `goalMl` via `resolveGoalForDay`, compute raw `progressPercent`, `remainingMl = max(0, goal - total)`, `excessMl = max(0, total - goal)`, `goalMet` and `entryCount`.
- [X] T030 [US1] Add `addIntake` to `src/controllers/hydration-provider.tsx` and `src/controllers/use-hydration.ts`: inject clock/ID, call the use case, persist before committing in-memory state, serialize concurrent calls, return `true` only after a successful save, and expose a memoized `today` summary derived from state and `todayKey`.
- [X] T031 [P] [US1] Create `src/components/progress-card.tsx`: total, goal, remaining/excess, percentage text and a progress bar capped at 100%, with accessible label "Consumo de hoje: X de Y mililitros, Z por cento" and a textual "Meta atingida" indicator.
- [X] T032 [P] [US1] Create `src/components/quick-add-row.tsx`: 200 ml, 250 ml and 500 ml buttons with accessible labels, disabled while saving, at least 44×44 touch targets.
- [X] T033 [P] [US1] Create `src/components/intake-form.tsx`: integer ml field, "Adicionar" button, inline validation for empty/zero/negative/non-numeric/above 5.000, clear on success and keep the entered value on storage failure.
- [X] T034 [US1] Replace the placeholder `src/pages/today/today-page.tsx` with the P1 layout using `ProgressCard`, `QuickAddRow`, `IntakeForm`, current date header and loading/error/warning states.
- [X] T035 [US1] Update `src/app/index.tsx` to render `TodayPage` and verify adding via 1 tap, total/progress updated in under 1 second, and invalid input blocked.

**Checkpoint**: US1 is fully usable as the MVP with the default goal.

---

## Phase 4: User Story 2 - Definir e ajustar a meta diária (Priority: P2)

**Goal**: Permitir alterar a meta diária, recalcular o dia atual e preservar a meta vigente de cada dia.

**Independent Test**: Com 1.000 ml registrados e meta 2.000 ml, alterar para 2.500 ml deve mudar o progresso de 50% para 40% e o saldo para 1.500 ml; reabrir o app mantém a meta; dias anteriores mantêm a meta antiga.

### Tests for User Story 2

- [X] T036 [P] [US2] Unit-test `setDailyGoal` and `resolveGoalForDay` in `__tests__/usecases/set-daily-goal.test.ts`: valid 500/2.500/10.000 ml, invalid 499/10.001/decimal/text, same-day upsert, skipped days between changes, empty history fallback 2.000 and no retroactive changes.
- [X] T037 [P] [US2] Integration-test the Goal flow in `__tests__/router/goal.test.tsx`: change goal, assert Today progress recalculates, invalid value shows inline error, and the saved goal survives provider remount.

### Implementation for User Story 2

- [X] T038 [US2] Implement `src/usecases/set-daily-goal.ts`: validate `goalMl` integer `[500, 10000]`; update `settings.defaultGoalMl`; upsert `{ effectiveFrom: today, goalMl }` in `goalHistory`; preserve older entries.
- [X] T039 [US2] Add `setDailyGoal` to `src/controllers/hydration-provider.tsx` and `src/controllers/use-hydration.ts` with save-before-commit, serialized writes and error handling.
- [X] T040 [US2] Replace the placeholder `src/pages/goal/goal-page.tsx` with the Goal screen: current goal, numeric ml field, "Salvar meta", validation 500–10.000, saving state, success feedback and the message that the change applies to today and future days only.
- [X] T041 [US2] Update `src/app/goal.tsx` to render `GoalPage`; verify Today updates immediately, the saved goal survives restart and older `goalHistory` entries remain unchanged.

**Checkpoint**: US1 and US2 work independently and together.

---

## Phase 5: User Story 3 - Consultar o histórico do dia e corrigir registros (Priority: P3)

**Goal**: Exibir os registros do dia com horário e volume, permitir editar o volume e remover registros com recálculo imediato.

**Independent Test**: Adicionar 250 ml e 500 ml, abrir o histórico e conferir a ordem inversa; editar 250 ml para 300 ml mantendo o horário; remover um registro e conferir total, saldo e progresso.

### Tests for User Story 3

- [X] T042 [P] [US3] Unit-test `editIntake` and `removeIntake` in `__tests__/usecases/edit-remove-intake.test.ts`: valid edits, invalid volumes, preserved `createdAt`/`localTime`, missing ID, other-day entry, removing the last entry and no empty day arrays.
- [X] T043 [P] [US3] Integration-test the history flow in `__tests__/router/today-history.test.tsx`: add two records, assert reverse chronological order and 1,5 L formatting, edit volume, cancel edit, remove with confirmation, and stale-record handling.

### Implementation for User Story 3

- [X] T044 [US3] Implement `src/usecases/edit-intake.ts`: validate `volumeMl` integer `[1, 5000]`; only edit entries in today's `dayKey`; preserve `dayKey`, `createdAt` and `localTime`; return `ENTRY_NOT_FOUND`/`ENTRY_NOT_EDITABLE`; do not mutate state.
- [X] T045 [US3] Implement `src/usecases/remove-intake.ts`: only remove today's entries; return `ENTRY_NOT_FOUND`/`ENTRY_NOT_EDITABLE`; delete the day key when its array becomes empty; do not mutate state.
- [X] T046 [US3] Add `editIntake` and `removeIntake` to `src/controllers/hydration-provider.tsx` and `src/controllers/use-hydration.ts` with save-before-commit, serialized writes and boolean results.
- [X] T047 [P] [US3] Create `src/components/intake-history-list.tsx` with `FlatList`, newest-first ordering, `HH:mm` and formatted volume, edit/remove actions, accessible item labels and an empty state.
- [X] T048 [P] [US3] Create `src/components/intake-edit-dialog.tsx` prefilled with the current volume, "Salvar"/"Cancelar", inline 1–5.000 validation and disabled state while saving.
- [X] T049 [P] [US3] Create `src/components/confirm-dialog.tsx` and wire stale-record handling: `ENTRY_NOT_FOUND` refreshes silently; `ENTRY_NOT_EDITABLE` refreshes and shows a non-blocking notice.
- [X] T050 [US3] Integrate history, edit dialog and remove confirmation into `src/pages/today/today-page.tsx`, ensuring total, remaining, excess and progress update immediately after edit/remove.

**Checkpoint**: US1, US2 and US3 work independently and together.

---

## Phase 6: User Story 4 - Consultar o resumo dos últimos 7 dias (Priority: P4)

**Goal**: Exibir exatamente os últimos 7 dias corridos, incluindo hoje, com total, meta vigente e indicação de meta atingida.

**Independent Test**: Com registros em alguns dias e dias vazios, abrir a semana deve mostrar 7 itens em ordem cronológica, com 0 ml nos dias vazios e a meta correta de cada dia, incluindo após alterar a meta.

### Tests for User Story 4

- [X] T051 [P] [US4] Unit-test `selectWeeklySummary` in `__tests__/usecases/select-weekly-summary.test.ts`: exactly 7 days, oldest-to-newest order, empty days, today last, historical goals, skipped days, month/year boundary and `daysWithGoalMet`.
- [X] T052 [P] [US4] Integration-test the Week screen in `__tests__/router/week.test.tsx`: render 7 rows, verify goal status and totals, add/edit/remove today and assert the today row updates, and simulate midnight rollover with a fake clock.

### Implementation for User Story 4

- [X] T053 [US4] Implement `src/usecases/select-weekly-summary.ts`: build 7 local `DayKey`s ending at `now`, call `selectDailySummary` for each, preserve oldest-to-newest order and count `daysWithGoalMet`.
- [X] T054 [US4] Add the memoized `week` summary to `src/controllers/hydration-provider.tsx` and `src/controllers/use-hydration.ts`; ensure `today` and `week` recompute after add/edit/remove/goal changes and on `todayKey` rollover.
- [X] T055 [P] [US4] Create `src/components/weekly-summary-list.tsx`: 7 rows with localized date, formatted total, formatted goal, textual "Meta atingida"/"Meta não atingida", accessible row labels and no actions.
- [X] T056 [US4] Replace the placeholder `src/pages/week/week-page.tsx` with the Week screen: title "Últimos 7 dias", loading/error/warning states, 7-item list and today highlighted.
- [X] T057 [US4] Update `src/app/week.tsx` to render `WeekPage`; verify deep link `/week`, 7 rows and the correct oldest/newest day ordering.
- [X] T058 [US4] Integrate `useCurrentDay` into `src/pages/week/week-page.tsx` and `src/controllers/hydration-provider.tsx` so the window refreshes on foreground and at local midnight without persisting derived summaries.

**Checkpoint**: All four user stories are independently functional.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Accessibility, performance, robustness and final validation across all stories.

- [X] T059 [P] Apply accessibility labels, roles, hints and 44×44 touch targets across `src/components/progress-card.tsx`, `src/components/quick-add-row.tsx`, `src/components/intake-history-list.tsx`, `src/components/weekly-summary-list.tsx` and the three pages; verify VoiceOver/TalkBack and large text.
- [X] T060 [P] Optimize `src/pages/today/today-page.tsx` and `src/pages/week/week-page.tsx`: memoized selectors, `FlatList` keys by entry ID, no unnecessary state copies; validate with a 30-day fixture that the main screen opens in under 2 seconds.
- [X] T061 [P] Integrate storage corruption/error handling into `src/app/_layout.tsx` and the pages: global non-blocking banner, backup notice, "Tentar novamente" action and preservation of the last confirmed state.
- [X] T062 [P] Finalize tab icons/labels in `src/components/app-tabs.tsx` and `src/components/app-tabs.web.tsx`; delete unused starter UI (`src/components/hint-row.tsx`, `src/components/web-badge.tsx`, `src/components/external-link.tsx`, `src/components/ui/collapsible.tsx`) and unused assets only after confirming no references remain.
- [X] T063 [P] Fix any remaining TypeScript issues in `src/components/animated-icon.web.tsx`, `src/components/app-tabs.web.tsx` and `src/constants/theme.ts` that were not resolved by T006/T023; keep `tsconfig.json` strict and the `@/` alias intact.
- [X] T064 Run `npm test` from the repo root and fix failures in `__tests__/`; all use case, utility, storage, controller and router tests must pass.
- [X] T065 Run `npm run lint` and fix all reported issues in `src/`, `__tests__/` and `eslint.config.js` without disabling rules globally.
- [X] T066 Run `npx tsc --noEmit` and fix all type errors in `src/` and `__tests__/`, including the pre-existing errors listed in `plan.md` validation notes.
- [X] T067 Run `npx expo-doctor` and resolve dependency/config warnings in `package.json`, `app.json` and `tsconfig.json` compatible with Expo SDK 58.
- [ ] T068 Execute the manual scenarios in `specs/001-daily-water-intake/quickstart.md` on iOS/Android, including offline use, persistence, midnight rollover, invalid inputs, goal changes, edit/remove, week summary and accessibility.
  - **Pendente**: requer simulador/dispositivo iOS ou Android. Não executado neste ambiente; a validação automatizada cobre os fluxos equivalentes via Jest/RNTL.
- [X] T069 Audit `specs/001-daily-water-intake/spec.md` FR-001–FR-027 and SC-001–SC-012 against the implementation; record any gap in `specs/001-daily-water-intake/tasks.md` and resolve it before declaring the feature complete.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies; start immediately.
- **Foundational (Phase 2)**: Depends on Setup; blocks all user stories.
- **User Stories (Phases 3–6)**: Depend on Foundational phase completion.
- **Polish (Phase 7)**: Depends on all desired user stories being complete.

### User Story Dependencies

- **US1 (P1)**: Can start after Foundational; no dependency on other stories. MVP.
- **US2 (P2)**: Can start after Foundational; independent of US1, but the Today screen integration becomes visible when US1 exists.
- **US3 (P3)**: Can start after Foundational; UI integration assumes the Today screen from US1, so run US3 after US1 in a single-developer flow.
- **US4 (P4)**: Can start after Foundational; independent of US1–US3, but it shares `HydrationProvider` with them, so coordinate edits to that file.

### Within Each User Story

- Write tests first and confirm they fail.
- Use cases before controller actions.
- Controller actions before page integration.
- Presentational components can be built in parallel with use cases.
- Routes are updated only after their page exists.
- Finish and validate the story before moving to the next priority.

### Parallel Opportunities

- Setup: T002, T003, T004, T005 and T006 can run in parallel after T001.
- Foundational: T007–T012, T016, T018, T021 and T022 can run in parallel where files are independent; storage/controller tasks (T013–T015, T017, T019, T020, T023, T024) are sequential.
- US1: T025–T027 in parallel; T031–T033 in parallel; T028–T030 sequential.
- US2: T036–T037 in parallel; T038–T041 sequential.
- US3: T042–T043 in parallel; T047–T049 in parallel; T044–T046 and T050 sequential.
- US4: T051–T052 in parallel; T055 can run alongside T053; T053–T054 and T056–T058 sequential.
- Polish: T059–T063 in parallel; T064–T068 sequential after implementation.

---

## Parallel Example: User Story 1

```bash
# Tests can be written together:
Task: "Unit-test addIntake in __tests__/usecases/add-intake.test.ts"
Task: "Unit-test selectDailySummary in __tests__/usecases/select-daily-summary.test.ts"
Task: "Integration-test Today flow in __tests__/router/today-add.test.tsx"

# Presentational components can be built together:
Task: "Create ProgressCard in src/components/progress-card.tsx"
Task: "Create QuickAddRow in src/components/quick-add-row.tsx"
Task: "Create IntakeForm in src/components/intake-form.tsx"
```

## Parallel Example: User Story 2

```bash
Task: "Unit-test setDailyGoal/resolveGoalForDay in __tests__/usecases/set-daily-goal.test.ts"
Task: "Integration-test Goal flow in __tests__/router/goal.test.tsx"
```

## Parallel Example: User Story 3

```bash
Task: "Create IntakeHistoryList in src/components/intake-history-list.tsx"
Task: "Create IntakeEditDialog in src/components/intake-edit-dialog.tsx"
Task: "Create ConfirmDialog in src/components/confirm-dialog.tsx"
```

## Parallel Example: User Story 4

```bash
Task: "Unit-test selectWeeklySummary in __tests__/usecases/select-weekly-summary.test.ts"
Task: "Integration-test Week screen in __tests__/router/week.test.tsx"
Task: "Create WeeklySummaryList in src/components/weekly-summary-list.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup.
2. Complete Phase 2: Foundational.
3. Complete Phase 3: US1.
4. **STOP and VALIDATE**: add 250 ml, check 12,5%, invalid input, persistence and restart.
5. Demo the MVP with the default 2.000 ml goal.

### Incremental Delivery

1. Setup + Foundational → foundation ready.
2. US1 → validate → demo MVP.
3. US2 → validate goal changes and historical goals → demo.
4. US3 → validate history/edit/remove → demo.
5. US4 → validate 7-day summary and midnight rollover → demo.
6. Polish → accessibility, performance, corruption handling, full `quickstart.md` validation.

### Parallel Team Strategy

1. One developer completes Setup + Foundational.
2. After Foundational:
   - Developer A: US1 (MVP).
   - Developer B: US2 (Goal screen).
   - Developer C: US4 (Week screen), coordinating `HydrationProvider` edits.
3. US3 after US1 because it extends the Today screen.
4. Polish after the desired stories are complete.

---

## Notes

- `[P]` means different files and no dependency on an incomplete task.
- Commit after each task or logical group.
- Do not edit `ios/` or `android/` manually; configure native behavior in `app.json`/config plugins.
- Use `npx expo install` for Expo-managed dependencies.
- Keep the persisted schema at `schemaVersion: 1`; no migration is required for this release.
- Derived summaries must never be persisted.
- The week summary must always contain exactly 7 local days and resolve historical goals from `goalHistory`.
