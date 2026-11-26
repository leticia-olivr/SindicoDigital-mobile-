const carregando = document.querySelector('#estado-carregando');
const erro = document.querySelector('#estado-erro');
const erroTexto = document.querySelector('#erro-texto');
const detalhe = document.querySelector('#detalhe');
const titulo = document.querySelector('#page-title');
const botaoTentarNovamente = document.querySelector('#tentar-novamente');

const idDaUrl = window.location.pathname.split('/').filter(Boolean).pop();

function mostrarSomente(elemento) {
  for (const item of [carregando, erro, detalhe]) {
    item.hidden = item !== elemento;
  }
}

function preencher(ocorrencia) {
  const status = document.querySelector('#detalhe-status');

  titulo.textContent = ocorrencia.titulo;
  document.title = `${ocorrencia.titulo} | SíndicoDigital`;
  status.textContent = Painel.nomeStatus(ocorrencia.status);
  status.className = `status status-${String(ocorrencia.status).toLowerCase()}`;
  document.querySelector('#detalhe-categoria').textContent =
    ocorrencia.categoria_nome ?? '—';
  document.querySelector('#detalhe-unidade').textContent =
    Painel.formatarUnidade(ocorrencia);
  document.querySelector('#detalhe-data').textContent = Painel.formatarData(
    ocorrencia.criado_em
  );
  document.querySelector('#detalhe-descricao').textContent =
    ocorrencia.descricao ?? '—';
}

async function carregarOcorrencia() {
  if (!/^[1-9]\d*$/.test(idDaUrl ?? '')) {
    erroTexto.textContent = 'O endereço da ocorrência é inválido.';
    botaoTentarNovamente.hidden = true;
    mostrarSomente(erro);
    return;
  }

  mostrarSomente(carregando);

  const resultado = await Painel.buscarJson(
    `/ocorrencias/${encodeURIComponent(idDaUrl)}`,
    {
      403: 'Você não tem permissão para ver esta ocorrência.',
      404: 'Ocorrência não encontrada.'
    }
  );

  if (!resultado.ok) {
    if (resultado.redirecionando) return;
    erroTexto.textContent = resultado.mensagem;
    mostrarSomente(erro);
    return;
  }

  if (!resultado.dados?.ocorrencia) {
    erroTexto.textContent = 'A API devolveu uma resposta inesperada.';
    mostrarSomente(erro);
    return;
  }

  preencher(resultado.dados.ocorrencia);
  mostrarSomente(detalhe);
}

botaoTentarNovamente.addEventListener('click', carregarOcorrencia);
carregarOcorrencia();