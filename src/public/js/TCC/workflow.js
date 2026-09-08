(function () {
  const id = window.location.pathname.split("/").pop();
  const escapeHtml = (value) => String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
  const root = document.querySelector("[data-workflow-root]");
  const role = JSON.parse(localStorage.getItem("user") || "{}").role;
  const isStudent = role === "aluno";
  const canReview = ["tutor", "coordenador", "administrador"].includes(role);
  const isJury = role === "juri";
  const api = (path, options = {}) => fetch(path, { headers: { Accept: "application/json", "Content-Type": "application/json" }, ...options }).then(async (response) => { const data = await response.json(); if (!response.ok) throw new Error(data.message || "Pedido inválido."); return data; });
  const showError = (error) => {
    let message = document.querySelector("[data-workflow-message]");
    if (!message) {
      message = document.createElement("p");
      message.dataset.workflowMessage = "true";
      message.setAttribute("role", "alert");
      message.className = "operational-message";
      root.prepend(message);
    }
    message.textContent = error.message || "Não foi possível concluir a operação.";
  };

  const submitForm = async (event, request) => {
    event.preventDefault();
    const form = event.currentTarget;
    const button = form.querySelector("button[type=submit]");
    if (button) { button.disabled = true; button.dataset.originalText = button.textContent; button.textContent = "A guardar..."; }
    try { await request(form); form.reset(); await render(); }
    catch (error) { showError(error); }
    finally { if (button) { button.disabled = false; button.textContent = button.dataset.originalText; } }
  };

  const render = async () => {
    try {
      const { data } = await api(`/workflow/tcc/${id}`);
      document.querySelector("[data-tcc-title]").textContent = data.tcc.tema || "TCC sem tema definido";
      document.querySelector("[data-tcc-state]").textContent = `Progresso atual: ${data.tcc.estado ?? 0}%`;
      document.querySelector("[data-progress]").textContent = `${data.tcc.estado ?? 0}%`;
      document.querySelector("[data-proposals]").innerHTML = data.proposals.length ? data.proposals.map((item) => `<article class="workflow-item"><strong>${escapeHtml(item.titulo)}</strong><span>${escapeHtml(item.estado)}</span><p>${escapeHtml(item.area_investigacao || "Linha de investigação não definida")}</p><small>${escapeHtml(item.parecer || "Sem parecer")}</small></article>`).join("") : "Nenhuma proposta submetida.";
      document.querySelector("[data-stages]").innerHTML = data.stages.length ? data.stages.map((item) => `<article class="workflow-item"><strong>${escapeHtml(item.nome)}</strong><span>${escapeHtml(item.estado)}</span><p>Prazo: ${escapeHtml(item.prazo || "Não definido")}</p></article>`).join("") : "Nenhuma etapa definida.";
      document.querySelector("[data-submissions]").innerHTML = data.submissions.length ? data.submissions.map((item) => `<article class="workflow-item"><strong>${escapeHtml(item.titulo)}</strong><span>${escapeHtml(item.estado)}</span><p>${escapeHtml(item.comentario || "Aguardando revisão")}</p>${canReview && item.estado === "aguardando_revisao" ? `<button class="card-btn" data-review="${item.id}">Solicitar correção</button>` : ""}</article>`).join("") : "Nenhum documento submetido.";
      document.querySelector("[data-evaluations]").innerHTML = data.evaluations.length ? data.evaluations.map((item) => `<article class="workflow-item"><strong>Nota final: ${escapeHtml(item.nota_final)}</strong><span>${escapeHtml(item.resultado)}</span><p>${escapeHtml(item.observacoes || "Sem observações")}</p></article>`).join("") : "Ainda não existe avaliação.";
      document.querySelector("[data-orientations]").innerHTML = data.orientations.length ? data.orientations.map((item) => `<article class="workflow-item"><strong>${escapeHtml(item.assunto)}</strong><span>${escapeHtml(item.estado)}</span><p>${escapeHtml(item.data_sessao)} · ${escapeHtml(item.observacoes || "Sem observações")}</p></article>`).join("") : "Nenhuma sessão marcada.";
      document.querySelector("[data-proposal-form]").hidden = !isStudent;
      document.querySelector("[data-stage-form]").hidden = !canReview;
      document.querySelector("[data-submission-form]").hidden = !isStudent;
      document.querySelector("[data-evaluation-form]").hidden = !isJury;
      document.querySelector("[data-orientation-form]").hidden = !isStudent;
    } catch (error) {
      root.innerHTML = `<div class="glass-card table-card"><p class="empty-table-message">${escapeHtml(error.message)}</p></div>`;
    }
  };

  document.querySelector("[data-proposal-form]").addEventListener("submit", (event) => submitForm(event, (form) => api(`/workflow/tcc/${id}/proposals`, { method: "POST", body: JSON.stringify(Object.fromEntries(new FormData(form))) })));
  document.querySelector("[data-stage-form]").addEventListener("submit", (event) => submitForm(event, (form) => api(`/workflow/tcc/${id}/stages`, { method: "POST", body: JSON.stringify(Object.fromEntries(new FormData(form))) })));
  document.querySelector("[data-submission-form]").addEventListener("submit", (event) => submitForm(event, async (form) => { const response = await fetch(`/workflow/tcc/${id}/submissions`, { method: "POST", body: new FormData(form) }); if (!response.ok) throw new Error((await response.json()).message || "Não foi possível submeter o documento."); }));
  document.querySelector("[data-evaluation-form]").addEventListener("submit", (event) => submitForm(event, (form) => api(`/workflow/tcc/${id}/evaluations`, { method: "POST", body: JSON.stringify(Object.fromEntries(new FormData(form))) })));
  document.querySelector("[data-orientation-form]").addEventListener("submit", (event) => submitForm(event, (form) => api(`/workflow/tcc/${id}/orientations`, { method: "POST", body: JSON.stringify(Object.fromEntries(new FormData(form))) })));
  document.addEventListener("click", async (event) => { const button = event.target.closest("[data-review]"); if (!button) return; button.disabled = true; try { await api(`/workflow/tcc/${id}/submissions/review`, { method: "POST", body: JSON.stringify({ submissao_id: button.dataset.review, estado: "necessita_correcao", comentario: "Necessita de correção." }) }); await render(); } catch (error) { showError(error); } finally { button.disabled = false; } });
  render();
})();