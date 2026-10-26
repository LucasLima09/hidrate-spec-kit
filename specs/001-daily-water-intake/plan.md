# Implementation Plan: Controle Diário de Consumo de Água

**Branch**: `001-daily-water-intake` | **Date**: 2026-10-25 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/001-daily-water-intake/spec.md`

## Summary

Construir um app mobile offline-first, inteiramente em React Native com Expo SDK 58, para registrar o consumo diário de água, acompanhar a meta, editar/remover registros do dia e consultar um resumo dos últimos 7 dias. A persistência será local com AsyncStorage em um único documento JSON versionado. A arquitetura será em camadas, com rotas finas no Expo Router e pastas dedicadas para `pages`, `usecases`, `controllers`, `storage`, `domain` e `utils`. O estado da aplicação será mantido por React Context + `useReducer`, com casos de uso puros, testáveis e independentes da camada de persistência.

## Technical Context

**Language/Version**: TypeScript ~6.0.3, React 19.3.0, React Native 0.88.0, Expo SDK 58 (~58.0.19); Node.js >= 22.13.x (requisito do Expo SDK 58)

**Primary Dependencies**: `expo-router` ~58.0.26, `@react-native-async-storage/async-storage` (instalado via `npx expo install`), `react-native-safe-area-context`, `react-native-gesture-handler`, `react-native-reanimated`, `expo-symbols` (ícones). Sem biblioteca externa de estado ou de UI.

**Storage**: `@react-native-async-storage/async-storage`, armazenamento chave-valor local, não criptografado, disponível no Expo Go. Um único documento JSON versionado em `@hidrate/state`, com chave de backup em caso de dados corrompidos. Sumários diário e semanal são derivados em memória, não persistidos.

**Testing**: Jest 30 com preset `jest-expo`, `@testing-library/react-native` >= 14 e `expo-router/testing-library` para testes de integração de rotas. Testes unitários para casos de uso, utilitários e repositório; testes de integração para provider e telas. Mock oficial do AsyncStorage para Jest.

**Target Platform**: iOS 16.4+ e Android 7+ (mínimos do Expo SDK 58), mobile-first. O projeto continua compatível com web por usar React Native Web, mas web não é um gate de entrega desta versão.

**Project Type**: mobile-app (projeto único)

**Performance Goals**: Inclusão, edição e remoção refletidas na interface em até 1 segundo (SC-002/SC-012); tela principal abrindo em até 2 segundos após 30 dias de uso (SC-007); lista de histórico fluida com dezenas de registros por dia.

**Constraints**: Funcionar 100% offline; sem login, rede ou sincronização; volumes canônicos em mililitros inteiros; intervalo de 1 a 5.000 ml por registro e 500 a 10.000 ml por meta; dia definido pelo fuso local do dispositivo; escrita local consistente e serializada; sem módulos nativos que exijam development build além do AsyncStorage, que já está disponível no Expo Go.

**Scale/Scope**: Um usuário e um dispositivo; retenção de pelo menos 30 dias de registros; poucos registros por dia; 3 telas principais (Hoje, Semana, Meta); 4 histórias de usuário e 27 requisitos funcionais.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- O arquivo `.specify/memory/constitution.md` contém apenas o template não ratificado, com placeholders. Não há princípios ou gates específicos do projeto em vigor.
- Nenhuma violação constitucional aplicável. O plano segue as regras de `AGENTS.md`: Expo Router, `npx expo install` para dependências, documentação versionada do Expo SDK 58 e execução de lint/typecheck antes da conclusão.
- Pós-design: a constituição não mudou; nenhuma nova violação foi identificada. A seção de Complexidade não precisa ser preenchida.

## Project Structure

### Documentation (this feature)

```text
specs/001-daily-water-intake/
├── plan.md              # Este arquivo
├── research.md          # Fase 0: decisões técnicas e alternativas
├── data-model.md        # Fase 1: entidades, validações e transições
├── quickstart.md        # Fase 1: guia de validação manual e comandos
├── contracts/           # Fase 1: contratos de casos de uso, storage e telas
│   ├── use-cases.md
│   ├── storage.md
│   └── screens.md
├── checklists/
│   └── requirements.md  # Checklist da especificação
├── spec.md              # Especificação funcional
└── tasks.md             # Fase 2: criado por /speckit.tasks, não por este comando
```

### Source Code (repository root)

```text
src/
├── app/                              # Rotas Expo Router: arquivos finos, sem regra de negócio
│   ├── _layout.tsx                   # Tabs e providers globais
│   ├── index.tsx                     # Rota "/" -> TodayPage
│   ├── week.tsx                      # Rota "/week" -> WeekPage
│   └── goal.tsx                      # Rota "/goal" -> GoalPage
├── pages/                            # Telas e composição de UI
│   ├── today/
│   │   └── today-page.tsx
│   ├── week/
│   │   └── week-page.tsx
│   └── goal/
│       └── goal-page.tsx
├── components/                       # Componentes reutilizáveis e apresentacionais
│   ├── progress-card.tsx
│   ├── quick-add-row.tsx
│   ├── intake-form.tsx
│   ├── intake-history-list.tsx
│   ├── intake-edit-dialog.tsx
│   ├── weekly-summary-list.tsx
│   ├── form-field.tsx
│   ├── error-banner.tsx
│   └── empty-state.tsx
├── controllers/                      # Orquestração React: estado, efeitos e ações
│   ├── hydration-provider.tsx
│   └── use-hydration.ts
├── usecases/                         # Regras puras, sem React e sem AsyncStorage
│   ├── add-intake.ts
│   ├── edit-intake.ts
│   ├── remove-intake.ts
│   ├── set-daily-goal.ts
│   ├── resolve-goal-for-day.ts
│   ├── select-daily-summary.ts
│   ├── select-weekly-summary.ts
│   └── types.ts
├── domain/                           # Entidades, erros e tipos do domínio
│   ├── entities.ts
│   └── errors.ts
├── storage/                          # Persistência local e serialização
│   ├── repository.ts                 # Interface do repositório
│   ├── async-storage-repository.ts   # Implementação com AsyncStorage
│   ├── schema.ts                     # Schema versionado e validação
│   └── serializer.ts                 # Parse/serialize do documento
├── utils/                            # Funções puras e reutilizáveis
│   ├── date.ts                       # DayKey local, janela de 7 dias, horário
│   ├── volume.ts                     # Formatação ml/L e percentual
│   ├── validation.ts                 # Validação de entrada e normalização
│   └── id.ts                         # Geração de IDs únicos
├── constants/                        # Constantes de domínio e tema
│   ├── hydration.ts                  # Limites, meta padrão, quick adds
│   └── theme.ts                      # Já existente
├── hooks/                            # Hooks genéricos existentes
│   ├── use-color-scheme.ts
│   └── use-theme.ts
└── global.css                        # Já existente

__tests__/                            # Testes fora de src/app (regra do Expo Router)
├── usecases/
├── storage/
├── utils/
├── controllers/
└── router/
```

**Structure Decision**: Projeto único mobile-first. O Expo Router exige que as rotas fiquem em `src/app`, então esses arquivos apenas renderizam as páginas de `src/pages` e permanecem sem regra de negócio. A separação em camadas atende ao pedido de `pages`, `usecase`, `controller` e `utils`, com `storage`, `domain` e `components` adicionados por necessidade. Os testes ficam em `__tests__` na raiz, nunca dentro de `src/app`. As pastas `ios/` e `android/` continuam ausentes e são geradas por Continuous Native Generation; nenhuma alteração nativa manual será feita.

## Architecture Decisions

- **Fluxo em camadas**: `page` → `controller hook` → `usecase` → `repository` → AsyncStorage. Componentes em `src/components` recebem dados e callbacks por props; não acessam storage.
- **Casos de uso puros**: recebem o estado atual, a entrada e um `clock`/`id` injetáveis; retornam um novo estado ou um erro de domínio. Não importam React nem AsyncStorage, o que permite testes determinísticos.
- **Controller**: `HydrationProvider` + `useHydration` mantém o estado carregado, expõe sumários derivados e ações assíncronas. Uma fila serializada no provider/repositório evita perda de escrita em toques rápidos.
- **Persistência**: um único documento JSON versionado reduz o risco de inconsistência entre meta e registros. O repositório valida o schema, faz backup de payload corrompido e serializa escritas.
- **Tempo**: chaves de dia no formato `YYYY-MM-DD` calculadas com os getters locais de `Date`; nunca `toISOString()` para definir o dia. Cada registro guarda `dayKey`, `createdAt` (instante absoluto) e `localTime` (HH:mm) para preservar a exibição mesmo se o fuso mudar.
- **Metas históricas**: `defaultGoalMl` é a meta atual; `goalHistory` registra a data de vigência de cada mudança. A meta de qualquer dia é resolvida pela última mudança com `effectiveFrom <= dayKey`, o que preserva dias anteriores mesmo quando o app não foi aberto.
- **Estado**: React Context + `useReducer`, sem Zustand/Redux. Ações são processadas em sequência; a UI mostra estado de carregamento/salvamento e um banner de erro quando a persistência falha.
- **Separação de responsabilidades**: `utils` para formatação/validação/geradores; `domain` para entidades e erros; `constants` para limites e valores padrão; `pages` para layout e composição.

## Data & Persistence Summary

- Documento persistido: `WaterState` com `schemaVersion`, `settings.defaultGoalMl`, `goalHistory` e `entriesByDay`.
- Entrada: `IntakeEntry` com `id`, `dayKey`, `createdAt`, `localTime` e `volumeMl`.
- Sumários não são persistidos: `DailySummary` e `WeeklySummary` são calculados por selectors puros a partir do estado.
- Chave principal: `@hidrate/state`. Em caso de JSON inválido, o payload original é copiado para `@hidrate/state:corrupt:<timestamp>` antes de reinicializar o estado vazio com aviso não bloqueante.
- Migrações futuras usam `schemaVersion`; a versão 1 é a inicial. Nenhuma migração é necessária nesta entrega.
- Detalhes completos em [data-model.md](./data-model.md) e [contracts/storage.md](./contracts/storage.md).

## Interfaces Summary

- **Casos de uso**: `addIntake`, `editIntake`, `removeIntake`, `setDailyGoal`, `resolveGoalForDay`, `selectDailySummary` e `selectWeeklySummary`. Contrato em [contracts/use-cases.md](./contracts/use-cases.md).
- **Repositório**: `load()`, `save(state)` e `backupCorrupt(raw)`. Contrato e schema em [contracts/storage.md](./contracts/storage.md).
- **Telas**: `/` (Hoje), `/week` (Semana) e `/goal` (Meta), com estados de carregamento, vazio, erro e validação. Contrato em [contracts/screens.md](./contracts/screens.md).

## UI / Navigation Plan

- **Hoje (`/`)**: card de progresso com total, meta, percentual, saldo restante ou excedente; opções rápidas de 200/250/500 ml; formulário de volume personalizado; histórico do dia em ordem decrescente; ações de editar volume e remover.
- **Semana (`/week`)**: lista dos últimos 7 dias, do mais antigo para o mais recente, com data, total, meta e indicador de meta atingida; dias sem registros exibidos com 0 ml e meta não atingida.
- **Meta (`/goal`)**: valor atual, campo em ml, validação de 500 a 10.000 ml, salvamento e aviso de que a nova meta vale para hoje e dias seguintes.
- **Navegação**: tabs nativas (iOS/Android) e tabs web existentes serão ajustadas para Hoje, Semana e Meta. As rotas `src/app/*` delegam para `src/pages/*`. A rota `explore` será substituída pela rota `week`.
- **Estados**: carregando na hidratação inicial; vazio no histórico e em dias sem registros; salvando durante operações; erro com mensagem e ação de tentar novamente; validação inline nos formulários.
- **Acessibilidade**: rótulos acessíveis em botões, campos e progresso; alvos de toque de no mínimo 44×44; suporte a fonte maior sem quebra de layout; não depender apenas de cor para indicar meta atingida; foco e ordem de leitura coerentes.
- **Tema**: reutilizar `ThemedText`, `ThemedView`, `Colors`, `Spacing` e os hooks de tema existentes.

## Testing Plan

- **Unitários de casos de uso**: inclusão válida/inválida, edição, remoção, meta padrão, histórico de metas e dias pulados, virada de dia, soma e percentual, janela de 7 dias, edição/remoção de registro de outro dia deve falhar.
- **Unitários de utilitários**: `dayKey` local em fusos diferentes e em horários próximos da meia-noite, janela de 7 dias, formatação ml/L e percentual, parsing de inteiros.
- **Storage**: carregamento vazio, round-trip save/load, schema inválido com backup, escrita serializada e falha de escrita.
- **Integração**: renderizar Hoje com provider, adicionar/editar/remover e conferir total e progresso; definir meta e conferir recálculo; abrir Semana e conferir 7 dias; persistir após remontar o provider; simular virada do dia com clock falso; validar mensagens de erro.
- **Router**: usar `renderRouter` de `expo-router/testing-library` para conferir navegação entre Hoje, Semana e Meta.
- **Comandos após configurar a suíte**: `npm test`, `npm run lint`, `npx tsc --noEmit`. O guia manual está em [quickstart.md](./quickstart.md).

## Performance & Reliability

- Selectors memoizados no controller para total, progresso e resumo semanal; cálculos O(n) sobre os registros do dia.
- `FlatList` para o histórico do dia, com `keyExtractor` por `id`; a semana tem apenas 7 itens.
- Persistência em documento único com fila de escrita sequencial; UI só confirma a operação após o save bem-sucedido, garantindo SC-004 e SC-012.
- Detecção de virada do dia ao montar, ao voltar do background (`AppState`) e por timer até a próxima meia-noite local; o resumo semanal é recalculado ao focar a tela.
- Falhas de leitura/escrita exibem banner e preservam o estado anterior; dados corrompidos são copiados para backup antes de qualquer reinicialização.

## Implementation Sequence

1. **Fundação**: instalar AsyncStorage e dependências de teste; criar constantes, tipos de domínio, erros, utilitários de data/volume/validação/ID.
2. **Persistência**: schema, serializer, interface do repositório e implementação AsyncStorage com fila de escrita e backup de corrupção.
3. **Regras de negócio**: casos de uso e selectors puros, com testes unitários e clock/ID injetáveis.
4. **Controller**: provider, reducer, hidratação, ações serializadas, tratamento de erros e ciclo de vida do dia.
5. **UI e navegação**: componentes, páginas Hoje/Semana/Meta, rotas Expo Router e tabs nativas/web.
6. **Acabamento**: acessibilidade, estados vazios/erro/carregamento, performance, testes de integração e validação com lint/typecheck/testes.

## Risks & Trade-offs

- **AsyncStorage não criptografado**: adequado a dados de consumo de água de baixa sensibilidade e uso local; não armazenar credenciais nem dados pessoais sensíveis.
- **Documento único**: simplifica consistência, mas exige fila de escrita; o volume de dados esperado (30+ dias) é pequeno para o limite do AsyncStorage.
- **Fuso horário**: guardar `dayKey` e `localTime` no momento do registro evita que uma mudança de fuso mova registros entre dias, ao custo de alguns campos redundantes.
- **Sem lembretes/notificações**: fora do escopo desta versão, conforme a especificação.
- **Testes de meia-noite**: dependem de clock injetável e timers falsos; por isso os casos de uso não leem `Date` diretamente.
- **Web**: mantido compatível por usar React Native Web e Expo Router, mas sem esforço extra de QA nesta entrega.

## Complexity Tracking

Nenhuma violação da constituição ou da arquitetura foi identificada. Não há complexidade adicional a justificar.
