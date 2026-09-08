const escapeHtml = (value) => String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");

async function loadCursos() {
      const tbody = document.querySelector("[data-curso-list]");

      try {
        const response = await fetch("/Curso/api", { headers: { Accept: "application/json" } });
        const result = await response.json();
        const rows = result.data || [];

        if (rows.length === 0) {
          tbody.innerHTML = '<tr><td colspan="5" class="empty-table-message">Nenhum curso cadastrado.</td></tr>';
          return;
        }

        tbody.innerHTML = rows.map((row) => `
          <tr>
            <td>${escapeHtml(row.nome || "-")}</td>
            <td>${escapeHtml(row.area_formacao_nome || "-")}</td>
            <td>${escapeHtml(row.descricao || "-")}</td>
            <td>${escapeHtml(row.created_at || "-")}</td>
            <td class="table-actions">
              <a class="card-btn" href="/Curso/${encodeURIComponent(row.id)}">Ver</a>
              <a class="card-btn" href="/Curso/${encodeURIComponent(row.id)}/edit">Editar</a>
              <button class="card-btn" type="button" data-delete="${escapeHtml(row.id)}">Eliminar</button>
            </td>
          </tr>
        `).join("");
      } catch (error) {
        console.error(error);
        tbody.innerHTML = '<tr><td colspan="5" class="empty-table-message">Não foi possível carregar os cursos.</td></tr>';
      }
    }

    document.addEventListener("click", async (event) => {
      const button = event.target.closest("[data-delete]");
      if (!button || !confirm("Deseja eliminar este curso?")) return;

      const response = await fetch(`/Curso/${button.dataset.delete}`, { method: "DELETE", headers: { Accept: "application/json" } });
      if (response.ok) loadCursos();
      else alert("Não foi possível eliminar o curso.");
    });

    loadCursos();
