# Contracts: Casos de Uso

**Feature**: `001-daily-water-intake`
**Camada**: `src/usecases`
**Tipo**: funções puras, sem React e sem AsyncStorage

## Convenções

- Todo caso de uso recebe o `WaterState` atual e um objeto de entrada.
- Nenhum caso de uso lê o relógio global, gera IDs ou acessa storage diretamente; `now` e `id` são injetados pelo controller.
- Todo caso de uso retorna um `Result<T>` discriminado.
- Erros são códigos de domínio; a UI decide a mensagem final em português.
- O estado retornado é imutável: nenhuma função altera o objeto recebido.

```ts
type Result<T> =
  | { ok: true; value: T }
  | { ok: false; error: AppError };

type AppErrorCode =
  | 'INVALID_VOLUME'
  | 'INVALID_GOAL'
  | 'ENTRY_NOT_FOUND'
  | 'ENTRY_NOT_EDITABLE'
  | 'STORAGE_CORRUPTED'
  | 'STORAGE_ERROR';

interface AppError {
  code: AppErrorCode;
  message: string;
}
```

## `addIntake`

**Assinatura**

```ts
function addIntake(
  state: WaterState,
  input: { volumeMl: number; now: Date; id: string }
): Result<{ state: WaterState; entry: IntakeEntry }>;
```

**Comportamento**

1. Valida `volumeMl` como inteiro entre 1 e 5.000.
2. Cria uma `IntakeEntry` com `id`, `dayKey` e `localTime` derivados de `now`.
3. Insere a entrada ao final de `entriesByDay[dayKey]`.
4. Retorna o novo estado e a entrada criada.

**Erros**: `INVALID_VOLUME`.

**Pós-condições**:
- `totalMl` do dia aumenta exatamente por `volumeMl`.
- `entry.dayKey` é o dia local de `now`.
- `entry.createdAt` representa o instante de `now`.
- O estado anterior não é mutado.

**Cobre**: FR-001, FR-003, FR-004, FR-011, FR-019.

## `editIntake`

**Assinatura**

```ts
function editIntake(
  state: WaterState,
  input: { entryId: string; volumeMl: number; now: Date }
): Result<{ state: WaterState; entry: IntakeEntry }>;
```

**Comportamento**

1. Valida `volumeMl` como inteiro entre 1 e 5.000.
2. Localiza a entrada no dia local de `now`.
3. Se a entrada não existir, retorna `ENTRY_NOT_FOUND`.
4. Se a entrada existir em outro dia, retorna `ENTRY_NOT_EDITABLE`.
5. Atualiza apenas `volumeMl`; `dayKey`, `createdAt` e `localTime` são preservados.
6. Retorna o novo estado e a entrada atualizada.

**Erros**: `INVALID_VOLUME`, `ENTRY_NOT_FOUND`, `ENTRY_NOT_EDITABLE`.

**Pós-condições**:
- O total do dia é recalculado com o novo volume.
- O horário original permanece inalterado.
- O estado anterior não é mutado.

**Cobre**: FR-026, FR-027, FR-012, FR-019.

## `removeIntake`

**Assinatura**

```ts
function removeIntake(
  state: WaterState,
  input: { entryId: string; now: Date }
): Result<{ state: WaterState }>;
```

**Comportamento**

1. Localiza a entrada no dia local de `now`.
2. Se não existir, retorna `ENTRY_NOT_FOUND`.
3. Se pertencer a outro dia, retorna `ENTRY_NOT_EDITABLE`.
4. Remove a entrada.
5. Se o array do dia ficar vazio, remove a chave do dia em `entriesByDay`.
6. Retorna o novo estado.

**Erros**: `ENTRY_NOT_FOUND`, `ENTRY_NOT_EDITABLE`.

**Pós-condições**:
- O total do dia diminui exatamente pelo volume removido.
- Não restam arrays vazios em `entriesByDay`.
- O estado anterior não é mutado.

**Cobre**: FR-015, FR-016, FR-025.

## `setDailyGoal`

**Assinatura**

```ts
function setDailyGoal(
  state: WaterState,
  input: { goalMl: number; now: Date }
): Result<{ state: WaterState }>;
```

**Comportamento**

1. Valida `goalMl` como inteiro entre 500 e 10.000.
2. Calcula o dia local de `now`.
3. Atualiza `settings.defaultGoalMl` para o novo valor.
4. Faz upsert de `{ effectiveFrom: today, goalMl }` em `goalHistory`; se já existir entrada para hoje, substitui o valor.
5. Mantém inalteradas as entradas de `goalHistory` de dias anteriores.
6. Retorna o novo estado.

**Erros**: `INVALID_GOAL`.

**Pós-condições**:
- O progresso do dia atual é recalculado com a nova meta.
- A nova meta passa a valer para os próximos dias.
- Nenhum dia anterior é recalculado.
- Não existem duas entradas de `goalHistory` com a mesma data.

**Cobre**: FR-008, FR-009, FR-010, FR-012, FR-023.

## `resolveGoalForDay`

**Assinatura**

```ts
function resolveGoalForDay(
  state: WaterState,
  input: { dayKey: DayKey }
): number;
```

**Comportamento**

1. Procura em `goalHistory` a entrada mais recente com `effectiveFrom <= dayKey`.
2. Retorna o `goalMl` dessa entrada.
3. Se não houver entrada, retorna `DEFAULT_GOAL_ML` (2.000 ml).
4. Não altera o estado.

**Erros**: nenhum.

**Pós-condições**:
- A meta de hoje é igual a `settings.defaultGoalMl`.
- Dias pulados entre duas mudanças usam a meta vigente naquele intervalo.
- Dias anteriores à primeira mudança usam 2.000 ml.

**Cobre**: FR-009, FR-021, FR-023, FR-025.

## `selectDailySummary`

**Assinatura**

```ts
function selectDailySummary(
  state: WaterState,
  input: { dayKey: DayKey }
): DailySummary;
```

**Comportamento**

1. Soma `volumeMl` de `entriesByDay[dayKey]`.
2. Resolve `goalMl` com `resolveGoalForDay(state, { dayKey })`.
3. Calcula `progressPercent`, `remainingMl`, `excessMl`, `goalMet` e `entryCount`.

**Erros**: nenhum; dias sem registros retornam total 0.

**Pós-condições**:
- `remainingMl` e `excessMl` nunca são simultaneamente positivos.
- `progressPercent` não é limitado a 100 no domínio; a UI limita a barra.

**Cobre**: FR-004, FR-005, FR-006, FR-007, FR-014.

## `selectWeeklySummary`

**Assinatura**

```ts
function selectWeeklySummary(
  state: WaterState,
  input: { now: Date }
): WeeklySummary;
```

**Comportamento**

1. Calcula os 7 `DayKey`s locais terminando no dia de `now`.
2. Gera um `DailySummary` para cada dia.
3. Ordena do mais antigo para o mais recente.
4. Conta quantos dias atingiram a meta.

**Erros**: nenhum.

**Pós-condições**:
- Exatamente 7 dias são retornados.
- O último item corresponde a `now`.
- Dias sem registros retornam `totalMl = 0` e `goalMet = false`.

**Cobre**: FR-021, FR-022, FR-023, FR-024, FR-025.

## Matriz de testes

| Caso | Entrada | Resultado esperado |
|------|---------|--------------------|
| Adicionar válido | 250 ml, meta 2.000 ml | Novo total 250 ml; entrada criada com horário atual |
| Adicionar no limite | 1 ml e 5.000 ml | Aceito |
| Adicionar inválido | 0, -1, 1,5, 5.001, vazio | `INVALID_VOLUME`; estado inalterado |
| Editar válido | Registro de 250 ml para 300 ml | Total +50 ml; horário original mantido |
| Editar inválido | 0, 5.001, texto | `INVALID_VOLUME`; estado inalterado |
| Editar inexistente | ID desconhecido | `ENTRY_NOT_FOUND` |
| Editar outro dia | ID de ontem | `ENTRY_NOT_EDITABLE` |
| Remover válido | Registro existente | Total diminui; entrada sai do histórico |
| Remover último | Único registro do dia | Total 0; chave do dia removida |
| Definir meta válida | 2.500 ml | `defaultGoalMl` e entrada de hoje em `goalHistory` atualizados |
| Definir meta duas vezes no dia | 2.500 ml e depois 3.000 ml | Apenas uma entrada para hoje, com 3.000 ml |
| Definir meta inválida | 499, 10.001, texto | `INVALID_GOAL`; estado inalterado |
| Virada do dia | `now` no dia seguinte | Novo dia usa a meta atual; dia anterior intacto |
| Meta histórica | Alterar meta depois de dias sem abrir o app | Dias pulados usam a meta vigente no intervalo |
| Meta antes da primeira mudança | Dia anterior à primeira entrada de `goalHistory` | Usa 2.000 ml |
| Semana | 7 dias com dias vazios | 7 itens; vazios com 0 ml, meta correta e não atingida |
| Semana na virada de mês/ano | 29/12 a 04/01 | 7 chaves corretas, sem duplicatas |

## Tratamento de erros na UI

| Erro | Tratamento |
|------|------------|
| `INVALID_VOLUME` | Mensagem inline no formulário; preservar valor anterior; não persistir |
| `INVALID_GOAL` | Mensagem inline no formulário de meta; preservar valor anterior; não persistir |
| `ENTRY_NOT_FOUND` | Atualizar a lista a partir do estado atual e não exibir erro (registro já removido) |
| `ENTRY_NOT_EDITABLE` | Atualizar a lista e exibir aviso não bloqueante de que o registro não pertence mais ao dia atual |
| `STORAGE_CORRUPTED` | Banner não bloqueante após carregar o estado inicial; backup já criado |
| `STORAGE_ERROR` | Banner com ação "Tentar novamente"; manter o último estado confirmado |
