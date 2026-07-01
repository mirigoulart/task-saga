/* ============================================
   TASK SAGA — Lógica Global (App)
   ============================================ */

// 1. Módulo de Armazenamento Central
const Armazenamento = (() => {
    const CHAVE_SESSAO = 'task_saga_sessao';

    function obterDados(chave) { 
        try { 
            const b = localStorage.getItem(chave); 
            return b ? JSON.parse(b) : null; 
        } catch { return null; } 
    }
    
    function salvarDados(chave, valor) { 
        localStorage.setItem(chave, JSON.stringify(valor)); 
    }
    
    function gerarId() { 
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 6); 
    }
    
    function inicializarMaterias() {
        let materiasAtuais = obterDados('task_saga_materias');
        if (!Array.isArray(materiasAtuais) || materiasAtuais.length === 0 || !materiasAtuais[0].corPrimaria) {
            const materiasIniciais = [
                { id: gerarId(), nome: 'Matemática', professor: 'Prof. Euler', icone: 'calculate', corPrimaria: 'var(--primaria)', corSecundaria: 'var(--primaria-container)', nivel: 3 },
                { id: gerarId(), nome: 'História', professor: 'Dra. Clio', icone: 'history_edu', corPrimaria: 'var(--secundaria)', corSecundaria: 'var(--secundaria-container)', nivel: 2 },
                { id: gerarId(), nome: 'Física', professor: 'Dr. Newton', icone: 'science', corPrimaria: 'var(--terciaria)', corSecundaria: 'var(--terciaria-container)', nivel: 4 },
                { id: gerarId(), nome: 'Geografia', professor: 'Prof. Atlas', icone: 'public', corPrimaria: 'var(--contorno)', corSecundaria: 'var(--contorno-variante)', nivel: 1 }
            ];
            salvarDados('task_saga_materias', materiasIniciais);
        }
    }

    function obterMateriaPorId(id) { 
        const materias = obterDados('task_saga_materias') || []; 
        return materias.find(m => m.id === id) || null; 
    }
    
    function obterTodasTarefas() { 
        return obterDados('task_saga_tarefas') || []; 
    }
    
    function obterTarefasPorMateria(materiaId) { 
        return obterTodasTarefas().filter(t => t.materiaId === materiaId); 
    }
    
    function obterTarefaPorId(tarefaId) { 
        return obterTodasTarefas().find(t => t.id === tarefaId) || null; 
    }
    
    function adicionarTarefa(materiaId, dados) {
        const tarefas = obterTodasTarefas();
        const nova = { 
            id: gerarId(), 
            materiaId, 
            titulo: dados.titulo, 
            descricao: dados.descricao || '', 
            nivel: dados.nivel || 1, 
            xp: dados.xp || 100, 
            concluida: false, 
            criadaEm: new Date().toISOString() 
        };
        tarefas.push(nova); 
        salvarDados('task_saga_tarefas', tarefas); 
        return nova;
    }
    
    function atualizarTarefa(tarefaId, camposAtualizados) {
        const tarefas = obterTodasTarefas(); 
        const indice = tarefas.findIndex(t => t.id === tarefaId);
        if (indice === -1) return null;
        tarefas[indice] = { ...tarefas[indice], ...camposAtualizados }; 
        salvarDados('task_saga_tarefas', tarefas); 
        return tarefas[indice];
    }
    
    function removerTarefa(tarefaId) {
        const tarefas = obterTodasTarefas(); 
        const filtradas = tarefas.filter(t => t.id !== tarefaId);
        if (filtradas.length === tarefas.length) return false;
        salvarDados('task_saga_tarefas', filtradas); 
        return true;
    }
    
    function alternarConclusao(tarefaId) {
        const tarefa = obterTarefaPorId(tarefaId);
        if (!tarefa) return null;
        return atualizarTarefa(tarefaId, { concluida: !tarefa.concluida });
    }
    
    function obterEstatisticas(materiaId) {
        const tarefas = obterTarefasPorMateria(materiaId); 
        const total = tarefas.length;
        const concluidas = tarefas.filter(t => t.concluida).length;
        return { total, concluidas, progresso: total > 0 ? Math.round((concluidas / total) * 100) : 0 };
    }

    return { 
        obterDados, salvarDados, inicializarMaterias, obterMateriaPorId, 
        obterTarefasPorMateria, obterTarefaPorId, adicionarTarefa, 
        atualizarTarefa, removerTarefa, alternarConclusao, obterEstatisticas 
    };
})();

// 2. Módulo de Autenticação Central
const Autenticacao = (() => {
    const CHAVE_SESSAO = 'task_saga_sessao';
    
    function obterSessao() { 
        try { 
            const b = localStorage.getItem(CHAVE_SESSAO); 
            return b ? JSON.parse(b) : null; 
        } catch { return null; } 
    }
    
    function estaAutenticado() { 
        return obterSessao() !== null; 
    }
    
    function sair() { 
        localStorage.removeItem(CHAVE_SESSAO); 
        window.location.href = 'login.html'; 
    }
    
    function exigirLogin() { 
        if (!estaAutenticado()) { 
            window.location.href = 'login.html'; 
            return false; 
        } 
        return true; 
    }

    function realizarLogin(usuario, senha) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (usuario.toLowerCase() === 'heroi' && senha === '1234') {
                    const dadosUsuario = {
                        nomeUsuario: 'Hero',
                        nivelHeroi: 14,
                        classeHeroi: 'Warrior',
                        token: Date.now().toString(36)
                    };
                    localStorage.setItem(CHAVE_SESSAO, JSON.stringify(dadosUsuario));
                    resolve(dadosUsuario);
                } else {
                    reject(new Error('Credenciais de login ou senha incorretos'));
                }
            }, 800);
        });
    }

    return { obterUsuarioAtual: obterSessao, sair, exigirLogin, realizarLogin };
})();

// 3. Funções Utilitárias Globais
function mostrarToast(mensagem, tipo = 'sucesso') {
    let container = document.querySelector('.container-toast');
    if (!container) { 
        container = document.createElement('div'); 
        container.className = 'container-toast'; 
        document.body.appendChild(container); 
    }
    const toast = document.createElement('div'); 
    toast.className = `toast toast-${tipo}`; 
    toast.textContent = mensagem;
    container.appendChild(toast);
    setTimeout(() => { 
        toast.classList.add('toast-sair'); 
        setTimeout(() => toast.remove(), 300); 
    }, 2500);
}

function escaparHtml(texto) { 
    const div = document.createElement('div'); 
    div.textContent = texto; 
    return div.innerHTML; 
}

// Handler Global de Logout
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-acao="sair"]').forEach(btn => {
        btn.addEventListener('click', (e) => { 
            e.preventDefault(); 
            Autenticacao.sair(); 
        });
    });
});
