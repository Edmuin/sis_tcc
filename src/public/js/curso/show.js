const id = window.location.pathname.split("/").filter(Boolean)[1];

    async function loadCurso() {
      const detail = document.querySelector("[data-detail]");
      const response = await fetch(`/Curso/${id}/api`, { headers: { Accept: "application/json" } });
      const result = await response.json();

      if (!response.ok) {
        detail.innerHTML = `<tr><td>${result.message || "Curso não encontrado."}</td></tr>`;
        return;
      }

      const row = result.data;
      document.querySelector("[data-nome]").textContent = row.nome || "Curso sem nome";
      document.querySelector("[data-edit-link]").href = `/Curso/${id}/edit`;
      detail.innerHTML = `
        <tr><th>ID</th><td>${row.id}</td></tr>
        <tr><th>Nome</th><td>${row.nome || "-"}</td></tr>
        <tr><th>Área de Formação</th><td>${row.area_formacao_nome || "-"}</td></tr>
        <tr><th>Descrição</th><td>${row.descricao || "-"}</td></tr>
        <tr><th>Criado em</th><td>${row.created_at || "-"}</td></tr>
        <tr><th>Atualizado em</th><td>${row.updated_at || "-"}</td></tr>
      `;
    }

    document.querySelector("[data-delete]").addEventListener("click", async () => {
      if (!confirm("Deseja eliminar este curso?")) return;

      const response = await fetch(`/Curso/${id}`, { method: "DELETE", headers: { Accept: "application/json" } });
      if (response.ok) window.location.href = "/Curso";
      else alert("Não foi possível eliminar o curso.");
    });

    loadCurso();