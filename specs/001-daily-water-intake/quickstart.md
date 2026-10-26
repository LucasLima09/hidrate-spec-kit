# Quickstart: Controle Diário de Consumo de Água

**Feature**: `001-daily-water-intake`
**Objetivo**: validar a implementação no simulador/dispositivo e pelos comandos automatizados.

## Pré-requisitos

- Node.js >= 22.13.x
- npm (o projeto usa `package-lock.json`)
- Expo Go no dispositivo ou simulador iOS/Android
- App **Hidrate** na raiz `/home/lucas/Documentos/Hidrate`

## Instalação e execução

```bash
npm install
npx expo install @react-native-async-storage/async-storage
npx expo start
```

No terminal do Expo:
- `i` para abrir o simulador iOS;
- `a` para abrir o emulador Android;
- `w` para abrir no navegador (compatibilidade incidental, não é gate).

O AsyncStorage funciona no Expo Go; não é necessário development build para esta feature.

## Comandos de verificação

```bash
npm test
npm run lint
npx tsc --noEmit
npx expo-doctor
```

- `npm test` deve rodar a suíte Jest configurada na implementação.
- `npm run lint` usa `expo lint`.
- `npx tsc --noEmit` valida os tipos sem gerar arquivos.
- `npx expo-doctor` confere dependências e configuração do projeto.

## Roteiro manual

### 1. Primeiro uso

1. Instale/abra o app com dados limpos.
2. Abra a tab **Hoje**.

**Esperado**: total `0 ml`, meta `2,0 L`, barra em 0%, saldo restante igual à meta, histórico vazio com chamada para adicionar.

### 2. Adicionar pelos atalhos

1. Toque em `200 ml`.
2. Toque em `250 ml`.

**Esperado**: total `450 ml`; saldo `1.550 ml`; dois itens no histórico, do mais recente para o mais antigo, com horário local.

### 3. Adicionar volume personalizado

1. Digite `300` no campo e toque em **Adicionar**.

**Esperado**: total `750 ml`; campo limpo; novo item no topo do histórico.

2. Adicione `250 ml` para chegar a `1.000 ml`.

**Esperado**: total exibido como `1,0 L`; saldo `1.000 ml` (ou `1,0 L`); barra em 50% para meta de 2.000 ml.

### 4. Validação de volume

1. Tente adicionar `0`, `5001`, `1,5` e um campo vazio.

**Esperado**: mensagem inline de validação; nenhum registro criado; total inalterado.

### 5. Editar registro

1. Toque em **Editar** no primeiro item do histórico.
2. Altere o volume para `350` e salve.

**Esperado**: total recalculado; horário original do registro preservado; diálogo fecha.

3. Tente salvar um volume inválido.

**Esperado**: mensagem inline; valor anterior mantido.

### 6. Remover registro

1. Toque em **Remover** em um item e confirme.

**Esperado**: item some; total recalculado; se era o último, o histórico mostra o estado vazio.

### 7. Alterar a meta

1. Abra **Meta**.
2. Defina `2500` e salve.
3. Volte para **Hoje**.

**Esperado**: a meta do dia passa a ser `2,5 L`; o progresso é recalculado sem alterar o total; a mensagem informa que a mudança vale para hoje e próximos dias.

4. Abra **Semana**.

**Esperado**: dias anteriores continuam exibindo as metas que tinham antes da alteração.

5. Tente salvar `499` e `10001`.

**Esperado**: erro inline; meta não alterada.

### 8. Meta atingida e excedida

1. Adicione água até o total ser exatamente igual à meta.

**Esperado**: indicador "Meta atingida"; sem excedente; barra em 100%.

2. Adicione mais `250 ml`.

**Esperado**: indicador de meta mantido; excedente de `250 ml`; barra visualmente limitada a 100%.

### 9. Semana

1. Abra **Semana**.

**Esperado**: exatamente 7 itens, do mais antigo para o mais recente, terminando hoje; cada item mostra data, total, meta e indicador de meta; dias sem registros aparecem com `0 ml` e "Meta não atingida".

2. Confira a virada de mês/ano, se possível, ajustando a data do simulador.

**Esperado**: 7 datas consecutivas, sem duplicatas ou buracos.

### 10. Virada do dia

1. No simulador, ajuste o relógio para `23:59` de um dia.
2. Adicione um registro.
3. Avance para `00:01` do dia seguinte e volte ao app.

**Esperado**: **Hoje** começa com `0 ml` e a meta padrão; o registro anterior aparece no dia correto em **Semana**; não é possível editar/remover o registro de ontem pela tela Hoje.

### 11. Persistência

1. Encerre o app e abra novamente.

**Esperado**: total, histórico, meta e semana persistem.

2. Ative o modo avião e repita uma adição.

**Esperado**: tudo continua funcionando offline.

### 12. Acessibilidade

1. Ative VoiceOver (iOS) ou TalkBack (Android).
2. Percorra Hoje, Semana e Meta.

**Esperado**: botões anunciam o volume; o progresso anuncia total, meta e percentual; ações de editar/remover incluem o horário; o indicador de meta não depende apenas de cor.

3. Aumente o tamanho da fonte do sistema.

**Esperado**: textos continuam legíveis e botões permanecem tocáveis (>= 44×44).

### 13. Performance

1. Popular 30 dias de dados (pelo uso ou por fixture de teste).
2. Abrir **Hoje** e **Semana**.

**Esperado**: tela principal em até 2 segundos; adicionar/editar/remover refletido em até 1 segundo; rolagem fluida.

### 14. Dados corrompidos e falhas

- Cenário automatizado: os testes de `storage` cobrem JSON inválido, schema desconhecido, backup e falha de escrita.
- Manual opcional: se houver ferramenta de debug, substituir `@hidrate/state` por um JSON inválido e reabrir o app.

**Esperado**: app inicia com estado vazio, cria a chave `@hidrate/state:corrupt:<epochMs>` e mostra banner não bloqueante; a chave principal não é sobrescrita antes do backup.

## Limpeza de dados de teste

O AsyncStorage fica no dispositivo/simulador. Para recomeçar:

- **Android**: Configurações > Apps > Hidrate (ou Expo Go) > Armazenamento > Limpar dados.
- **iOS**: desinstale e reinstale o app (ou limpe os dados do Expo Go no simulador).
- **Expo Go**: limpar os dados do Expo Go remove o storage de todos os projetos abertos nele.

Não use `npx expo start --clear` para isso: ele limpa o cache do Metro, não o AsyncStorage.

## Fora do escopo desta validação

- Notificações/lembretes.
- Login, sincronização ou backup em nuvem.
- Edição de registros de dias anteriores.
- Escolha manual de data/hora do registro.
- Publicação via EAS.

## Critérios de aceite automatizados

- Casos de uso e utilitários com cobertura dos limites e da virada do dia.
- Storage com round-trip, corrupção, backup e escrita serializada.
- Integração das três telas com adicionar/editar/remover/meta e persistência.
- `npm test`, `npm run lint` e `npx tsc --noEmit` sem erros.
