# Feature Specification: Controle Diário de Consumo de Água

**Feature Branch**: `001-daily-water-intake`

**Created**: 2026-10-25

**Status**: Draft

**Input**: User description: "quero criar um app para contabilizar quantos litros de agua foram tomados por dia, e estabelecer metas diarias que vão tendo progresso conforme adicionado os ml de agua ingeridos, vai ter um historico do dia mostrando qual horario foi adicionado e quantos ml ou litros foram ingeridos"

## Clarifications

### Session 2026-10-25

- Q: O histórico deve permitir consultar dias anteriores ou apenas o dia atual nesta primeira versão? → A: Resumo dos últimos 7 dias + dia atual: inclui uma visão semanal simples, além do histórico de hoje.
- Q: Ao alterar a meta diária, os dias anteriores no resumo semanal devem manter a meta que tinham ou ser recalculados com a nova meta? → A: Cada dia preserva a meta ativa naquela data; alterações valem de hoje em diante, sem recálculo retroativo.
- Q: O usuário deve poder registrar uma ingestão com um horário diferente do atual? → A: Não; cada registro usa automaticamente a data e o horário atuais no momento da confirmação.
- Q: O usuário deve digitar o volume apenas em mililitros ou também pode escolher litros na hora de registrar? → A: Entrada apenas em mililitros; o app exibe em ml ou L conforme o volume.
- Q: O usuário deve poder editar o volume de um registro já lançado ou basta remover o registro e lançar novamente? → A: Pode editar o volume de registros existentes e também remover e lançar novamente; data e horário permanecem os originais.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Registrar consumo e acompanhar a meta diária (Priority: P1)

O usuário abre o app, informa a quantidade de água que acabou de beber (em mililitros) e vê imediatamente o total do dia, o quanto falta para atingir a meta e o percentual de progresso.

**Why this priority**: É o núcleo do produto. Sem o registro e a visualização do progresso, o app não entrega nenhum valor; as demais histórias complementam esse fluxo.

**Independent Test**: Pode ser testada configurando uma meta, adicionando um volume e verificando se o total, o saldo restante e o percentual de progresso são atualizados corretamente, mesmo sem as demais funcionalidades.

**Acceptance Scenarios**:

1. **Given** que a meta diária é 2.000 ml e o total do dia é 0 ml, **When** o usuário registra 250 ml, **Then** o total do dia passa a exibir 250 ml, o saldo restante exibe 1.750 ml e o progresso exibe 12,5%.
2. **Given** que o total do dia é 1.800 ml e a meta é 2.000 ml, **When** o usuário registra 500 ml, **Then** o total exibe 2.300 ml, o progresso atinge 100% e o app informa que a meta foi superada em 300 ml.
3. **Given** que o usuário registra um consumo, **When** a operação é concluída, **Then** o total do dia e o progresso são atualizados em até 1 segundo.
4. **Given** que o usuário informa um valor inválido (vazio, zero, negativo, não numérico ou acima do limite permitido), **When** tenta registrar, **Then** o app impede o registro e apresenta uma mensagem clara sobre o valor aceito.

---

### User Story 2 - Definir e ajustar a meta diária (Priority: P2)

O usuário define quanto pretende beber por dia, podendo alterar essa meta depois; o progresso do dia atual é recalculado com base na nova meta, e a meta escolhida passa a valer para os próximos dias.

**Why this priority**: A meta personalizada dá sentido ao progresso. Uma meta padrão já permite usar o app, mas o ajuste é essencial para adaptar o objetivo ao usuário.

**Independent Test**: Pode ser testada alterando a meta com um total já registrado e verificando se o percentual e o saldo restante são recalculados, sem depender do histórico.

**Acceptance Scenarios**:

1. **Given** que o usuário utiliza o app pela primeira vez, **When** abre a tela principal, **Then** o app apresenta a meta padrão de 2.000 ml e permite alterá-la.
2. **Given** que o total do dia é 1.000 ml e a meta é 2.000 ml, **When** o usuário altera a meta para 2.500 ml, **Then** o progresso passa de 50% para 40% e o saldo restante passa a exibir 1.500 ml.
3. **Given** que o usuário define uma nova meta, **When** fecha e reabre o app, **Then** a meta definida permanece ativa.
4. **Given** que o usuário define uma meta fora do intervalo permitido, **When** confirma a alteração, **Then** o app impede a alteração e informa o intervalo válido.

---

### User Story 3 - Consultar o histórico do dia e corrigir registros (Priority: P3)

O usuário consulta todos os registros de água do dia atual, cada um com o horário e o volume ingerido, em mililitros ou litros, e pode editar o volume de um registro ou removê-lo para corrigir o total.

**Why this priority**: O histórico dá transparência ao total e permite corrigir enganos. Sem ele o app funciona, mas o usuário não consegue auditar nem corrigir o que foi registrado.

**Independent Test**: Pode ser testada adicionando registros em horários distintos, conferindo a ordem e os volumes exibidos, editando o volume de um registro e removendo outro para verificar o recálculo do total.

**Acceptance Scenarios**:

1. **Given** que o usuário registrou 250 ml e depois 500 ml, **When** abre o histórico do dia, **Then** vê os dois registros com seus respectivos horários e volumes, do mais recente para o mais antigo.
2. **Given** que existe um registro de 1.500 ml, **When** o usuário consulta o histórico, **Then** o volume é exibido como 1,5 L; volumes abaixo de 1.000 ml são exibidos em ml.
3. **Given** que o total do dia é 750 ml e existe um registro de 250 ml, **When** o usuário edita esse registro para 300 ml e salva, **Then** o histórico exibe 300 ml no mesmo horário e o total e o progresso são recalculados para 800 ml.
4. **Given** que o usuário tenta editar um registro para um volume inválido, **When** confirma a edição, **Then** o app impede a alteração, mantém o valor anterior e informa o intervalo aceito.
5. **Given** que o total do dia é 750 ml e existe um registro de 250 ml, **When** o usuário remove esse registro, **Then** o histórico deixa de exibi-lo e o total e o progresso são recalculados para 500 ml.
6. **Given** que o usuário removeu o último registro do dia, **When** consulta o total, **Then** o total exibe 0 ml e o progresso exibe 0%, sem registros no histórico.

---

### User Story 4 - Consultar o resumo dos últimos 7 dias (Priority: P4)

O usuário consulta uma visão semanal simples com os últimos 7 dias corridos, incluindo hoje, vendo para cada dia o total consumido, a meta e se a meta foi atingida, além do histórico detalhado do dia atual.

**Why this priority**: O resumo semanal adiciona contexto e motivação, mas o app já entrega valor completo para o acompanhamento diário sem ele.

**Independent Test**: Pode ser testada preenchendo totais em dias distintos e verificando se o resumo exibe os 7 dias corretos, com total, meta e situação de cada um, sem depender das demais telas.

**Acceptance Scenarios**:

1. **Given** que existem registros no dia atual e em dias anteriores, **When** o usuário abre o resumo semanal, **Then** vê os últimos 7 dias corridos, do mais antigo para o mais recente, cada um com data, total consumido, meta e indicação de meta atingida ou não.
2. **Given** que um dos últimos 7 dias não possui registros, **When** o usuário consulta o resumo, **Then** esse dia é exibido com 0 ml, meta vigente e indicação de meta não atingida.
3. **Given** que ocorre a virada do dia, **When** o usuário consulta o resumo, **Then** o novo dia entra na janela dos últimos 7 dias e o dia mais antigo deixa de ser exibido.
4. **Given** que o usuário adiciona, edita ou remove um registro hoje, **When** o resumo semanal é consultado, **Then** o total e a situação do dia atual refletem a alteração.

---

### Edge Cases

- **Primeiro uso sem meta definida**: o app assume a meta padrão de 2.000 ml até que o usuário a altere.
- **Meta atingida ou superada**: o progresso visual não ultrapassa 100%, mas o app informa o total consumido e o excedente em relação à meta.
- **Virada do dia com o app aberto ou em segundo plano**: ao mudar a data local, o app inicia um novo dia com total 0, mantém a meta vigente e preserva os registros do dia anterior para uso futuro.
- **Alteração da meta no meio do dia**: a nova meta recalcula o progresso apenas do dia atual e passa a valer para os dias seguintes; dias anteriores não são recalculados.
- **Remoção de registro inexistente ou já removido**: o app mantém o total consistente e não gera erro para o usuário.
- **Edição de registro**: ao salvar um novo volume válido, data e horário originais são mantidos e o total, o saldo, o progresso e o resumo semanal são recalculados.
- **Edição com valor inválido**: o app recusa a alteração, preserva o volume anterior e informa o intervalo aceito.
- **Edição de registro removido**: o app mantém o total consistente, não altera dados e não gera erro para o usuário.
- **Registros muito próximos no tempo (toques repetidos)**: cada confirmação é tratada como um registro independente; o usuário pode remover duplicidades pelo histórico.
- **Mudança de fuso horário ou ajuste do relógio do dispositivo**: o dia é determinado pela data local do dispositivo no momento do registro; registros não são movidos automaticamente entre dias.
- **Volume individual muito alto**: registros acima do limite por entrada são recusados; o usuário deve dividir o consumo em registros menores.
- **Dia sem registros no resumo semanal**: o dia aparece com 0 ml, a meta vigente e a indicação de meta não atingida.
- **Dias anteriores ao primeiro uso**: os primeiros dias da janela de 7 dias que antecedem a instalação aparecem como dias sem registros.
- **Meta alterada durante a semana**: cada dia do resumo mantém a meta que estava ativa naquele dia; a alteração de hoje não recalcula os dias anteriores.
- **Virada do dia no resumo semanal**: a janela de 7 dias é atualizada automaticamente assim que a data local muda.
- **Uso prolongado**: o histórico do dia atual permanece consultável e o app mantém o desempenho com pelo menos 30 dias de dados acumulados.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST permitir que o usuário registre uma ingestão de água informando um volume personalizado em mililitros.
- **FR-002**: O sistema MUST oferecer opções rápidas de volume (por exemplo, 200 ml, 250 ml e 500 ml) para agilizar o registro, além da entrada personalizada.
- **FR-003**: O sistema MUST associar automaticamente a data e o horário locais do dispositivo a cada registro no momento da confirmação.
- **FR-004**: O sistema MUST manter o total de água consumida no dia atual, somando todos os registros do dia.
- **FR-005**: O sistema MUST exibir o progresso diário em percentual e em volume em relação à meta, atualizando ambos imediatamente após cada inclusão, edição ou remoção.
- **FR-006**: O sistema MUST exibir o saldo restante para atingir a meta e, quando a meta for superada, informar o excedente consumido.
- **FR-007**: O sistema MUST limitar a representação visual do progresso a 100%, sem impedir o usuário de continuar registrando consumo.
- **FR-008**: O sistema MUST permitir que o usuário defina e altere a meta diária em mililitros.
- **FR-009**: O sistema MUST usar 2.000 ml como meta padrão quando o usuário ainda não tiver definido uma meta.
- **FR-010**: O sistema MUST limitar a meta diária ao intervalo de 500 ml a 10.000 ml e recusar valores fora desse intervalo.
- **FR-011**: O sistema MUST limitar cada registro individual ao intervalo de 1 ml a 5.000 ml e recusar valores vazios, zero, negativos, não numéricos ou acima do limite.
- **FR-012**: O sistema MUST manter a meta definida pelo usuário entre sessões e aplicá-la aos dias seguintes.
- **FR-013**: O sistema MUST apresentar o histórico do dia atual em ordem cronológica inversa (do mais recente para o mais antigo), com horário e volume de cada registro.
- **FR-014**: O sistema MUST exibir volumes abaixo de 1.000 ml em mililitros e volumes iguais ou superiores a 1.000 ml em litros, com uma casa decimal (por exemplo, 1,5 L).
- **FR-015**: O sistema MUST permitir que o usuário remova um registro do histórico e recalcular o total, o saldo e o progresso do dia após a remoção.
- **FR-016**: O sistema MUST iniciar um novo dia automaticamente à meia-noite local, zerando o total do dia atual e mantendo a meta vigente.
- **FR-017**: O sistema MUST preservar os registros e a meta após o app ser fechado, encerrado ou reiniciado.
- **FR-018**: O sistema MUST manter os registros de dias anteriores preservados, ainda que o detalhamento visível seja apenas o do dia atual.
- **FR-019**: O sistema MUST exibir uma mensagem clara e orientativa quando um valor de registro ou de meta for inválido.
- **FR-020**: O sistema MUST funcionar sem conexão com a internet e sem exigir criação de conta ou autenticação.
- **FR-021**: O sistema MUST apresentar um resumo dos últimos 7 dias corridos, incluindo o dia atual, ordenado do mais antigo para o mais recente, com data, total consumido, meta e indicação de meta atingida ou não para cada dia.
- **FR-022**: O sistema MUST exibir dias sem registros no resumo semanal com 0 ml e indicação de meta não atingida.
- **FR-023**: O sistema MUST usar, em cada dia do resumo semanal, a meta que estava ativa naquele dia, sem recalcular dias anteriores quando a meta atual for alterada.
- **FR-024**: O sistema MUST atualizar o resumo semanal imediatamente após inclusão, edição ou remoção de registro e na virada do dia.
- **FR-025**: O sistema MUST exibir os registros individuais apenas para o dia atual; para os demais dias da janela semanal, exibe somente o resumo agregado.
- **FR-026**: O sistema MUST permitir que o usuário edite o volume de um registro existente do dia atual, mantendo a data e o horário originais e aplicando as mesmas regras de validação de um novo registro.
- **FR-027**: O sistema MUST recalcular o total do dia, o saldo, o progresso e o resumo semanal imediatamente após uma edição de volume ser salva.

### Key Entities *(include if feature involves data)*

- **Registro de Consumo**: representa uma ingestão de água. Atributos: identificador único, data e hora local do registro, volume em mililitros e a qual dia pertence.
- **Meta Diária**: representa o objetivo de consumo de um dia. Atributos: volume alvo em mililitros, data de vigência e indicação de que é a meta ativa. O valor da meta aplicado a cada dia deve ser preservado para o resumo semanal.
- **Resumo Diário**: representa o panorama de um dia. Atributos: data, total consumido em mililitros, meta do dia, percentual de progresso, saldo restante ou excedente e indicação de meta atingida.
- **Resumo Semanal**: representa os últimos 7 dias corridos incluindo hoje. Atributos: lista ordenada de Resumos Diários, do mais antigo para o mais recente.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Usuários conseguem registrar um consumo em até 5 segundos e no máximo 3 toques a partir da tela principal.
- **SC-002**: O total e o progresso refletem cada inclusão, edição ou remoção em até 1 segundo.
- **SC-003**: Usuários conseguem definir ou alterar a meta diária em até 30 segundos.
- **SC-004**: 100% dos registros válidos sobrevivem ao fechamento e reabertura do app e permanecem no total do dia correto.
- **SC-005**: 100% dos registros exibidos no histórico apresentam horário e volume corretos, no formato de unidade definido.
- **SC-006**: 90% dos usuários de primeira viagem registram o primeiro consumo sem precisar de instruções externas.
- **SC-007**: Após 30 dias de uso diário, a tela principal continua abrindo em até 2 segundos e o histórico do dia permanece utilizável.
- **SC-008**: 100% das remoções de registro resultam em total, saldo e percentual recalculados corretamente.
- **SC-009**: Usuários conseguem identificar em até 5 segundos quantos dos últimos 7 dias atingiram a meta.
- **SC-010**: 100% dos dias do resumo semanal exibem total e meta corretos, inclusive os dias sem registros.
- **SC-011**: O resumo semanal é atualizado em até 1 segundo após inclusão, edição ou remoção de registro e na virada do dia.
- **SC-012**: 100% das edições válidas de volume atualizam total, saldo, percentual e resumo semanal corretamente, mantendo o horário original do registro.

## Assumptions

- O app é de uso individual, em um único dispositivo, sem login, sincronização entre dispositivos ou compartilhamento de dados.
- O público-alvo utiliza o sistema métrico; não há suporte a onças fluidas ou outras unidades nesta versão.
- A meta padrão de 2.000 ml é apenas um valor inicial editável e não constitui recomendação médica; o usuário define seu próprio objetivo.
- O dia é delimitado pela meia-noite do fuso horário local do dispositivo.
- O histórico detalhado de registros individuais é exibido apenas para o dia atual. Os últimos 7 dias são apresentados como resumo agregado, sem detalhamento dos registros de cada dia; dias anteriores a essa janela são preservados internamente, mas não são consultáveis nesta versão.
- A meta alterada no meio do dia aplica-se imediatamente ao dia atual e aos próximos dias, sem efeito retroativo sobre dias anteriores; o resumo semanal preserva a meta vigente em cada dia.
- Não fazem parte desta versão: lembretes, notificações, integração com dispositivos vestíveis, gamificação, relatórios mensais, gráficos de tendência, detalhamento de registros de dias anteriores, navegação por calendário para dias fora dos últimos 7 dias, conta de usuário e sincronização em nuvem.
- O app deve funcionar integralmente offline e os dados permanecem no dispositivo do usuário.
