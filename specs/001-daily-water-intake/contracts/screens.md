# Contracts: Telas e Navegação

**Feature**: `001-daily-water-intake`
**Camada**: `src/app` (rotas) + `src/pages` (composição)

## Mapa de rotas

| Rota | Arquivo | Página | Tab |
|------|---------|--------|-----|
| `/` | `src/app/index.tsx` | `TodayPage` | Hoje |
| `/week` | `src/app/week.tsx` | `WeekPage` | Semana |
| `/goal` | `src/app/goal.tsx` | `GoalPage` | Meta |

- `src/app/_layout.tsx` monta o `HydrationProvider` e o navegador de tabs.
- Os arquivos de rota não contêm regra de negócio; apenas importam e renderizam a página correspondente.
- A rota `explore` existente será removida/substituída por `week`.
- A navegação usa `Link`/`router` do Expo Router; nenhuma navegação manual por estado global.

## Contrato do controller consumido pelas telas

As páginas consomem `useHydration()`:

```ts
interface HydrationController {
  status: 'loading' | 'ready' | 'error';
  state: WaterState | null;
  today: DailySummary | null;
  week: WeeklySummary | null;
  warning: AppError | null;
  isSaving: boolean;
  addIntake(volumeMl: number): Promise<boolean>;
  editIntake(entryId: string, volumeMl: number): Promise<boolean>;
  removeIntake(entryId: string): Promise<boolean>;
  setDailyGoal(goalMl: number): Promise<boolean>;
  retry(): Promise<void>;
  clearWarning(): void;
}
```

- As ações retornam `true` somente após o save bem-sucedido.
- Em caso de falha, o controller mantém o estado anterior, define `warning` e retorna `false`.
- Validações de formulário podem ser feitas na página para feedback imediato, mas o caso de uso é a fonte de verdade.
- Sumários já vêm calculados e memoizados; a página não soma volumes manualmente.

## Tela Hoje (`/`)

### Conteúdo

- Cabeçalho com a data local atual.
- Card de progresso com:
  - total consumido (formatado em ml ou L);
  - meta do dia (formatada);
  - percentual com barra limitada visualmente a 100%;
  - saldo restante quando abaixo da meta;
  - excedente quando acima da meta;
  - indicador textual e visual de meta atingida.
- Ações rápidas: botões de `200 ml`, `250 ml` e `500 ml`.
- Formulário de volume personalizado:
  - campo numérico em ml;
  - botão "Adicionar";
  - mensagem inline para valor inválido.
- Histórico do dia:
  - ordenado do mais recente para o mais antigo;
  - cada item mostra horário local e volume formatado;
  - ações "Editar" e "Remover" por item;
  - edição abre diálogo com o volume atual e ações "Salvar"/"Cancelar";
  - remoção pede confirmação em diálogo nativo.

### Estados

| Estado | Comportamento |
|--------|---------------|
| `loading` | Indicador de carregamento; ações desabilitadas |
| `ready` com registros | Card, ações e histórico preenchidos |
| `ready` sem registros | Total 0; histórico com estado vazio e chamada para adicionar |
| `saving` | Ação em andamento; evitar duplo toque; manter dados visíveis |
| `error` | Tela/mensagem de erro com "Tentar novamente" |
| `warning` | Banner não bloqueante de dados corrompidos ou falha de storage |
| Meta atingida | Indicador positivo; excedente exibido; barra limitada a 100% |

### Regras de interação

- Adicionar: valida inteiro de 1 a 5.000 ml; em sucesso, limpa o campo e atualiza o total.
- Editar: valida inteiro de 1 a 5.000 ml; em sucesso, atualiza o total e mantém o horário original.
- Remover: em sucesso, atualiza o total e remove o item.
- Nenhuma ação permite escolher data ou horário; o registro usa o instante atual.
- Não há edição/remoção de registros de outros dias nesta tela.
- Falha de persistência: exibir banner, preservar o estado anterior e permitir repetir a ação.

### Acessibilidade

- Card de progresso com rótulo: "Consumo de hoje: X de Y mililitros, Z por cento".
- Botões rápidos com rótulos explícitos: "Adicionar 200 mililitros".
- Ações de item com contexto: "Editar registro das 08:05", "Remover registro das 08:05".
- Indicador de meta atingida não depende apenas de cor; incluir texto.
- Alvos de toque de pelo menos 44×44 pontos.
- Campos com `accessibilityLabel`, mensagens de erro associadas e foco previsível.

**Cobre**: FR-001 a FR-007, FR-011 a FR-016, FR-019, FR-025 a FR-027.

## Tela Semana (`/week`)

### Conteúdo

- Título "Últimos 7 dias".
- Lista com exatamente 7 itens, do mais antigo para o mais recente, terminando hoje.
- Cada item mostra:
  - data local abreviada (ex.: "seg, 20/10");
  - total consumido formatado;
  - meta do dia formatada;
  - indicador textual "Meta atingida" ou "Meta não atingida".
- Dias sem registros aparecem com `0 ml` e "Meta não atingida".
- Nenhuma ação de adicionar, editar ou remover nesta tela.

### Estados

| Estado | Comportamento |
|--------|---------------|
| `loading` | Indicador de carregamento |
| `ready` | Sempre 7 itens; dias vazios com 0 ml |
| `error` | Mensagem com "Tentar novamente" |
| `warning` | Banner não bloqueante |

### Acessibilidade

- Cada item é lido como um conjunto: "segunda, 20 de outubro, 1.500 de 2.000 mililitros, meta não atingida".
- Indicador de meta inclui texto, não apenas cor.
- Lista com cabeçalho acessível e ordem de leitura cronológica.

**Cobre**: FR-021 a FR-025.

## Tela Meta (`/goal`)

### Conteúdo

- Título "Meta diária".
- Valor atual da meta formatado.
- Campo numérico em ml com o valor atual.
- Botão "Salvar meta".
- Texto auxiliar: "A nova meta vale para hoje e para os próximos dias. Dias anteriores não serão alterados."
- Feedback de sucesso após salvar.
- Erro inline para valor inválido (500 a 10.000 ml).

### Estados

| Estado | Comportamento |
|--------|---------------|
| `loading` | Indicador de carregamento |
| `ready` | Campo preenchido com a meta atual |
| `saving` | Botão desabilitado; manter valor visível |
| `error` | Mensagem com "Tentar novamente" |
| `warning` | Banner não bloqueante |
| Inválido | Mensagem inline; não chama o caso de uso |

**Cobre**: FR-008 a FR-010, FR-012, FR-023.

## Navegação e tabs

- Tabs: **Hoje**, **Semana**, **Meta**.
- iOS/Android: tabs nativas existentes, com ícones adequados (`house.fill`, `chart.bar.fill`, `target` ou equivalentes do `expo-symbols`).
- Web: atualizar `app-tabs.web.tsx` para as mesmas três rotas e rótulos.
- A tab ativa deve ser visualmente distinta e acessível por teclado/leitor de tela.
- Deep links diretos para `/`, `/week` e `/goal` devem funcionar.
- Não criar rotas para telas de edição; a edição ocorre em diálogo na tela Hoje.

## Tratamento de erros e registros obsoletos

- `INVALID_VOLUME` e `INVALID_GOAL`: mensagem inline; preservar o valor anterior; não chamar persistência.
- `ENTRY_NOT_FOUND` ao editar/remover: atualizar a lista com o estado atual e não exibir erro (o registro já não existe).
- `ENTRY_NOT_EDITABLE`: atualizar a lista e mostrar aviso não bloqueante de que o registro não pertence mais ao dia atual.
- `STORAGE_CORRUPTED`: banner não bloqueante; o estado inicial já está carregado e o backup foi criado.
- `STORAGE_ERROR`: banner com "Tentar novamente"; manter o último estado confirmado e não perder a entrada digitada quando possível.

## Formatação

- `formatVolume(ml)`:
  - `< 1000`: `"<n> ml"`;
  - `>= 1000`: `"<n>,<d> L"` em pt-BR (uma casa decimal).
- `formatPercent(value)`: inteiro arredondado para exibição; barra limitada a 100%.
- `formatDate(dayKey)`: data local abreviada em pt-BR.
- `formatTime(localTime)`: `HH:mm`.

## Matriz de aceitação visual

| Cenário | Resultado |
|---------|-----------|
| Sem registros | Hoje mostra 0 ml, saldo igual à meta, estado vazio no histórico |
| Um registro de 250 ml | Total 250 ml, saldo meta−250, histórico com um item |
| Vários registros | Total soma; itens do mais recente ao mais antigo |
| Meta atingida exatamente | Indicador de meta; sem excedente |
| Meta excedida | Indicador de meta; excedente exibido; barra em 100% |
| Editar volume | Total recalculado; horário original preservado |
| Remover registro | Total recalculado; item removido; estado vazio se era o último |
| Virada do dia | Hoje começa com 0 ml e meta padrão; dia anterior intacto na semana |
| Semana | 7 itens, incluindo dias vazios, ordem cronológica |
| Meta alterada | Hoje e próximos dias usam a nova meta; dias anteriores mantêm a antiga |
| Valor inválido | Mensagem inline; nenhuma escrita |
| Storage corrompido | Estado inicial com banner e backup criado |

**Cobre**: SC-001 a SC-012.
