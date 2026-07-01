/* ============================================
   TASK SAGA — Lógica Exclusiva: Login
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    // Redireciona se já estiver logado
    if (Autenticacao.obterUsuarioAtual() !== null) {
        window.location.href = 'materias.html';
        return;
    }

    const formLogin = document.getElementById('form-login');
    const inputUsuario = document.getElementById('usuario');
    const inputSenha = document.getElementById('senha');
    const alternarSenha = document.getElementById('alternar-senha');
    const btnSubmit = document.getElementById('btn-submit');
    const msgErro = document.getElementById('mensagem-erro');
    const rotuloBotao = document.getElementById('rotulo-botao');

    // Alternar visualização da senha
    if (alternarSenha) {
        alternarSenha.addEventListener('click', () => {
            const tipo = inputSenha.getAttribute('type') === 'password' ? 'text' : 'password';
            inputSenha.setAttribute('type', tipo);
            alternarSenha.textContent = tipo === 'password' ? 'visibility_off' : 'visibility';
        });
    }

    // Processar formulário de login
    if (formLogin) {
        formLogin.addEventListener('submit', async (e) => {
            e.preventDefault();
            const usuario = inputUsuario.value.trim();
            const senha = inputSenha.value;

            if (!usuario || !senha) {
                mostrarErro('Preencha o nome do herói e a senha secreta.');
                return;
            }

            msgErro.classList.remove('visivel');
            btnSubmit.disabled = true;
            btnSubmit.style.opacity = '0.7';
            rotuloBotao.textContent = 'Autenticando...';

            try {
                // Utiliza módulo global para login
                await Autenticacao.realizarLogin(usuario, senha);
                // Inicializa matérias (Seed)
                Armazenamento.inicializarMaterias();
                window.location.href = 'materias.html';
            } catch (erro) {
                mostrarErro('Login falhou. Verifique se usou "heroi" e "1234".');
                btnSubmit.disabled = false;
                btnSubmit.style.opacity = '1';
                rotuloBotao.textContent = 'ENTER DUNGEON';
                inputSenha.value = '';
                inputSenha.focus();
            }
        });
    }

    function mostrarErro(mensagem) {
        msgErro.textContent = mensagem;
        msgErro.classList.add('visivel');
        setTimeout(() => msgErro.classList.remove('visivel'), 5000);
    }
});
