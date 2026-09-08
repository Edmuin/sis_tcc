const id = window.location.pathname.split("/").filter(Boolean)[1];
const escapeHtml = (value) => String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");

    async function loadDefesa() {
      const detail = document.querySelector("[data-detail]");
      const response = await fetch(`/Defesas/${id}/api`, { headers: { Accept: "application/json" } });
      const result = await response.json();

      if (!response.ok) {
        detail.innerHTML = `<tr><td>${escapeHtml(result.message || "Defesa não encontrada.")}</td></tr>`;
        return;
      }

      const row = result.data;
      document.querySelector("[data-title]").textContent = row.tcc_tema || `Defesa ${row.id}`;
      document.querySelector("[data-edit-link]").href = `/Defesas/${id}/edit`;
      detail.innerHTML = `
        <tr><th>ID</th><td>${escapeHtml(row.id)}</td></tr>
        <tr><th>TCC</th><td>${escapeHtml(row.tcc_tema || "-")}</td></tr>
        <tr><th>Banca</th><td>Sala ${escapeHtml(row.banca_sala || "-")}</td></tr>
        <tr><th>Data da banca</th><td>${escapeHtml(row.banca_data || "-")}</td></tr>
        <tr><th>Data da defesa</th><td>${escapeHtml(row.data_defesa || "-")}</td></tr>
        <tr><th>Resultado</th><td>${escapeHtml(row.resultado || "-")}</td></tr>
        <tr><th>Criada em</th><td>${escapeHtml(row.created_at || "-")}</td></tr>
        <tr><th>Atualizada em</th><td>${escapeHtml(row.updated_at || "-")}</td></tr>
      `;
    }

    document.querySelector("[data-delete]").addEventListener("click", async () => {
      if (!confirm("Deseja eliminar esta defesa?")) return;

      const response = await fetch(`/Defesas/${id}`, { method: "DELETE", headers: { Accept: "application/json" } });
      if (response.ok) window.location.href = "/Defesas";
      else alert("Não foi possível eliminar a defesa.");
    });

    loadDefesa();
