# Data Model: Controle Diário de Consumo de Água

**Feature**: `001-daily-water-intake`
**Date**: 2026-10-25
**Storage**: AsyncStorage, chave `@hidrate/state`, documento JSON versionado

## Convenções

- **Volume canônico**: inteiro em mililitros (`ml`). A conversão para litros é apenas de apresentação.
- **Dia local**: `DayKey` no formato `YYYY-MM-DD`, calculado com o fuso local do dispositivo no momento do registro.
- **Instante**: `createdAt` em ISO 8601 (UTC/instante absoluto), usado para ordenação e auditoria.
- **Horário exibido**: `localTime` em `HH:mm`, capturado no momento do registro para permanecer estável mesmo se o fuso mudar.
- **IDs**: UUID v4 gerado no cliente, único globalmente.
- **Ordenação persistida**: registros de um dia são mantidos em ordem crescente de `createdAt`; a UI exibe em ordem decrescente.
- **Dias vazios**: um dia sem registros não precisa existir em `entriesByDay`.

## Entidades

### IntakeEntry (Registro de Consumo)

Representa uma ingestão de água registrada pelo usuário.

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `id` | `string` | Sim | Identificador único (UUID) |
| `dayKey` | `DayKey` | Sim | Dia local ao qual o registro pertence; imutável |
| `createdAt` | `string` | Sim | Instante ISO 8601 da criação; imutável |
| `localTime` | `string` | Sim | Horário local `HH:mm` no momento da criação; imutável |
| `volumeMl` | `number` | Sim | Volume em ml; inteiro entre 1 e 5.000; editável |

**Invariantes**:
- `volumeMl` é inteiro e está no intervalo `[1, 5000]`.
- `dayKey` corresponde à data local de `createdAt` no momento da criação.
- `localTime` corresponde ao horário local de `createdAt` no momento da criação.
- `id` é único em todo o documento.

### AppSettings (Configurações)

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `defaultGoalMl` | `number` | Sim | Meta atual e meta para dias futuros; inteiro entre 500 e 10.000; inicial 2.000 |

### GoalChange (Mudança de Meta)

Representa o valor de meta que passou a valer a partir de um dia local. Permite resolver a meta vigente em qualquer dia, inclusive dias em que o app não foi aberto.

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `effectiveFrom` | `DayKey` | Sim | Primeiro dia local em que a meta passou a valer |
| `goalMl` | `number` | Sim | Meta em ml; inteiro entre 500 e 10.000 |

**Invariantes**:
- Uma única entrada por `effectiveFrom`; uma nova alteração no mesmo dia substitui o valor.
- Entradas são mantidas em ordem crescente de `effectiveFrom`.
- A meta de um dia é a última entrada com `effectiveFrom <= dayKey`; se não existir, usa-se 2.000 ml.

### WaterState (Estado Persistido)

Documento raiz salvo no AsyncStorage.

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `schemaVersion` | `1` | Sim | Versão do schema persistido |
| `settings` | `AppSettings` | Sim | Configurações globais |
| `goalHistory` | `GoalChange[]` | Sim | Histórico de mudanças de meta por data de vigência |
| `entriesByDay` | `Record<DayKey, IntakeEntry[]>` | Sim | Registros agrupados por dia |

**Invariantes**:
- Cada `GoalChange.goalMl` é inteiro entre 500 e 10.000.
- `goalHistory` está ordenado de forma crescente por `effectiveFrom`, sem datas duplicadas.
- `settings.defaultGoalMl` é igual ao `goalMl` da última entrada de `goalHistory`; se o histórico estiver vazio, é 2.000.
- Cada chave de `entriesByDay` é um `DayKey` válido.
- Cada entrada em `entriesByDay[day]` tem `entry.dayKey === day`.
- Não há IDs duplicados entre todos os dias.
- `entriesByDay` não contém arrays vazios; ao remover o último registro, a chave do dia é removida.

### DailySummary (Derivado)

Não é persistido. Calculado por `selectDailySummary(state, dayKey)`.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `dayKey` | `DayKey` | Dia representado |
| `totalMl` | `number` | Soma dos volumes do dia |
| `goalMl` | `number` | Meta vigente do dia, resolvida por `resolveGoalForDay` |
| `progressPercent` | `number` | `totalMl / goalMl * 100`; pode passar de 100; a UI limita a barra a 100% |
| `remainingMl` | `number` | `max(0, goalMl - totalMl)` |
| `excessMl` | `number` | `max(0, totalMl - goalMl)` |
| `goalMet` | `boolean` | `totalMl >= goalMl` |
| `entryCount` | `number` | Quantidade de registros do dia |

**Invariantes**:
- `remainingMl` e `excessMl` nunca são simultaneamente maiores que zero.
- `goalMet === (excessMl > 0 || totalMl === goalMl)`.

### WeeklySummary (Derivado)

Não é persistido. Calculado por `selectWeeklySummary(state, now)`.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `days` | `DailySummary[]` | Exatamente 7 dias, do mais antigo para o mais recente, incluindo hoje |
| `daysWithGoalMet` | `number` | Quantidade de dias em `days` com `goalMet === true` |

**Invariantes**:
- `days.length === 7`.
- O último item é o dia local de `now`; o primeiro é 6 dias antes.
- Dias sem registros aparecem com `totalMl = 0`, `remainingMl = goalMl`, `excessMl = 0` e `goalMet = false`.

## Relacionamentos

- `WaterState` 1:N `IntakeEntry` (via `entriesByDay`).
- `WaterState` 1:N `GoalChange` (via `goalHistory`).
- `DailySummary` é derivado de um `DayKey`, dos registros do dia e da meta resolvida para o dia.
- `WeeklySummary` é derivado de 7 `DailySummary`.

## Regras de validação

| Regra | Entrada | Limite | Erro |
|-------|---------|--------|------|
| Volume mínimo/máximo | Registro | 1 a 5.000 ml, inteiro | `INVALID_VOLUME` |
| Volume vazio/não numérico | Registro | — | `INVALID_VOLUME` |
| Meta mínima/máxima | Meta | 500 a 10.000 ml, inteiro | `INVALID_GOAL` |
| Meta vazia/não numérica | Meta | — | `INVALID_GOAL` |
| Registro inexistente | Edição/remoção | — | `ENTRY_NOT_FOUND` |
| Registro de outro dia | Edição/remoção | Somente o dia atual | `ENTRY_NOT_EDITABLE` |
| Documento corrompido | Carregamento | JSON/schema inválido | `STORAGE_CORRUPTED` |
| Falha de leitura/escrita | Persistência | — | `STORAGE_ERROR` |

## Transições de estado

### Inicialização

1. `load()` lê `@hidrate/state`.
2. Se não existir, retorna `createInitialState()` com `defaultGoalMl = 2000`, `goalHistory = []` e `entriesByDay = {}`.
3. Se existir e for válido, retorna o estado carregado.
4. Se existir e for inválido, copia o payload para `@hidrate/state:corrupt:<timestamp>`, retorna estado inicial e sinaliza `STORAGE_CORRUPTED`.
5. O controller calcula o dia local atual e deriva os sumários; nenhuma escrita de snapshot de meta é necessária.

### Adicionar registro

`addIntake(state, { volumeMl, now, id })`:
1. Valida `volumeMl`.
2. Cria `IntakeEntry` com `dayKey` e `localTime` derivados de `now` e `createdAt` do instante.
3. Insere no final de `entriesByDay[dayKey]` (ordem crescente de `createdAt`).
4. Retorna novo estado e a entrada criada; não persiste (o controller persiste via repositório).

### Editar registro

`editIntake(state, { entryId, volumeMl, now })`:
1. Valida `volumeMl`.
2. Localiza a entrada em `entriesByDay[dayKeyAtual]`.
3. Se não existir, retorna `ENTRY_NOT_FOUND`.
4. Se a entrada pertencer a outro dia, retorna `ENTRY_NOT_EDITABLE`.
5. Atualiza apenas `volumeMl`; `dayKey`, `createdAt` e `localTime` permanecem.
6. Retorna novo estado.

### Remover registro

`removeIntake(state, { entryId, now })`:
1. Localiza a entrada no dia atual.
2. Se não existir, retorna `ENTRY_NOT_FOUND`.
3. Se pertencer a outro dia, retorna `ENTRY_NOT_EDITABLE`.
4. Remove a entrada; se o array do dia ficar vazio, remove a chave.
5. Retorna novo estado.

### Alterar meta

`setDailyGoal(state, { goalMl, now })`:
1. Valida `goalMl`.
2. Calcula `today`.
3. Atualiza `settings.defaultGoalMl` para o novo valor.
4. Faz upsert de `{ effectiveFrom: today, goalMl }` em `goalHistory`; se já houver entrada para hoje, substitui o valor.
5. Mantém as entradas de `goalHistory` de dias anteriores inalteradas.
6. Retorna novo estado.

### Resolver a meta de um dia

`resolveGoalForDay(state, { dayKey })`:
1. Percorre `goalHistory` da entrada mais recente para a mais antiga.
2. Retorna o `goalMl` da primeira entrada com `effectiveFrom <= dayKey`.
3. Se não houver nenhuma, retorna 2.000 ml.
4. Não altera o estado.

**Invariante**: a meta resolvida para hoje é sempre `settings.defaultGoalMl`, pois o upsert de hoje é a entrada mais recente.

### Virada do dia

A virada não exige mutação no estado persistido:
1. O controller atualiza o `todayKey` ao montar, ao voltar do background e por timer até a próxima meia-noite local.
2. Novos registros passam a usar o novo `dayKey`.
3. O novo dia resolve a meta pela entrada mais recente de `goalHistory`, que é a meta atual.
4. Os sumários diário e semanal são recalculados; o dia anterior permanece intacto.
5. A operação é idempotente e não cria snapshots diários.

### Edição/exclusão após a virada

Um registro do dia anterior não aparece no histórico atual e não pode ser editado/removido pela UI. Se a operação for invocada mesmo assim, retorna `ENTRY_NOT_EDITABLE`, preservando o estado.

## Formato persistido (exemplo)

```json
{
  "schemaVersion": 1,
  "settings": {
    "defaultGoalMl": 2500
  },
  "goalHistory": [
    {
      "effectiveFrom": "2026-10-20",
      "goalMl": 2000
    },
    {
      "effectiveFrom": "2026-10-25",
      "goalMl": 2500
    }
  ],
  "entriesByDay": {
    "2026-10-24": [
      {
        "id": "a1b2c3d4-0000-4000-8000-000000000001",
        "dayKey": "2026-10-24",
        "createdAt": "2026-10-24T18:30:00.000Z",
        "localTime": "15:30",
        "volumeMl": 250
      }
    ],
    "2026-10-25": [
      {
        "id": "a1b2c3d4-0000-4000-8000-000000000002",
        "dayKey": "2026-10-25",
        "createdAt": "2026-10-25T11:05:00.000Z",
        "localTime": "08:05",
        "volumeMl": 500
      }
    ]
  }
}
```

## Migração e recuperação

- **Versão atual**: `schemaVersion = 1`.
- **Versão ausente ou inválida**: tratar como documento corrompido e aplicar o fluxo de backup + estado inicial.
- **Versão futura desconhecida**: não tentar interpretar; copiar para backup, retornar estado inicial e sinalizar `STORAGE_CORRUPTED` para o usuário.
- **Backup**: chave `@hidrate/state:corrupt:<timestamp>` com o payload bruto; nunca sobrescrever a chave principal sem antes salvar o backup.
- **Sem exclusão automática de dados históricos**: registros de dias anteriores são preservados; apenas a UI limita a consulta aos 7 dias.

## Dados de teste recomendados

- Dia sem registros.
- Dia com um registro de 1 ml e outro de 5.000 ml (limites).
- Dia com total exatamente igual à meta.
- Dia com total acima da meta.
- Meta alterada no meio do dia.
- Janela de 7 dias cruzando mudança de mês e ano.
- Registro às 23:59 e outro às 00:01 para validar a virada.
- Documento com JSON inválido, schemaVersion desconhecido e array vazio em `entriesByDay`.
