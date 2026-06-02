     const estadoLabels = {
      rascunho: "Rascunho",
      submetido: "Submetido",
      em_analise: "Em análise",
      aprovado: "Aprovado",
      rejeitado: "Rejeitado",
      agendado_defesa: "Agendado para defesa",
      defendido: "Defendido",
     };

     async function loadTccs() {
      const tbody = document.querySelector("[data-tcc-list]");

      try {
        const response = await fetch("/tcc/api", { headers: { Accept: "application/json" } });
        const result = await response.json();
        const rows = result.data || [];

        if (rows.length === 0) {
          tbody.innerHTML = '<tr><td colspan="8" class="empty-table-message">Nenhum TCC cadastrado.</td></tr>';
          return;
        }

        tbody.innerHTML = rows.map((row) => `
          <tr>
            <td>${row.tema || "-"}</td>
            <td>${row.tipo || "individual"}</td>
            <td>${estadoLabels[row.estado] || row.estado || "-"}</td>
            <td>${row.data_submissao ? String(row.data_submissao).slice(0, 10) : "-"}</td>
            <td>${(row.estudantes_nomes || []).join(", ") || row.estudante_nome || "-"}</td>
            <td>${row.professor_nome || (row.id_professor ? `Professor ${row.id_professor}` : "-")}</td>
            <td>${row.relatorio_pdf ? `<a class="card-btn" href="${row.relatorio_pdf}" target="_blank" rel="noopener">PDF</a>` : "-"}</td>
            <td class="table-actions">
              <a class="card-btn" href="/tcc/${row.id}">Ver</a>
              <a class="card-btn" href="/tcc/${row.id}/edit">Editar</a>
              <button class="card-btn" type="button" data-delete="${row.id}">Eliminar</button>
            </td>
          </tr>
        `).join("");
      } catch (error) {
        console.error(error);
        tbody.innerHTML = '<tr><td colspan="8" class="empty-table-message">Não foi possível carregar os TCCs.</td></tr>';
      }
    }

    document.addEventListener("click", async (event) => {
      const button = event.target.closest("[data-delete]");
      if (!button || !confirm("Deseja eliminar este TCC?")) return;

      const response = await fetch(`/tcc/${button.dataset.delete}`, { method: "DELETE", headers: { Accept: "application/json" } });
      if (response.ok) loadTccs();
      else alert("Não foi possível eliminar o TCC.");
    });

    loadTccs();
