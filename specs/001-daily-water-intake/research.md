# Research: Controle Diário de Consumo de Água

**Feature**: `001-daily-water-intake`
**Date**: 2026-10-25
**Status**: Completo — nenhuma pendência de `NEEDS CLARIFICATION`

## Objetivo

Resolver as decisões técnicas necessárias para implementar a especificação com React Native, Expo SDK 58, AsyncStorage e arquitetura em camadas, sem alterar o comportamento funcional já aprovado.

## Decisões

### 1. Runtime e plataforma

**Decision**: Usar o projeto React Native existente com Expo SDK 58 (`expo ~58.0.19`, React Native 0.88, React 19.3 e TypeScript 6 em modo strict). A entrega é mobile-first para iOS 16.4+ e Android 7+, mantendo compatibilidade incidental com web via React Native Web.

**Rationale**: O projeto já está configurado com Expo Router, TypeScript, tema e estrutura de rotas. O Expo SDK 58 é a versão instalada e define React Native 0.88, React 19.3 e mínimos de sistema. Usar Expo não contradiz o pedido de "inteiramente com React Native": Expo é a toolchain e o conjunto de módulos que suportam o app React Native.

**Alternatives considered**:
- Recriar o projeto em React Native CLI puro: descartado, pois exigiria manutenção de pastas nativas e perderia a configuração existente sem benefício.
- Implementar apenas para web: descartado; o produto é um app mobile.

**Sources**:
- https://docs.expo.dev/versions/v58.0.0/
- https://expo.dev/changelog/sdk-58

### 2. Persistência local

**Decision**: Usar `@react-native-async-storage/async-storage`, instalado com `npx expo install @react-native-async-storage/async-storage`, em um único documento JSON versionado na chave `@hidrate/state`.

**Rationale**: Atende ao requisito explícito de AsyncStorage, funciona no Expo Go e é suficiente para o volume do app (um usuário, 30+ dias, poucos registros por dia). Um documento único mantém meta, histórico de metas e registros consistentes em uma única escrita atômica por chave. AsyncStorage é assíncrono, persistente, não criptografado e key-value.

**Alternatives considered**:
- `expo-sqlite`: mais robusto para consultas e grandes volumes, mas adiciona schema SQL, migrações e complexidade desnecessários para o escopo.
- MMKV: rápido, mas exige configuração nativa adicional e não é o requisito do usuário.
- Múltiplas chaves (uma por dia, meta separada): aumentaria o risco de estados parciais e exigiria coordenação entre escritas; o documento único é mais simples e seguro para este volume.
- Armazenamento criptografado/SecureStore: os dados não são credenciais e o requisito é local e offline; pode ser reavaliado se o escopo incluir dados sensíveis.

**Sources**:
- https://docs.expo.dev/versions/v58.0.0/sdk/async-storage/

### 3. Formato do documento persistido

**Decision**: Persistir `WaterState` com `schemaVersion: 1`, `settings.defaultGoalMl`, `goalHistory` e `entriesByDay`. Sumários diário e semanal são derivados em memória.

**Rationale**: `goalHistory` preserva a meta ativa de cada dia, conforme a clarificação aprovada, e permite montar o resumo semanal sem recalcular o passado. `entriesByDay` indexa registros por dia local e torna a leitura do dia e da janela de 7 dias simples e eficiente. Derivar sumários evita dados duplicados e divergentes.

**Alternatives considered**:
- Persistir apenas uma lista plana de registros e a meta atual: exigiria recalcular metas históricas e não cumpriria a preservação da meta por dia.
- Persistir sumários junto com os registros: aumentaria o risco de inconsistência.
- Guardar a meta em cada registro: redundante e sujeito a divergência quando a meta muda.

### 4. Modelo de meta histórica

**Decision**: Manter `defaultGoalMl` como meta atual e `goalHistory` como lista ordenada de `{ effectiveFrom, goalMl }`. Resolver a meta de um dia pela última entrada com `effectiveFrom <= dayKey`; se não houver, usar 2.000 ml. Ao alterar a meta, atualizar o padrão e fazer upsert da entrada de hoje.

**Rationale**: Cumpre FR-023 e a decisão de clarificação: a meta é preservada por dia e alterações não recalculam o passado. Diferentemente de snapshots apenas nos dias abertos, o histórico por vigência resolve corretamente dias em que o app não foi aberto, sem gravar um snapshot por dia. O upsert evita duplicatas quando a meta muda várias vezes no mesmo dia.

**Alternatives considered**:
- Snapshot em `goalsByDay` criado apenas quando o app abre: falha em dias pulados, que usariam a meta atual em vez da meta vigente na época.
- Recalcular todos os dias com a meta atual: viola a decisão de não reescrever o passado.
- Metas por dia da semana: fora do escopo.
- Guardar a meta em cada registro: não resolve dias sem registros no resumo semanal.

### 5. Representação de data e hora

**Decision**: Calcular `dayKey` local no formato `YYYY-MM-DD` usando `getFullYear`, `getMonth` e `getDate`. Cada registro guarda `dayKey`, `createdAt` em ISO (instante absoluto) e `localTime` em `HH:mm` no momento da criação. A janela semanal é calculada com aritmética de datas locais, criando cada dia ao meio-dia para evitar ambiguidades de horário de verão.

**Rationale**: O dia é definido pelo fuso local (FR-016). `toISOString()` usa UTC e pode atribuir um registro ao dia errado perto da meia-noite. Guardar `dayKey` e `localTime` garante que uma mudança posterior de fuso não mova nem altere o horário exibido do registro.

**Alternatives considered**:
- Usar apenas `toISOString()` e converter na leitura: frágil na virada do dia e em mudanças de fuso.
- Usar uma biblioteca de datas: desnecessária para poucas operações; evita dependência adicional.
- Guardar timestamp local sem offset: ambíguo em fusos com horário de verão; o par `createdAt` + `dayKey` + `localTime` é mais explícito.

### 6. Arquitetura em camadas

**Decision**: Adotar `src/app` (rotas finas) → `src/pages` (composição de tela) → `src/controllers` (React/estado) → `src/usecases` (regras puras) → `src/storage` (AsyncStorage), com `src/domain`, `src/components`, `src/utils` e `src/constants` de apoio.

**Rationale**: Atende ao pedido de pastas separadas (`pages`, `usecase`, `controller`, `utils`) sem violar a exigência do Expo Router de manter rotas em `src/app`. Casos de uso puros são fáceis de testar e não dependem de React ou storage. Componentes permanecem apresentacionais.

**Alternatives considered**:
- Colocar tudo em `src/app`: mistura roteamento, UI e regra de negócio, dificultando testes.
- Arquitetura feature-first (`features/water/...`): também viável, mas o usuário pediu separação por camadas.
- MVC clássico: o controller React já cumpre o papel de orquestração; adicionar uma camada MVC extra seria redundante.

### 7. Estado e controller

**Decision**: Usar React Context + `useReducer` no `HydrationProvider`, com ações assíncronas expostas por `useHydration`. As operações são serializadas e a UI só confirma a mudança após o save no repositório.

**Rationale**: O app tem um único domínio e um estado pequeno; Context + reducer evita dependências externas. A fila de operações protege contra perda de dados em toques rápidos. Save-before-commit garante que o que aparece na tela está persistido (SC-004).

**Alternatives considered**:
- Zustand/Redux: poderiam funcionar, mas adicionam dependência e boilerplate sem necessidade.
- Estado local em cada tela: as três telas compartilham o mesmo estado; duplicaria hidratação e poderia divergir.
- Atualização otimista com rollback: mais fluida em teoria, mas complexa com operações concorrentes e rollback de múltiplas ações; o AsyncStorage local é rápido o suficiente.

### 8. Identificadores

**Decision**: Gerar IDs únicos no cliente com `crypto.randomUUID()` quando disponível e fallback para `timestamp + random` em ambientes sem a API. O gerador é injetável nos casos de uso.

**Rationale**: Evita colisões em registros criados em sequência e mantém os casos de uso determinísticos nos testes.

**Alternatives considered**:
- Usar apenas índice da lista: instável após remoções.
- Usar UUID de biblioteca externa: dependência desnecessária para uma função simples.

### 9. Validação e unidades

**Decision**: Armazenar volumes como inteiros em mililitros. Aceitar registros de 1 a 5.000 ml e metas de 500 a 10.000 ml. A entrada aceita apenas dígitos inteiros; a exibição converte para litros com uma casa decimal a partir de 1.000 ml. Centralizar limites em `src/constants/hydration.ts`.

**Rationale**: Mililitros inteiros simplificam soma, comparação e persistência; a conversão para litros é apenas de apresentação (FR-014). Os limites vêm da especificação e ficam em um único lugar.

**Alternatives considered**:
- Permitir decimais em ml: adiciona complexidade de arredondamento e não é necessário para o caso de uso.
- Entrada em litros: descartada na clarificação; a entrada é em ml.
- Usar ponto flutuante para armazenar litros: risco de erros de arredondamento na soma.

### 10. Testes

**Decision**: Jest 30 + `jest-expo` + `@testing-library/react-native` >= 14 + `expo-router/testing-library`. Testes unitários para `usecases`, `utils` e `storage`; integração para provider e rotas. Usar o mock oficial do AsyncStorage e clock/ID injetáveis.

**Rationale**: É o caminho documentado para Expo SDK 58. `jest-expo` lida com mocks de módulos nativos, e `expo-router/testing-library` permite testar navegação. Testes de casos de uso puros cobrem a lógica crítica sem depender de UI.

**Alternatives considered**:
- Vitest: não é o padrão do Expo e exigiria configuração extra de React Native.
- Apenas testes manuais: insuficiente para validar regras de meta, virada de dia e persistência.
- Testes E2E com Maestro: úteis no futuro, mas fora do escopo desta entrega.

**Sources**:
- https://docs.expo.dev/develop/unit-testing.md
- https://docs.expo.dev/router/reference/testing.md

### 11. UI e navegação

**Decision**: Reutilizar os componentes de tema existentes e Expo Router com três rotas: Hoje (`/`), Semana (`/week`) e Meta (`/goal`). Usar tabs nativas no iOS/Android e a implementação web existente, ambas ajustadas para as três rotas. Usar `FlatList` no histórico e componentes nativos do React Native; sem biblioteca de UI adicional.

**Rationale**: Menor custo de manutenção, consistência com o projeto e compatibilidade com Expo Go. As três telas cobrem as histórias P1–P4 sem criar rotas desnecessárias. A edição de volume pode ser feita em diálogo/modal nativo do React Native.

**Alternatives considered**:
- Adicionar uma biblioteca de UI: não necessária para o escopo e aumentaria o bundle.
- Uma única tela com tudo: dificultaria a leitura e a navegação; a separação em três rotas é simples.
- Drawer/Stack em vez de tabs: tabs dão acesso direto às três áreas principais.

### 12. Tratamento de dados corrompidos e falhas

**Decision**: Validar o documento ao carregar. Se o JSON for inválido ou o schema não corresponder, copiar o payload bruto para `@hidrate/state:corrupt:<timestamp>` e iniciar um estado vazio, exibindo aviso não bloqueante. Falhas de leitura/escrita também geram banner com opção de tentar novamente.

**Rationale**: Evita perda silenciosa de dados e mantém o app utilizável. O backup permite recuperação manual em uma versão futura. Um erro de storage não deve travar a interface.

**Alternatives considered**:
- Apagar dados corrompidos sem backup: perda irreversível.
- Bloquear o app: pior experiência e não resolve o problema.
- Migração automática de versões desconhecidas: arriscada sem schema conhecido.

## Riscos e mitigação

| Risco | Mitigação |
|-------|-----------|
| Escrita concorrente em toques rápidos | Fila serializada no controller/repositório e save-before-commit |
| Virada do dia com app aberto | Timer até a meia-noite + verificação no `AppState` e ao focar telas |
| Mudança de fuso/relógio | Persistir `dayKey` e `localTime` no momento do registro |
| Dados corrompidos | Backup do payload bruto e estado inicial com aviso |
| Lista de histórico longa | `FlatList` e selectors memoizados; dados do dia são pequenos |
| AsyncStorage não criptografado | Dados de baixa sensibilidade, sem credenciais; reavaliar se o escopo mudar |
| Testes dependentes do relógio real | Injeção de clock e uso de timers falsos |
| Web não ser gate | Priorizar iOS/Android e manter compatibilidade incidental |

## Pendências

Nenhuma. Todas as decisões necessárias para iniciar a implementação foram tomadas; não há `NEEDS CLARIFICATION` em aberto.
