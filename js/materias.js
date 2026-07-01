/* ============================================
   TASK SAGA — Lógica Exclusiva: Matérias
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    // Requer login
    if (!Autenticacao.exigirLogin()) return;

    const usuario = Autenticacao.obterUsuarioAtual();
    Armazenamento.inicializarMaterias();

    // Atualiza nome do herói na UI
    const nomeHeroiEl = document.getElementById('nome-heroi');
    const classeHeroiEl = document.getElementById('classe-heroi');
    if (nomeHeroiEl && usuario) nomeHeroiEl.textContent = `Level ${usuario.nivelHeroi} ${usuario.nomeUsuario}`;
    if (classeHeroiEl && usuario) classeHeroiEl.textContent = usuario.classeHeroi + ' Class';

    const gridMaterias = document.getElementById('grid-materias');
    const materias = Armazenamento.obterDados('task_saga_materias') || [];

    if (gridMaterias) {
        gridMaterias.innerHTML = '';
        materias.forEach(materia => {
            const stats = Armazenamento.obterEstatisticas(materia.id);
            const tarefas = Armazenamento.obterTarefasPorMateria(materia.id);
            const tarefasPendentes = tarefas.filter(t => !t.concluida).slice(0, 3);
            
            let htmlTarefas = '';
            if (tarefasPendentes.length > 0) {
                htmlTarefas = `<ul class="card-materia__lista-tarefas">`;
                tarefasPendentes.forEach(t => {
                    htmlTarefas += `<li>${escaparHtml(t.titulo)}</li>`;
                });
                htmlTarefas += `</ul>`;
            } else if (tarefas.length > 0) {
                htmlTarefas = `<p class="card-materia__sem-tarefas">Todas as quests limpas!</p>`;
            } else {
                htmlTarefas = `<p class="card-materia__sem-tarefas">Dungeon Master não passou quests.</p>`;
            }

            let sufixoClasse = 'padrao';
            if (materia.corPrimaria) {
                if (materia.corPrimaria.includes('primaria')) sufixoClasse = 'primaria';
                else if (materia.corPrimaria.includes('secundaria')) sufixoClasse = 'secundaria';
                else if (materia.corPrimaria.includes('terciaria')) sufixoClasse = 'terciaria';
                else if (materia.corPrimaria.includes('contorno')) sufixoClasse = 'contorno';
            }

            const card = document.createElement('div');
            card.className = 'card-materia';
            card.onclick = () => window.location.href = `gerenciar-turma.html?materia=${materia.id}`;
            card.innerHTML = `
                <div class="card-materia__faixa card-materia__faixa--${sufixoClasse}"></div>
                <div class="card-materia__cabecalho">
                    <div class="card-materia__info">
                        <div class="card-materia__icone-wrapper">
                            <span class="material-symbols-outlined card-materia__icone--${sufixoClasse}" style="font-variation-settings: 'FILL' 1;">${materia.icone}</span>
                        </div>
                        <div>
                            <h3 class="card-materia__nome">${escaparHtml(materia.nome)}</h3>
                            <p style="font-family: var(--fonte-rotulo); font-size: 10px; color: var(--sobre-superficie-variante); margin-top: 2px;">${escaparHtml(materia.professor)}</p>
                        </div>
                    </div>
                    <span class="card-materia__nivel card-materia__nivel--${materia.nivel >= 3 ? 'erro' : 'padrao'}">Lv.${materia.nivel}</span>
                </div>
                <div class="card-materia__corpo">
                    <p class="card-materia__rotulo-pendente">Quests Pendentes:</p>
                    ${htmlTarefas}
                </div>
                <div class="card-materia__xp">
                    <div class="card-materia__xp-info">
                        <span>Progresso</span>
                        <span>${stats.progresso}%</span>
                    </div>
                    <div class="card-materia__barra-xp">
                        <div class="card-materia__xp-preenchido card-materia__xp-preenchido--${sufixoClasse}" style="width: ${stats.progresso}%"></div>
                        <div class="card-materia__brilho-xp"></div>
                    </div>
                </div>
                <div class="card-materia__overlay">
                    <button class="botao-iniciar-quest botao-iniciar-quest--${sufixoClasse}">Entrar</button>
                </div>
            `;
            gridMaterias.appendChild(card);
        });
    }
});
