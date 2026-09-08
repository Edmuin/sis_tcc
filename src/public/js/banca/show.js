const id = window.location.pathname.split("/").filter(Boolean)[1];
const escapeHtml = (value) => String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");

    async function loadBanca() {
      const detail = document.querySelector("[data-detail]");
      const response = await fetch(`/Bancas/${id}/api`, { headers: { Accept: "application/json" } });
      const result = await response.json();

      if (!response.ok) {
        detail.innerHTML = `<tr><td>${escapeHtml(result.message || "Banca não encontrada.")}</td></tr>`;
        return;
      }

      const row = result.data;
      document.querySelector("[data-title]").textContent = `Banca da sala ${row.sala || "-"}`;
      document.querySelector("[data-edit-link]").href = `/Bancas/${id}/edit`;
      detail.innerHTML = `
        <tr><th>ID</th><td>${escapeHtml(row.id)}</td></tr>
        <tr><th>Sala</th><td>${escapeHtml(row.sala || "-")}</td></tr>
        <tr><th>Data</th><td>${escapeHtml(row.data || "-")}</td></tr>
        <tr><th>Criada em</th><td>${escapeHtml(row.created_at || "-")}</td></tr>
        <tr><th>Atualizada em</th><td>${escapeHtml(row.updated_at || "-")}</td></tr>
      `;
    }

    document.querySelector("[data-delete]").addEventListener("click", async () => {
      if (!confirm("Deseja eliminar esta banca?")) return;

      const response = await fetch(`/Bancas/${id}`, { method: "DELETE", headers: { Accept: "application/json" } });
      if (response.ok) window.location.href = "/Bancas";
      else alert("Não foi possível eliminar a banca.");
    });

    loadBanca();
