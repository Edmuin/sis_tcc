const id = window.location.pathname.split("/").filter(Boolean)[1];
const estadoLabels = {
  rascunho: "Rascunho",
  submetido: "Submetido",
  em_analise: "Em análise",
  aprovado: "Aprovado",
  rejeitado: "Rejeitado",
  agendado_defesa: "Agendado para defesa",
  defendido: "Defendido",
};

const actionsByState = {
  rascunho: [["submeter", "Submeter"]],
  rejeitado: [["submeter", "Submeter novamente"]],
  submetido: [["analisar", "Colocar em análise"], ["aprovar", "Aprovar"], ["rejeitar", "Rejeitar"]],
  em_analise: [["aprovar", "Aprovar"], ["rejeitar", "Rejeitar"]],
};

let currentTcc = null;

const escapeHtml = (value) => String(value ?? "")
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#039;");

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value).slice(0, 10);
  return new Intl.DateTimeFormat("pt-PT", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

function renderHistory(rows = []) {
  const tbody = document.querySelector("[data-history]");
  if (!tbody) return;

  if (rows.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="empty-table-message">Ainda não há histórico para este TCC.</td></tr>';
    return;
  }

  tbody.innerHTML = rows.map((row) => {
    const estadoAnterior = estadoLabels[row.estado_anterior] || row.estado_anterior;
    const estadoNovo = estadoLabels[row.estado_novo] || row.estado_novo;
    const estado = estadoAnterior ? `${estadoAnterior} → ${estadoNovo}` : estadoNovo;

    return `
      <tr>
        <td>${formatDate(row.created_at)}</td>
        <td>${escapeHtml(row.acao || "-")}</td>
        <td>${escapeHtml(estado || "-")}</td>
        <td>${escapeHtml(row.responsavel || "Sistema")}</td>
        <td>${escapeHtml(row.observacao || "-")}</td>
      </tr>
    `;
  }).join("");
}

function renderStatusActions(row) {
  const container = document.querySelector("[data-status-actions]");
  if ((row.estado || "rascunho") === "aprovado") {
    container.innerHTML = `<a class="btn btn-secondary" href="/Defesas/create?tcc=${row.id}">Marcar defesa</a>`;
    return;
  }

  if ((row.estado || "rascunho") === "agendado_defesa") {
    container.innerHTML = '<a class="btn btn-secondary" href="/Defesas">Ver defesas</a>';
    return;
  }

  const actions = actionsByState[row.estado || "rascunho"] || [];

  if (actions.length === 0) {
    container.innerHTML = "";
    return;
  }

  container.innerHTML = actions.map(([action, label]) => (
    `<button class="btn btn-secondary" type="button" data-status-action="${action}">${label}</button>`
  )).join("");
}

    async function loadTcc() {
      const detail = document.querySelector("[data-detail]");
      const response = await fetch(`/tcc/${id}/api`, { headers: { Accept: "application/json" } });
      const result = await response.json();

      if (!response.ok) {
        detail.innerHTML = `<tr><td>${result.message || "TCC não encontrado."}</td></tr>`;
        return;
      }

      const row = result.data;
      currentTcc = row;
      const estudantes = row.estudantes || [];
      const participantes = estudantes.map((estudante) => {
        const nome = estudante.estudante_nome || `Estudante ${estudante.id_estudante}`;
        const detalhes = [estudante.numero_estudante, estudante.turma, estudante.curso_nome].filter(Boolean).join(" - ");
        return detalhes ? `${nome} (${detalhes})` : nome;
      });
      document.querySelector("[data-tema]").textContent = row.tema || "TCC sem tema";
      document.querySelector("[data-edit-link]").href = `/tcc/${id}/edit`;
      detail.innerHTML = `
        <tr><th>ID</th><td>${row.id}</td></tr>
        <tr><th>Tema</th><td>${row.tema || "-"}</td></tr>
        <tr><th>Objetivo</th><td>${row.objectivo || "-"}</td></tr>
        <tr><th>Tipo</th><td>${row.tipo || "individual"}</td></tr>
        <tr><th>Estado</th><td>${estadoLabels[row.estado] || row.estado || "-"}</td></tr>
        <tr><th>Observação</th><td>${row.observacao || "-"}</td></tr>
        <tr><th>Data de submissão</th><td>${row.data_submissao ? String(row.data_submissao).slice(0, 10) : "-"}</td></tr>
        <tr><th>Alunos</th><td>${participantes.join("<br>") || row.estudante_nome || "-"}</td></tr>
        <tr><th>Orientador</th><td>${row.professor_nome || (row.id_professor ? `Professor ${row.id_professor}` : "-")}</td></tr>
        <tr><th>Relatório</th><td>${row.relatorio_pdf ? `<a class="card-btn" href="${row.relatorio_pdf}" target="_blank" rel="noopener">Abrir PDF</a>` : "-"}</td></tr>
      `;
      renderStatusActions(row);
      renderHistory(row.historico || []);
    }

    document.querySelector("[data-delete]").addEventListener("click", async () => {
      if (!confirm("Deseja eliminar este TCC?")) return;

      const response = await fetch(`/tcc/${id}`, { method: "DELETE", headers: { Accept: "application/json" } });
      if (response.ok) window.location.href = "/tcc";
      else alert("Não foi possível eliminar o TCC.");
    });

    document.addEventListener("click", async (event) => {
      const button = event.target.closest("[data-status-action]");
      if (!button) return;

      const observacao = prompt("Observação para esta ação:", currentTcc?.observacao || "");
      if (observacao === null) return;

      const message = document.querySelector("[data-message]");
      try {
        const response = await fetch(`/tcc/${id}/status`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({ acao: button.dataset.statusAction, observacao }),
        });
        const result = await response.json();

        if (!response.ok) throw new Error(result.message || "Não foi possível atualizar o estado.");
        message.textContent = "Estado atualizado com sucesso.";
        message.dataset.type = "success";
        await loadTcc();
      } catch (error) {
        message.textContent = error.message;
        message.dataset.type = "error";
      }
    });

    loadTcc();
