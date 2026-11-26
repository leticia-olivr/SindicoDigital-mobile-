const form = document.querySelector('#signup-form');
const message = document.querySelector('#form-message');
const submitButton = document.querySelector('#submit-button');

function showErrors(errors) {
  message.textContent = errors.join(' ');
  message.hidden = false;
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  message.hidden = true;

  const formData = new FormData(form);
  const nome = String(formData.get('nome') ?? '').trim();
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const senha = String(formData.get('senha') ?? '');
  const confirmacaoSenha = String(formData.get('confirmacaoSenha') ?? '');
  const erros = [];

  if (nome.length < 2 || nome.length > 100) {
    erros.push('O nome deve ter entre 2 e 100 caracteres.');
  }

  if (
    email.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ) {
    erros.push('Informe um e-mail válido.');
  }

  if (senha.length < 6) {
    erros.push('A senha deve ter pelo menos 6 caracteres.');
  } else if (new TextEncoder().encode(senha).length > 72) {
    erros.push('A senha deve ter no máximo 72 bytes.');
  }

  if (senha !== confirmacaoSenha) {
    erros.push('A confirmação de senha não confere.');
  }

  if (erros.length > 0) {
    showErrors(erros);
    return;
  }

  submitButton.disabled = true;
  submitButton.textContent = 'Criando conta...';

  try {
    const response = await fetch('/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, email, senha })
    });
    const result = await response.json();

    if (!response.ok) {
      showErrors([
        result.message || 'Não foi possível criar sua conta. Tente novamente.'
      ]);
      return;
    }

    window.location.assign('/login?cadastro=sucesso');
  } catch {
    showErrors([
      'Não foi possível conectar à API. Verifique sua conexão e tente novamente.'
    ]);
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = 'Criar conta';
  }
});
