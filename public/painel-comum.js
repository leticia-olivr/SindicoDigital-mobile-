const Painel = (() => {
  const STATUS = {
    ABERTA: 'Aberta',
    EM_ANDAMENTO: 'Em andamento',
    CONCLUIDA: 'Concluída'
  };

  const formatadorData = new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short'
  });

  function nomeStatus(status) {
    return STATUS[status] ?? 'Status desconhecido';
  }

  function formatarData(valor) {
    const data = new Date(valor);
    return Number.isNaN(data.getTime()) ? '—' : formatadorData.format(data);
  }

  function formatarUnidade(ocorrencia) {
    const partes = [];
    if (ocorrencia.bloco) partes.push(`Bloco ${ocorrencia.bloco}`);
    if (ocorrencia.unidade_numero) partes.push(`Unidade ${ocorrencia.unidade_numero}`);
    return partes.length > 0 ? partes.join(', ') : '—';
  }

  function irParaLogin() {
    sessionStorage.removeItem('token');
    window.location.assign('/login');
  }

  // Retorna { ok: true, dados } ou { ok: false, mensagem, redirecionando }.
  async function buscarJson(caminho, mensagens = {}) {
    const token = sessionStorage.getItem('token');

    if (!token) {
      irParaLogin();
      return { ok: false, redirecionando: true };
    }

    let response;
    try {
      response = await fetch(caminho, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch {
      return {
        ok: false,
        mensagem:
          'Não foi possível conectar à API. Verifique sua conexão e tente novamente.'
      };
    }

    if (response.status === 401) {
      irParaLogin();
      return { ok: false, redirecionando: true };
    }

    let corpo = null;
    try {
      corpo = await response.json();
    } catch {
      corpo = null;
    }

    if (response.ok) {
      return { ok: true, dados: corpo };
    }

    if (response.status === 403) {
      return {
        ok: false,
        mensagem:
          mensagens[403] ?? 'Você não tem permissão para acessar este conteúdo.'
      };
    }

    if (response.status === 404) {
      return {
        ok: false,
        mensagem: mensagens[404] ?? 'O conteúdo solicitado não foi encontrado.'
      };
    }

    return {
      ok: false,
      mensagem:
        response.status < 500 && corpo?.message
          ? corpo.message
          : 'A API encontrou um problema. Tente novamente em instantes.'
    };
  }

  return { nomeStatus, formatarData, formatarUnidade, buscarJson };
})();