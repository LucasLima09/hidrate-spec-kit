# Contracts: Persistência

**Feature**: `001-daily-water-intake`
**Camada**: `src/storage`
**Tecnologia**: `@react-native-async-storage/async-storage`

## Chaves

| Chave | Conteúdo | Observação |
|-------|----------|------------|
| `@hidrate/state` | Documento JSON de `WaterState` | Chave principal, uma por dispositivo |
| `@hidrate/state:corrupt:<epochMs>` | Payload bruto corrompido | Criada apenas na recuperação; nunca sobrescreve a principal antes do backup |

## Interface do repositório

```ts
interface WaterRepository {
  load(): Promise<Result<LoadResult>>;
  save(state: WaterState): Promise<Result<void>>;
  backupCorrupt(raw: string, timestampMs: number): Promise<Result<void>>;
}

interface LoadResult {
  state: WaterState;
  warning: AppError | null;
}
```

- `load` nunca lança para o chamador; falhas são convertidas em `Result`.
- `save` resolve somente depois que o `setItem` terminou.
- `backupCorrupt` é usado internamente pelo `load`, mas é exposto para testes e recuperação manual.
- `Warning` usa os códigos `STORAGE_CORRUPTED` ou `STORAGE_ERROR`; a UI exibe um banner não bloqueante.

## Serialização

```ts
function serialize(state: WaterState): string;
function deserialize(raw: string): Result<WaterState>;
```

- `serialize` usa `JSON.stringify` sobre o estado já validado.
- `deserialize` faz `JSON.parse`, valida o schema e normaliza o estado.
- Campos desconhecidos no nível raiz são ignorados para permitir evolução aditiva.
- Campos desconhecidos dentro de entradas são descartados na normalização.
- A ordem dos registros é normalizada para crescente por `createdAt`; em empate, mantém a ordem do array.

## Validação do schema

O documento é considerado válido somente se:

- É um objeto não nulo e não é array.
- `schemaVersion === 1`.
- `settings` é objeto com `defaultGoalMl` inteiro entre 500 e 10.000.
- `goalHistory` é array; cada item tem `effectiveFrom` no formato `^\d{4}-\d{2}-\d{2}$` e `goalMl` inteiro entre 500 e 10.000.
- `goalHistory` está ordenado crescentemente por `effectiveFrom` e não contém datas duplicadas.
- `settings.defaultGoalMl` é igual ao `goalMl` da última entrada de `goalHistory`; se o array estiver vazio, é 2.000.
- `entriesByDay` é objeto; cada chave segue `^\d{4}-\d{2}-\d{2}$`.
- Cada valor de `entriesByDay` é array; cada item tem:
  - `id`: string não vazia;
  - `dayKey`: igual à chave do dia;
  - `createdAt`: string ISO 8601 parseável por `Date`;
  - `localTime`: `HH:mm` entre `00:00` e `23:59`;
  - `volumeMl`: inteiro entre 1 e 5.000.
- Todos os `id` são únicos no documento.
- Arrays vazios são normalizados pela remoção da chave correspondente.
- `goalHistory` pode estar vazio; nesse caso, a meta resolvida para qualquer dia é 2.000 ml.
- O dia atual não exige escrita de meta; a meta é resolvida por `resolveGoalForDay`.

## Fluxo de `load`

1. `getItem('@hidrate/state')`.
2. Se `null`, retornar `{ state: createInitialState(), warning: null }`.
3. Se a leitura falhar, retornar `{ ok: false, error: STORAGE_ERROR }`.
4. Fazer `deserialize(raw)`.
5. Se válido, retornar `{ state, warning: null }`.
6. Se inválido:
   1. Chamar `backupCorrupt(raw, Date.now())`.
   2. Se o backup funcionar, retornar estado inicial com `warning: STORAGE_CORRUPTED`.
   3. Se o backup falhar, retornar estado inicial com `warning: STORAGE_ERROR` e a mensagem indicando que o backup não pôde ser criado.
   4. Nunca sobrescrever a chave principal durante o carregamento.
7. O controller calcula o dia atual, resolve a meta por `goalHistory` e libera a UI; nenhuma escrita é necessária na virada do dia.

## Fluxo de `save`

1. Validar o estado com as mesmas regras do schema.
2. Se inválido, retornar `{ ok: false, error: STORAGE_ERROR }` com mensagem "Estado inválido"; não escrever nada.
3. Enfileirar a operação em uma fila FIFO interna.
4. Executar `setItem('@hidrate/state', serialize(state))`.
5. Se funcionar, retornar `{ ok: true, value: undefined }`.
6. Se falhar, retornar `{ ok: false, error: STORAGE_ERROR }`.
7. A fila garante que duas chamadas concorrentes não intercalem leitura/escrita; a última chamada enfileirada representa o estado final.

## Garantias

- **Atomicidade lógica**: todo o estado do app vive em uma única chave; uma escrita bem-sucedida representa um snapshot completo e consistente.
- **Ordem**: saves concorrentes são serializados na ordem de chamada.
- **Sem perda silenciosa**: dados inválidos são copiados para backup antes de qualquer reinicialização.
- **Sem bloqueio**: falhas de storage não travam a UI; o controller mantém o último estado confirmado e oferece nova tentativa.
- **Sem dados derivados persistidos**: `DailySummary` e `WeeklySummary` são recalculados; não há risco de divergência.
- **Privacidade**: o AsyncStorage não é criptografado; não armazenar credenciais nem dados pessoais sensíveis.

## Tratamento de erros

| Situação | Código | UI |
|----------|--------|----|
| Nenhum dado salvo | — | Estado inicial; sem aviso |
| JSON inválido | `STORAGE_CORRUPTED` | Banner: dados anteriores não puderam ser lidos; backup criado |
| Schema/versão inválidos | `STORAGE_CORRUPTED` | Mesmo banner; estado inicial |
| Backup falhou | `STORAGE_ERROR` | Banner: falha ao preservar dados antigos; permitir retry |
| Leitura falhou | `STORAGE_ERROR` | Tela de erro com "Tentar novamente" |
| Escrita falhou | `STORAGE_ERROR` | Banner; manter estado anterior; permitir retry |
| Estado inválido antes de salvar | `STORAGE_ERROR` | Banner; erro de programação, não apagar dados |

## Testes obrigatórios

- `load` com chave ausente retorna estado inicial e sem warning.
- `load` com documento válido faz round-trip fiel.
- `load` com JSON inválido cria backup e retorna estado inicial com `STORAGE_CORRUPTED`.
- `load` com `schemaVersion` desconhecido segue o mesmo fluxo de corrupção.
- `load` com volume fora do intervalo, `dayKey` divergente, `localTime` inválido ou ID duplicado é corrompido.
- `load` com `goalHistory` fora de ordem, com datas duplicadas ou `defaultGoalMl` divergente da última entrada é corrompido.
- `load` normaliza arrays vazios e ordena registros.
- `save` válido grava exatamente o JSON serializado.
- `save` inválido não chama `setItem`.
- `save` com falha do AsyncStorage retorna `STORAGE_ERROR` e não altera o estado em memória.
- Saves concorrentes são executados em série e o último estado prevalece.
- O mock oficial do AsyncStorage é limpo entre testes.

**Cobre**: FR-017, FR-018, FR-019, FR-020, SC-004, SC-011, SC-012.
