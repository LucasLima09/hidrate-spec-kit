# Hidrate

Aplicativo mobile **offline-first** para registrar o consumo diário de água, acompanhar a meta pessoal e consultar o histórico do dia e um resumo dos últimos 7 dias.

O produto foi construído com **Expo SDK 58 + React Native + TypeScript**, sem login, sem sincronização e sem dependência de internet. Os dados ficam no dispositivo.

> A documentação completa da feature está em [`specs/001-daily-water-intake/`](./specs/001-daily-water-intake/), incluindo [especificação](./specs/001-daily-water-intake/spec.md), [plano](./specs/001-daily-water-intake/plan.md), [modelo de dados](./specs/001-daily-water-intake/data-model.md), [contratos](./specs/001-daily-water-intake/contracts/) e [tarefas](./specs/001-daily-water-intake/tasks.md).

---

## Tema do produto

**Hidrate** é um app de bem-estar simples e pessoal. A proposta não é ser uma rede social, um app de gamificação ou um prontuário médico: é ajudar a pessoa a perceber quanto bebeu, quanto falta para a meta e como está a constância da semana.

### Princípios do produto

- **Rápido de usar**: registrar água deve levar poucos segundos.
- **Claro**: o total do dia, a meta e o que falta ficam visíveis imediatamente.
- **Pessoal**: cada pessoa define a própria meta; o app sugere 2.000 ml como ponto de partida.
- **Confiável**: os dados sobrevivem ao fechamento do app e ficam disponíveis offline.
- **Corrigível**: o usuário pode editar o volume ou remover um registro do dia.
- **Sem atrito**: não há conta, senha, servidor ou permissões desnecessárias.

### Identidade visual

Na revisão de interface, a direção escolhida foi **modo claro único**, com uma paleta verde calma, superfícies claras e uma estética minimalista. A interface não alterna automaticamente para o tema escuro.

| Token | Uso | Cor |
| --- | --- | --- |
| `accentDark` | Cards de destaque e títulos | `#10583C` |
| `accent` | Ações principais e ícones | `#1B7A55` |
| `accentSoft` | Fundos suaves e seleção | `#CDEBDD` |
| `accentBright` | Progresso dentro dos cards escuros | `#8BE7B9` |
| `background` | Fundo geral | `#F4FAF6` |
| `surface` | Cards e superfícies | `#FFFFFF` |
| `text` | Texto principal | `#10261D` |
| `textSecondary` | Apoio e metadados | `#5C7268` |
| `danger` | Erros e ações destrutivas | `#B34842` |

**Diretrizes visuais:**

- Títulos grandes, números de consumo em destaque e hierarquia tipográfica clara.
- Cards arredondados com bordas suaves, em vez de excesso de sombras ou efeitos.
- Ações primárias em verde sólido; ações secundárias em verde suave; exclusão em vermelho suave.
- Ícones consistentes via `expo-symbols` (SF Symbols no iOS, Material Symbols no Android e na web).
- Toda ação tem rótulo acessível e alvo de toque de pelo menos 44×44.
- Textos em português brasileiro, com formato de volume adaptado: `ml` abaixo de 1.000 ml e `L` a partir de 1.000 ml, usando vírgula decimal.

---

## User stories

As histórias foram priorizadas para entregar primeiro o fluxo que gera valor sozinho: registrar água e ver o progresso. As demais adicionam personalização, correção e contexto.

| ID | Prioridade | História | Valor entregue |
| --- | --- | --- | --- |
| US1 | P1 | Registrar consumo e acompanhar a meta diária | O núcleo do app: registrar e ver o progresso imediatamente |
| US2 | P2 | Definir e ajustar a meta diária | O objetivo passa a ser pessoal e recalculável |
| US3 | P3 | Consultar o histórico do dia e corrigir registros | Transparência e correção de enganos |
| US4 | P4 | Consultar o resumo dos últimos 7 dias | Contexto e motivação para manter a constância |

### US1 — Registrar consumo e acompanhar a meta diária (P1)

**Como** pessoa usando o app, **quero** informar a quantidade de água que bebi **para** ver o total do dia, o quanto falta para a meta e o meu progresso.

- Com meta de 2.000 ml e total inicial de 0 ml, ao registrar 250 ml o app mostra 250 ml, saldo de 1.750 ml e 12,5%.
- Ao ultrapassar a meta, o progresso visual fica em 100%, mas o app informa o excedente.
- Valores vazios, zero, negativos, não numéricos ou acima de 5.000 ml são recusados com uma mensagem clara.
- O total e o progresso devem refletir a inclusão em até 1 segundo.

**Teste independente:** configurar a meta, adicionar um volume e conferir total, saldo e percentual.

### US2 — Definir e ajustar a meta diária (P2)

**Como** pessoa usando o app, **quero** definir e alterar minha meta diária **para** que o progresso faça sentido para a minha rotina.

- A meta inicial é 2.000 ml.
- O valor aceito está entre 500 ml e 10.000 ml.
- Alterar a meta recalcula o progresso do dia atual.
- A nova meta vale de hoje em diante; dias anteriores preservam a meta que tinham.
- A meta permanece salva ao fechar e reabrir o app.

**Teste independente:** mudar a meta com 1.000 ml já registrados e conferir o novo percentual e saldo.

### US3 — Consultar o histórico do dia e corrigir registros (P3)

**Como** pessoa usando o app, **quero** ver os registros de hoje, **para** conferir horários e volumes, editar um valor ou remover um registro errado.

- O histórico mostra os registros do mais recente para o mais antigo.
- Cada item exibe horário e volume, em ml ou L.
- Editar o volume mantém a data e o horário originais.
- Remover um registro recalcula total, saldo, progresso e resumo da semana.
- O app impede edições com volume inválido e preserva o valor anterior.
- Ao remover o último registro, o dia volta a 0 ml e 0%.

**Teste independente:** adicionar dois registros, editar um e remover outro, conferindo o recálculo.

### US4 — Consultar o resumo dos últimos 7 dias (P4)

**Como** pessoa usando o app, **quero** ver os últimos 7 dias **para** entender minha constância sem precisar navegar por um calendário.

- A janela tem exatamente 7 dias corridos, incluindo hoje, do mais antigo para o mais recente.
- Cada linha mostra data, total consumido, meta e se a meta foi atingida.
- Dias sem registros aparecem com 0 ml e meta não atingida.
- A meta exibida em cada dia é a que estava ativa naquele dia.
- O resumo é atualizado ao adicionar, editar ou remover registros e na virada do dia.
- O detalhamento individual continua disponível apenas para o dia atual.

**Teste independente:** preencher dias diferentes e conferir os 7 itens, incluindo dias vazios.

---

## Especificação

A especificação foi escrita antes da implementação, com uma sessão de esclarecimentos para fechar decisões ambíguas. As escolhas principais foram:

### Escopo funcional

- Registro de consumo por atalhos de **200 ml, 250 ml e 500 ml** ou por volume personalizado.
- Data e horário locais associados automaticamente no momento da confirmação.
- Total diário, meta, percentual, saldo restante e excedente.
- Histórico detalhado apenas do dia atual, em ordem cronológica inversa.
- Edição e remoção de registros do dia atual.
- Meta diária editável, com histórico de vigência para preservar os dias anteriores.
- Resumo dos últimos 7 dias corridos.
- Persistência local e funcionamento offline.
- Virada automática do dia à meia-noite local.

### Regras de negócio

| Regra | Valor |
| --- | --- |
| Meta padrão | 2.000 ml |
| Intervalo da meta | 500 ml a 10.000 ml |
| Intervalo por registro | 1 ml a 5.000 ml |
| Formato de entrada | Apenas mililitros inteiros |
| Formato de exibição | `ml` abaixo de 1.000 ml; `L` com uma casa decimal a partir de 1.000 ml |
| Definição do dia | Data local do dispositivo, nunca UTC |
| Ordem do histórico | Mais recente primeiro |
| Ordem da semana | Mais antigo primeiro |
| Meta histórica | Cada dia usa a meta vigente naquela data |
| Persistência | Documento JSON versionado no AsyncStorage |
| Unidade de conta | Um usuário, um dispositivo, sem login |

### Decisões importantes da spec

- **Não é possível escolher outro horário:** o registro usa o momento da confirmação.
- **Não há lançamento em litros:** a entrada é sempre em ml; o app formata a saída.
- **A meta não é retroativa:** mudanças valem para hoje e para os próximos dias.
- **O histórico detalhado é só de hoje:** os dias anteriores aparecem apenas no resumo agregado.
- **O app funciona sem internet:** não há conta, servidor, sincronização ou autenticação.
- **O volume visual não passa de 100%:** o excedente é informado em texto.

### Fora do escopo desta versão

Lembretes e notificações, integração com wearables, gamificação, relatórios mensais, gráficos de tendência, navegação por calendário fora dos últimos 7 dias, detalhamento de dias anteriores, conta de usuário e sincronização em nuvem.

---

## Planejamento técnico

### Stack

- **Expo SDK 58** (`expo ~58.0.19`)
- **React Native 0.88** e **React 19.3**
- **TypeScript** estrito
- **Expo Router** com rotas em `src/app/`
- **AsyncStorage** para persistência local
- **expo-symbols** para ícones cross-platform
- **Jest 30 + jest-expo + React Native Testing Library** para testes
- **ESLint + expo-doctor** para qualidade e compatibilidade

### Arquitetura em camadas

```text
src/app/          Rotas finas do Expo Router
src/pages/        Composição das telas
src/components/   Componentes de apresentação
src/controllers/  Estado React, ações e ciclo de vida do dia
src/usecases/     Regras puras de negócio
src/storage/      Persistência, schema e serialização
src/domain/       Entidades, erros e tipos
src/utils/        Datas, volumes, validação e IDs
src/constants/    Limites, valores padrão e tokens visuais
```

O fluxo principal é:

```text
página -> hook/controller -> caso de uso -> repositório -> AsyncStorage
```

### Decisões de engenharia

- **Casos de uso puros:** recebem estado, relógio e gerador de ID injetáveis; não importam React nem AsyncStorage.
- **Provider com `useReducer`:** centraliza estado, sumários derivados e ações assíncronas.
- **Salvar antes de confirmar:** a UI só assume uma operação como concluída depois que a persistência funciona.
- **Fila de escrita:** toques rápidos não sobrescrevem registros uns dos outros.
- **Documento único versionado:** reduz inconsistências entre meta e registros.
- **Sumários derivados:** diário e semanal são calculados em memória, não persistidos.
- **Metas históricas:** `goalHistory` guarda a data de vigência de cada mudança.
- **Dia local:** `dayKey` no formato `YYYY-MM-DD`, calculado com os getters locais de `Date`.
- **Falha de storage não apaga dados:** o app mantém o último estado confirmado, mostra um banner e permite tentar novamente.

### Modelo de dados resumido

- `IntakeEntry`: `id`, `dayKey`, `createdAt`, `localTime`, `volumeMl`.
- `GoalChange`: `effectiveFrom`, `goalMl`.
- `WaterState`: versão do schema, meta atual, histórico de metas e registros por dia.
- `DailySummary`: total, meta, percentual, restante, excedente e se a meta foi atingida.
- `WeeklySummary`: sete resumos diários e contagem de dias com meta atingida.

### Telas e navegação

- **Hoje** (`/`): progresso, atalhos, volume personalizado e histórico do dia.
- **Semana** (`/week`): resumo dos últimos 7 dias.
- **Meta** (`/goal`): meta atual, edição e feedback de salvamento.
- **Tabs nativas** no iOS/Android e **tabs flutuantes** na web, com os mesmos nomes e ícones.

### Testes e validação

- Testes unitários para casos de uso, utilitários e storage.
- Testes de integração para provider e rotas.
- Cobertura dos fluxos de adicionar, editar, remover, alterar meta, janela semanal e virada do dia.
- Comandos de qualidade: `npm test`, `npx tsc --noEmit`, `npx expo lint` e `npx expo-doctor`.
- Validação web com export de produção e navegador headless para conferir renderização e ausência de erro de hidratação.

---

## O que foi revisado e o que você pediu para mudar

A primeira entrega já tinha o comportamento da especificação implementado. Depois da revisão, você pediu uma mudança de direção visual: o app deveria ser **claro, sofisticado, minimalista, com ícones e paleta verde**, sem a aparência genérica de template.

### Antes da revisão

- Interface funcional, mas com cores neutras e azul padrão do template.
- Suporte automático a claro/escuro, o que adicionava complexidade sem fazer parte do produto.
- Componentes com pouca hierarquia visual: botões, cards e listas ainda muito próximos do padrão inicial.
- Uso limitado de ícones e de affordances visuais para diferenciar ações primárias, secundárias e destrutivas.

### Depois da revisão

- **Modo claro único:** `userInterfaceStyle: "light"` e `useTheme` fixo na paleta clara.
- **Paleta verde completa:** verde profundo para destaque, verde suave para superfícies e tons neutros esverdeados para o fundo.
- **Nova identidade visual:** cards de progresso em verde escuro, tipografia com mais hierarquia, superfícies brancas e bordas suaves.
- **Ícones em toda a interface:** navegação, progresso, atalhos, histórico, meta, edição, exclusão e estados de erro/vazio.
- **Affordances mais claras:** botão primário verde sólido, ações secundárias em verde suave, exclusão em vermelho suave e botões de ícone com rótulos acessíveis.
- **Nova tab bar:** navegação compacta, com ícone + texto e estado ativo em verde.
- **Splash e status bar alinhados ao tema:** fundo verde, status bar escura e navegação com a mesma linguagem visual.
- **Layouts refeitos:** telas Hoje, Semana e Meta ganharam cabeçalho, cards de destaque, listas mais legíveis e estados de carregamento/erro/vazio consistentes.
- **Acessibilidade preservada:** rótulos importantes e alvos de toque continuam atendendo aos testes e às regras de acessibilidade.
- **Correção de hidratação na web:** o texto dinâmico de status do tema foi removido e o tema foi fixado para evitar divergência entre servidor e cliente.

### O que foi preservado

- Todas as regras de negócio da especificação.
- Os fluxos de registrar, editar, remover, alterar meta e consultar a semana.
- Os limites de volume e meta.
- A persistência offline e o comportamento de recuperação de erros.
- Os textos e rótulos acessíveis cobertos pelos testes.

### O que ficou pendente

- **T068:** execução manual dos cenários de aceitação em simulador/dispositivo iOS e Android. A validação automatizada cobre os fluxos equivalentes, mas a verificação em aparelho real ainda precisa ser feita.

---

## Como rodar

Requisitos: Node.js compatível com o Expo SDK 58 e o projeto usando `npm` (há `package-lock.json`).

```bash
npm install
npx expo start
```

Atalhos:

```bash
npm run ios        # simulador iOS
npm run android    # emulador Android
npm run web        # versão web
npm test           # testes Jest
npm run lint       # ESLint
npm run typecheck  # TypeScript
npx expo-doctor    # diagnóstico de dependências e configuração
```

---

## Estrutura do repositório

```text
.
├── src/
│   ├── app/          # Rotas do Expo Router
│   ├── pages/        # Hoje, Semana e Meta
│   ├── components/   # UI, ícones, cards, diálogos e estados
│   ├── controllers/  # Provider e hooks de estado
│   ├── usecases/     # Regras puras de negócio
│   ├── storage/      # AsyncStorage, schema e serialização
│   ├── domain/       # Entidades e erros
│   ├── utils/        # Datas, volumes, validação e IDs
│   └── constants/    # Limites, valores padrão e tema
├── __tests__/        # Testes unitários e de integração
├── specs/            # Especificação, plano, contratos e tarefas
├── assets/           # Ícones e imagens
├── app.json          # Configuração Expo
└── package.json
```

---

## Status

- Especificação, planejamento e implementação funcional concluídos.
- Refatoração visual concluída com tema claro, paleta verde, ícones e nova hierarquia de interface.
- **84 testes passando**, `tsc`, `expo lint` e `expo-doctor` **20/20**.
- Export web de produção validado em navegador headless, sem erros de hidratação.
- **Pendente:** validação manual em iOS/Android (T068).
