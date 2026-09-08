const id = window.location.pathname.split("/").filter(Boolean)[1];
const escapeHtml = (value) => String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");

    async function loadArea() {
      const detail = document.querySelector("[data-detail]");
      const response = await fetch(`/AreadeFormacao/${id}/api`, { headers: { Accept: "application/json" } });
      const result = await response.json();

      if (!response.ok) {
        detail.innerHTML = `<tr><td>${escapeHtml(result.message || "Área de formação não encontrada.")}</td></tr>`;
        return;
      }

      const row = result.data;
      document.querySelector("[data-nome]").textContent = row.nome || "Área sem nome";
      document.querySelector("[data-edit-link]").href = `/AreadeFormacao/${id}/edit`;
      detail.innerHTML = `
        <tr><th>ID</th><td>${escapeHtml(row.id)}</td></tr>
        <tr><th>Nome</th><td>${escapeHtml(row.nome || "-")}</td></tr>
        <tr><th>Descrição</th><td>${escapeHtml(row.descricao || "-")}</td></tr>
        <tr><th>Criada em</th><td>${escapeHtml(row.created_at || "-")}</td></tr>
        <tr><th>Atualizada em</th><td>${escapeHtml(row.updated_at || "-")}</td></tr>
      `;
    }

    document.querySelector("[data-delete]").addEventListener("click", async () => {
      if (!confirm("Deseja eliminar esta área de formação?")) return;

      const response = await fetch(`/AreadeFormacao/${id}`, { method: "DELETE", headers: { Accept: "application/json" } });
      if (response.ok) window.location.href = "/AreadeFormacao";
      else alert("Não foi possível eliminar a área de formação.");
    });

    loadArea();
