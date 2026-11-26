const form = document.querySelector('#login-form');
const message = document.querySelector('#form-message');
const signupSuccess = document.querySelector('#signup-success');
const submitButton = document.querySelector('#submit-button');

if (new URLSearchParams(window.location.search).get('cadastro') === 'sucesso') {
  signupSuccess.hidden = false;
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  message.hidden = true;

  const formData = new FormData(form);
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const senha = String(formData.get('senha') ?? '');

  if (!email || !senha) {
    message.textContent = 'Informe seu e-mail e sua senha.';
    message.hidden = false;
    return;
  }

  submitButton.disabled = true;
  submitButton.textContent = 'Entrando...';

  try {
    const response = await fetch('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, senha })
    });
    const result = await response.json();

    if (!response.ok) {
      message.textContent =
        result.message || 'Não foi possível entrar. Tente novamente.';
      message.hidden = false;
      return;
    }

    sessionStorage.setItem('token', result.token);
    message.className = 'notice notice-success';
    message.textContent = 'Login realizado com sucesso.';
    message.hidden = false;
  } catch {
    message.textContent =
      'Não foi possível conectar à API. Verifique sua conexão e tente novamente.';
    message.hidden = false;
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = 'Entrar';
  }
});
