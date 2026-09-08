    const escapeHtml = (value) => String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

     async function loadDefesas() {
      const tbody = document.querySelector("[data-defesa-list]");

      try {
        const response = await fetch("/Defesas/api", { headers: { Accept: "application/json" } });
        const result = await response.json();
        const rows = result.data || [];

        if (rows.length === 0) {
          tbody.innerHTML = '<tr><td colspan="5" class="empty-table-message">Nenhuma defesa cadastrada.</td></tr>';
          return;
        }

        tbody.innerHTML = rows.map((row) => `
          <tr>
            <td>${escapeHtml(row.tcc_tema || "-")}</td>
            <td>${escapeHtml(row.banca_sala || "-")}</td>
            <td>${escapeHtml(row.data_defesa || "-")}</td>
            <td>${escapeHtml(row.resultado || "-")}</td>
            <td class="table-actions">
              <a class="card-btn" href="/Defesas/${row.id}">Ver</a>
              <a class="card-btn" href="/Defesas/${row.id}/edit">Editar</a>
              <button class="card-btn" type="button" data-delete="${row.id}">Eliminar</button>
            </td>
          </tr>
        `).join("");
      } catch (error) {
        console.error(error);
        tbody.innerHTML = '<tr><td colspan="5" class="empty-table-message">Não foi possível carregar as defesas.</td></tr>';
      }
    }

    document.addEventListener("click", async (event) => {
      const button = event.target.closest("[data-delete]");
      if (!button || !confirm("Deseja eliminar esta defesa?")) return;

      const response = await fetch(`/Defesas/${button.dataset.delete}`, { method: "DELETE", headers: { Accept: "application/json" } });
      if (response.ok) loadDefesas();
      else alert("Não foi possível eliminar a defesa.");
    });

    loadDefesas();