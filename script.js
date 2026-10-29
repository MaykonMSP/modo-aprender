(() => {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const state = { stage: 1, hintsFirst: 0, hintsTransfer: 0, mistakes: 0 };
  const initialCode = 'const aprovadas = notas.filter(nota => nota => 70);';
  const initialTransfer = 'const temperaturas = [18, 25, 30, 22];\nconst menoresQue25 = temperaturas.filter(t => );';

  function feedback(target, title, message, success = false) {
    const box = $(target);
    box.replaceChildren();
    const frame = document.createElement('div');
    frame.className = 'feedback-card' + (success ? ' success' : '');
    const heading = document.createElement('b');
    heading.textContent = title;
    const p = document.createElement('p');
    p.textContent = message;
    frame.append(heading, p);
    box.appendChild(frame);
  }

  function addHint(target, title, message) {
    const frame = document.createElement('div');
    frame.className = 'hint-card';
    const heading = document.createElement('b');
    heading.textContent = title;
    const p = document.createElement('p');
    p.textContent = message;
    frame.append(heading, p);
    $(target).appendChild(frame);
  }

  function checkCode(text, arrayName, requiredOperator, threshold) {
    // A small, intentionally limited pattern recognizer. Never executes user input.
    const arrayCall = new RegExp('\\b' + arrayName + '\\s*\\.\\s*filter\\s*\\(');
    if (!arrayCall.test(text)) return 'array';
    const callback = new RegExp('\\b' + arrayName + '\\s*\\.\\s*filter\\s*\\(\\s*\\(?\\s*([a-zA-Z_$][\\w$]*)\\s*\\)?\\s*=>\\s*([a-zA-Z_$][\\w$]*)\\s*(>=|<=|>|<|===|==)\\s*(\\d+)\\s*\\)');
    const match = text.match(callback);
    if (!match) {
      if ((text.match(/=>/g) || []).length > 1) return 'arrow';
      if (text.includes('=<')) return 'order';
      if (/=>\s*(?:\d+|\)|;)/.test(text)) return 'condition';
      return 'syntax';
    }
    if (match[1] !== match[2]) return 'element';
    if (match[3] !== requiredOperator) return 'operator';
    if (Number(match[4]) !== threshold) return 'threshold';
    return 'ok';
  }

  function setMode(mode) {
    const direct = mode === 'direct';
    $('direct-panel').hidden = !direct;
    $('learn-panel').hidden = direct;
    $('mode-direct').classList.toggle('is-active', direct);
    $('mode-learn').classList.toggle('is-active', !direct);
    $('mode-direct').setAttribute('aria-pressed', String(direct));
    $('mode-learn').setAttribute('aria-pressed', String(!direct));
  }
  $('mode-direct').addEventListener('click', () => setMode('direct'));
  $('mode-learn').addEventListener('click', () => setMode('learn'));
  setMode('learn');

  $('check-one').addEventListener('click', () => {
    const result = checkCode($('code-editor').value, 'notas', '>=', 70);
    state.mistakes += result === 'ok' ? 0 : 1;
    if (result === 'ok') {
      state.stage = 2;
      $('stage-1').classList.remove('active');
      $('stage-1').classList.add('done');
      $('stage-1').querySelector('b').textContent = '✓';
      $('stage-2').classList.add('active');
      $('task-one').hidden = true;
      $('task-two').hidden = false;
      $('lesson-message').querySelector('.speaker').textContent = 'Modo Aprender · verificação de aplicação';
      $('lesson-message').querySelector('p').textContent = 'Você ajustou a condição. Agora vamos verificar um problema semelhante, com outros valores e outro operador.';
      $('transfer-editor').focus();
      return;
    }
    const messages = {
      array: 'Confira o nome do array original. Neste exercício ele se chama notas.',
      arrow: 'Você escolheu filter(), mas usou duas setas (=>). A primeira cria a função; a segunda cria outra função, em vez de comparar.',
      order: 'Os sinais estão em uma ordem inválida. Pense em como escrever “maior ou igual” em JavaScript.',
      condition: 'A função precisa comparar cada nota com 70, retornando uma condição verdadeira ou falsa.',
      element: 'Compare o parâmetro recebido pela função — cada nota individual —, e não outra variável.',
      operator: 'Seu código está perto! O enunciado inclui também a nota 70; escolha um operador que inclua a igualdade.',
      threshold: 'A estrutura está correta, mas o limite deste exercício é 70.',
      syntax: 'Ainda não reconheci uma condição válida. Confira o parâmetro da função, a comparação e o fechamento do filter(). Esta simulação reconhece a sintaxe básica com =>.'
    };
    feedback('hint-area', 'Vamos revisar um ponto específico', messages[result]);
  });

  $('hint-one').addEventListener('click', () => {
    state.hintsFirst += 1;
    const hints = [
      'O segundo => não significa “maior ou igual”. Pense na diferença entre definir uma função e comparar valores.',
      'Para comparar se um número é maior ou igual a 70, use o operador >=.',
      'A expressão esperada dentro da função é: nota >= 70. Tente colocá-la depois da primeira seta.'
    ];
    addHint('hint-area', 'Dica ' + state.hintsFirst, hints[Math.min(state.hintsFirst - 1, 2)]);
  });

  $('check-two').addEventListener('click', () => {
    const result = checkCode($('transfer-editor').value, 'temperaturas', '<', 25);
    state.mistakes += result === 'ok' ? 0 : 1;
    if (result === 'ok') {
      $('task-two').hidden = true;
      $('task-complete').hidden = false;
      $('stage-2').classList.remove('active');
      $('stage-2').classList.add('done');
      $('stage-2').querySelector('b').textContent = '✓';
      if (state.hintsTransfer === 0) {
        $('complete-title').textContent = 'Aplicação independente observada';
        $('complete-text').textContent = 'Você aplicou a condição em um novo problema sem receber pistas nesta etapa. É uma indicação de aplicação imediata, não prova de retenção.';
        $('completion-status').textContent = '✓ Nova aplicação sem ajuda';
      } else {
        $('complete-title').textContent = 'Aplicação assistida concluída';
        $('complete-text').textContent = 'Você chegou à resposta correta com ajuda adicional nesta etapa. Para avaliar independência, seria necessário propor outra tarefa sem pistas.';
        $('completion-status').textContent = '✓ Nova aplicação com dicas';
      }
      return;
    }
    const messages = {
      array: 'Use o array temperaturas declarado no exercício, não outro nome.',
      arrow: 'Parece haver duas setas. Use uma seta para iniciar a função e depois faça uma comparação.',
      order: 'A sequência =< não é um operador válido em JavaScript.',
      condition: 'A função precisa retornar uma condição de comparação com 25.',
      element: 'Compare o parâmetro atual da função, não o array inteiro.',
      operator: 'O exercício pede temperaturas menores que 25, sem incluir o 25. Confira se seu operador inclui a igualdade.',
      threshold: 'O limite é 25. Revise o número usado na comparação.',
      syntax: 'Revise a expressão que vem depois da seta e o fechamento dos parênteses. A simulação reconhece funções com seta simples.'
    };
    feedback('transfer-feedback', 'Ainda há um ajuste', messages[result]);
  });

  $('hint-two').addEventListener('click', () => {
    state.hintsTransfer += 1;
    const hints = [
      'A palavra “menores” não inclui o próprio valor 25.',
      'O operador de “menor que” é <. Ele é diferente de <=, que inclui a igualdade.',
      'Um exemplo de condição é: t < 25. Use-a como retorno da função.'
    ];
    addHint('transfer-feedback', 'Dica ' + state.hintsTransfer, hints[Math.min(state.hintsTransfer - 1, 2)]);
    $('check-two').textContent = 'Verificar tentativa com ajuda →';
  });

  $('restart-lab').addEventListener('click', () => {
    state.stage = 1; state.hintsFirst = 0; state.hintsTransfer = 0; state.mistakes = 0;
    $('code-editor').value = initialCode;
    $('transfer-editor').value = initialTransfer;
    $('hint-area').replaceChildren(); $('transfer-feedback').replaceChildren();
    $('task-one').hidden = false; $('task-two').hidden = true; $('task-complete').hidden = true;
    $('stage-1').className = 'stage active'; $('stage-2').className = 'stage';
    $('stage-1').querySelector('b').textContent = '1'; $('stage-2').querySelector('b').textContent = '2';
    $('lesson-message').querySelector('.speaker').textContent = 'Modo Aprender · etapa orientada';
    $('lesson-message').querySelector('p').innerHTML = 'O <code>filter()</code> é uma boa escolha. Veja esta tentativa e descubra qual parte não está funcionando:';
    $('check-two').innerHTML = 'Verificar sem ajuda <span>→</span>';
    $('code-editor').focus();
  });

  const sourceDialog = $('source-dialog');
  const openSources = () => sourceDialog.showModal();
  ['direct-sources', 'open-source-mini', 'open-source-main'].forEach(id => $(id).addEventListener('click', openSources));
  ['close-sources', 'close-sources-bottom'].forEach(id => $(id).addEventListener('click', () => sourceDialog.close()));
  sourceDialog.addEventListener('click', e => { if (e.target === sourceDialog) sourceDialog.close(); });
  const cats = ['consultada', 'recomendada', 'modelo'];
  cats.forEach(cat => {
    $('tab-' + cat).addEventListener('click', () => {
      cats.forEach(c => {
        $('panel-' + c).hidden = c !== cat;
        $('tab-' + c).classList.toggle('selected', c === cat);
        $('tab-' + c).setAttribute('aria-selected', String(c === cat));
      });
    });
  });

  const imgDialog = $('image-dialog');
  document.querySelectorAll('.zoom-btn').forEach(button => {
    button.addEventListener('click', () => {
      $('expanded-image').src = button.dataset.image;
      $('expanded-image').alt = button.dataset.caption;
      $('expanded-caption').textContent = button.dataset.caption;
      imgDialog.showModal();
    });
  });
  $('close-image').addEventListener('click', () => imgDialog.close());
  imgDialog.addEventListener('click', e => { if (e.target === imgDialog) imgDialog.close(); });
})();
