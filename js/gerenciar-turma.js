/* ============================================
   TASK SAGA — Lógica Exclusiva: Gerenciar Turma
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    if (!Autenticacao.exigirLogin()) return;
    const usuario = Autenticacao.obterUsuarioAtual();

    const parametros = new URLSearchParams(window.location.search);
    const materiaId = parametros.get('materia');
    if (!materiaId) { window.location.href = 'materias.html'; return; }
    
    const materia = Armazenamento.obterMateriaPorId(materiaId);
    if (!materia) { window.location.href = 'materias.html'; return; }

    const tituloEl = document.getElementById('titulo-turma');
    const subtituloEl = document.getElementById('subtitulo-turma');
    const listaQuests = document.getElementById('lista-quests');
    const progressoPreenchido = document.getElementById('progresso-preenchido');
    
    if (tituloEl) tituloEl.innerHTML = `<span class="material-symbols-outlined" style="font-size: 32px; font-variation-settings: 'FILL' 1;">${materia.icone}</span> Turma de ${materia.nome}`;
    if (subtituloEl) subtituloEl.textContent = `Dungeon Master: ${materia.professor}`;
    
    const nomeHeroiEl = document.getElementById('nome-heroi');
    const classeHeroiEl = document.getElementById('classe-heroi');
    if (nomeHeroiEl && usuario) nomeHeroiEl.textContent = `Level ${usuario.nivelHeroi} ${usuario.nomeUsuario}`;
    if (classeHeroiEl && usuario) classeHeroiEl.textContent = usuario.classeHeroi + ' Class';

    function renderizarTarefas() {
        const tarefas = Armazenamento.obterTarefasPorMateria(materiaId);
        const stats = Armazenamento.obterEstatisticas(materiaId);
        if (progressoPreenchido) progressoPreenchido.style.width = stats.progresso + '%';
        listaQuests.innerHTML = '';
        if (tarefas.length === 0) { 
            listaQuests.innerHTML = `<div class="lista-quests__vazia"><span class="material-symbols-outlined">inventory_2</span>Nenhuma quest encontrada.</div>`; 
            return; 
        }
        
        const ordenadas = [...tarefas].sort((a, b) => {
            if (a.concluida !== b.concluida) return a.concluida ? 1 : -1;
            return new Date(b.criadaEm) - new Date(a.criadaEm);
        });

        ordenadas.forEach(tarefa => {
            const div = document.createElement('div');
            div.className = 'item-tarefa' + (tarefa.concluida ? ' concluida' : '');
            let classeIcone = 'item-tarefa__icone--quest', nomeIcone = 'menu_book';
            if (tarefa.concluida) { classeIcone = 'item-tarefa__icone--feito'; nomeIcone = 'check_circle'; }
            else if (tarefa.nivel >= 4) { classeIcone = 'item-tarefa__icone--boss'; nomeIcone = 'swords'; }

            let classeNivel = 'item-tarefa__nivel--padrao';
            if (tarefa.nivel >= 4) classeNivel = 'item-tarefa__nivel--erro'; else if (tarefa.nivel >= 2) classeNivel = 'item-tarefa__nivel--aviso';
            let classeTitulo = 'item-tarefa__titulo--secundaria';
            if (tarefa.nivel >= 4) classeTitulo = 'item-tarefa__titulo--primaria'; if (tarefa.concluida) classeTitulo = 'item-tarefa__titulo--padrao';

            div.innerHTML = `
                <div class="item-tarefa__icone ${classeIcone}"><span class="material-symbols-outlined">${nomeIcone}</span></div>
                <div class="item-tarefa__conteudo">
                    <div class="item-tarefa__linha-titulo">
                        <h3 class="item-tarefa__titulo ${classeTitulo}">${escaparHtml(tarefa.titulo)}</h3>
                        <span class="item-tarefa__nivel ${classeNivel}">Level ${tarefa.nivel}</span>
                    </div>
                    <p class="item-tarefa__descricao">${escaparHtml(tarefa.descricao)}</p>
                </div>
                <div class="item-tarefa__acoes">
                    <div class="item-tarefa__xp ${tarefa.concluida ? 'item-tarefa__xp--feito' : ''}">
                        <span class="material-symbols-outlined" style="font-size: 16px;">${tarefa.concluida ? 'done_all' : 'stars'}</span>
                        <span>${tarefa.concluida ? 'Loot Coletado' : '+' + tarefa.xp + ' XP Loot'}</span>
                    </div>
                    ${tarefa.concluida ? '' : `
                    <div class="item-tarefa__botoes">
                        <button class="botao-tarefa botao-tarefa--concluir" data-acao="concluir" data-id="${tarefa.id}"><span class="material-symbols-outlined">check</span></button>
                        <button class="botao-tarefa botao-tarefa--editar" data-acao="editar" data-id="${tarefa.id}"><span class="material-symbols-outlined">build</span></button>
                        <button class="botao-tarefa botao-tarefa--remover" data-acao="remover" data-id="${tarefa.id}"><span class="material-symbols-outlined">skull</span></button>
                    </div>`}
                </div>`;
            
            div.querySelectorAll('[data-acao]').forEach(btn => btn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (btn.dataset.acao === 'concluir') { Armazenamento.alternarConclusao(btn.dataset.id); mostrarToast('Quest concluída! Loot coletado!'); renderizarTarefas(); }
                if (btn.dataset.acao === 'editar') abrirModalEditar(btn.dataset.id);
                if (btn.dataset.acao === 'remover') abrirModalRemover(btn.dataset.id);
            }));
            listaQuests.appendChild(div);
        });
    }

    const modalSobreposicao = document.getElementById('modal-tarefa'), modalFormulario = document.getElementById('modal-formulario');
    const inputTitulo = document.getElementById('input-titulo'), inputDescricao = document.getElementById('input-descricao');
    const inputNivel = document.getElementById('input-nivel'), inputXp = document.getElementById('input-xp');
    let editandoTarefaId = null;

    const btnAddQuest = document.getElementById('botao-adicionar-quest');
    if (btnAddQuest) {
        btnAddQuest.addEventListener('click', () => {
            editandoTarefaId = null; document.getElementById('modal-titulo').textContent = 'Nova Quest';
            inputTitulo.value = ''; inputDescricao.value = ''; inputNivel.value = '1'; inputXp.value = '100';
            modalSobreposicao.classList.add('ativo');
        });
    }

    const btnCancelar = document.getElementById('botao-cancelar');
    if (btnCancelar) {
        btnCancelar.addEventListener('click', () => modalSobreposicao.classList.remove('ativo'));
    }

    if (modalFormulario) {
        modalFormulario.addEventListener('submit', (e) => {
            e.preventDefault();
            const titulo = inputTitulo.value.trim(), descricao = inputDescricao.value.trim();
            const nivel = parseInt(inputNivel.value) || 1, xp = parseInt(inputXp.value) || 100;
            if (!titulo) return;
            if (editandoTarefaId) { 
                Armazenamento.atualizarTarefa(editandoTarefaId, { titulo, descricao, nivel, xp }); 
                mostrarToast('Quest atualizada!'); 
            } else { 
                Armazenamento.adicionarTarefa(materiaId, { titulo, descricao, nivel, xp }); 
                mostrarToast('Nova quest adicionada!'); 
            }
            modalSobreposicao.classList.remove('ativo'); renderizarTarefas();
        });
    }

    function abrirModalEditar(id) {
        const tarefa = Armazenamento.obterTarefaPorId(id); if (!tarefa) return;
        editandoTarefaId = id; document.getElementById('modal-titulo').textContent = 'Editar Quest';
        inputTitulo.value = tarefa.titulo; inputDescricao.value = tarefa.descricao; inputNivel.value = tarefa.nivel; inputXp.value = tarefa.xp;
        modalSobreposicao.classList.add('ativo');
    }

    const modalRemover = document.getElementById('modal-remover'), textoRemover = document.getElementById('texto-remover');
    let removendoTarefaId = null;
    function abrirModalRemover(id) {
        const tarefa = Armazenamento.obterTarefaPorId(id); if (!tarefa) return;
        removendoTarefaId = id; textoRemover.innerHTML = `Remover <strong>"${escaparHtml(tarefa.titulo)}"</strong>?`;
        modalRemover.classList.add('ativo');
    }
    
    const btnConfirmarRemover = document.getElementById('botao-confirmar-remover');
    if (btnConfirmarRemover) {
        btnConfirmarRemover.addEventListener('click', () => {
            if (removendoTarefaId) { 
                Armazenamento.removerTarefa(removendoTarefaId); 
                mostrarToast('Quest removida!', 'erro'); 
                removendoTarefaId = null; 
            }
            modalRemover.classList.remove('ativo'); renderizarTarefas();
        });
    }

    const btnCancelarRemover = document.getElementById('botao-cancelar-remover');
    if (btnCancelarRemover) {
        btnCancelarRemover.addEventListener('click', () => modalRemover.classList.remove('ativo'));
    }

    renderizarTarefas();
});
