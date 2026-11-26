const carregando = document.querySelector('#estado-carregando');
const erro = document.querySelector('#estado-erro');
const erroTexto = document.querySelector('#erro-texto');
const vazio = document.querySelector('#estado-vazio');
const lista = document.querySelector('#lista');
const botaoTentarNovamente = document.querySelector('#tentar-novamente');

function mostrarSomente(elemento) {
  for (const item of [carregando, erro, vazio, lista]) {
    item.hidden = item !== elemento;
  }
}

function criarTexto(tag, classe, texto) {
  const elemento = document.createElement(tag);
  if (classe) elemento.className = classe;
  elemento.textContent = texto;
  return elemento;
}

function criarItem(ocorrencia) {
  const item = document.createElement('li');
  const link = document.createElement('a');
  link.className = 'ocorrencia-item';
  link.href = `/painel/ocorrencias/${encodeURIComponent(ocorrencia.id)}`;

  const topo = document.createElement('div');
  topo.className = 'ocorrencia-topo';
  topo.append(
    criarTexto('h2', 'ocorrencia-titulo', ocorrencia.titulo),
    criarTexto(
      'span',
      `status status-${String(ocorrencia.status).toLowerCase()}`,
      Painel.nomeStatus(ocorrencia.status)
    )
  );

  const meta = document.createElement('p');
  meta.className = 'ocorrencia-meta';
  meta.append(
    criarTexto('span', '', `Categoria: ${ocorrencia.categoria_nome ?? '—'}`),
    criarTexto('span', '', Painel.formatarUnidade(ocorrencia)),
    criarTexto('span', '', Painel.formatarData(ocorrencia.criado_em))
  );

  link.append(topo, meta);
  item.append(link);
  return item;
}

async function carregarOcorrencias() {
  mostrarSomente(carregando);

  const resultado = await Painel.buscarJson('/ocorrencias', {
    403: 'Você não tem permissão para ver as ocorrências.'
  });

  if (!resultado.ok) {
    if (resultado.redirecionando) return;
    erroTexto.textContent = resultado.mensagem;
    mostrarSomente(erro);
    return;
  }

  const ocorrencias = Array.isArray(resultado.dados?.ocorrencias)
    ? resultado.dados.ocorrencias
    : [];

  if (ocorrencias.length === 0) {
    mostrarSomente(vazio);
    return;
  }

  lista.replaceChildren(...ocorrencias.map(criarItem));
  mostrarSomente(lista);
}

botaoTentarNovamente.addEventListener('click', carregarOcorrencias);
carregarOcorrencias();