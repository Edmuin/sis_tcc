const id = window.location.pathname.split("/").filter(Boolean)[1];

    async function loadTcc() {
      const detail = document.querySelector("[data-detail]");
      const response = await fetch(`/tcc/${id}/api`, { headers: { Accept: "application/json" } });
      const result = await response.json();

      if (!response.ok) {
        detail.innerHTML = `<tr><td>${result.message || "TCC não encontrado."}</td></tr>`;
        return;
      }

      const row = result.data;
      document.querySelector("[data-tema]").textContent = row.tema || "TCC sem tema";
      document.querySelector("[data-edit-link]").href = `/tcc/${id}/edit`;
      detail.innerHTML = `
        <tr><th>ID</th><td>${row.id}</td></tr>
        <tr><th>Tema</th><td>${row.tema || "-"}</td></tr>
        <tr><th>Objetivo</th><td>${row.objectivo || "-"}</td></tr>
        <tr><th>Estado</th><td>${row.estado ?? "-"}</td></tr>
        <tr><th>Data de submissão</th><td>${row.data_submissao || "-"}</td></tr>
        <tr><th>ID do estudante</th><td>${row.id_estudante || "-"}</td></tr>
        <tr><th>ID do professor</th><td>${row.id_professor || "-"}</td></tr>
        <tr><th>Relatório</th><td>${row.relatorio_pdf ? `<a class="card-btn" href="${row.relatorio_pdf}" target="_blank" rel="noopener">Abrir PDF</a>` : "-"}</td></tr>
      `;
    }

    document.querySelector("[data-delete]").addEventListener("click", async () => {
      if (!confirm("Deseja eliminar este TCC?")) return;

      const response = await fetch(`/tcc/${id}`, { method: "DELETE", headers: { Accept: "application/json" } });
      if (response.ok) window.location.href = "/tcc";
      else alert("Não foi possível eliminar o TCC.");
    });

    loadTcc();