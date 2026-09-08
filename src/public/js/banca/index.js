const escapeHtml = (value) => String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");

async function loadBancas() {
      const tbody = document.querySelector("[data-banca-list]");

      try {
        const response = await fetch("/Bancas/api", { headers: { Accept: "application/json" } });
        const result = await response.json();
        const rows = result.data || [];

        if (rows.length === 0) {
          tbody.innerHTML = '<tr><td colspan="4" class="empty-table-message">Nenhuma banca cadastrada.</td></tr>';
          return;
        }

        tbody.innerHTML = rows.map((row) => `
          <tr>
            <td>${escapeHtml(row.sala || "-")}</td>
            <td>${escapeHtml(row.data || "-")}</td>
            <td>${escapeHtml(row.created_at || "-")}</td>
            <td class="table-actions">
              <a class="card-btn" href="/Bancas/${encodeURIComponent(row.id)}">Ver</a>
              <a class="card-btn" href="/Bancas/${encodeURIComponent(row.id)}/edit">Editar</a>
              <button class="card-btn" type="button" data-delete="${escapeHtml(row.id)}">Eliminar</button>
            </td>
          </tr>
        `).join("");
      } catch (error) {
        console.error(error);
        tbody.innerHTML = '<tr><td colspan="4" class="empty-table-message">Não foi possível carregar as bancas.</td></tr>';
      }
    }

    document.addEventListener("click", async (event) => {
      const button = event.target.closest("[data-delete]");
      if (!button || !confirm("Deseja eliminar esta banca?")) return;

      const response = await fetch(`/Bancas/${button.dataset.delete}`, { method: "DELETE", headers: { Accept: "application/json" } });
      if (response.ok) loadBancas();
      else alert("Não foi possível eliminar a banca.");
    });

    loadBancas();
