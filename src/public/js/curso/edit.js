const id = window.location.pathname.split("/").filter(Boolean)[1];
    const form = document.querySelector("[data-curso-form]");
    const message = document.querySelector("[data-message]");

    async function loadAreas(selectedAreaId) {
      const select = document.querySelector("[data-area-select]");

      try {
        const response = await fetch("/AreadeFormacao/api", { headers: { Accept: "application/json" } });
        const result = await response.json();
        const rows = result.data || [];
        select.innerHTML = '<option value="">Selecione uma área</option>' + rows.map((row) => (
          `<option value="${row.id}" ${String(row.id) === String(selectedAreaId) ? "selected" : ""}>${row.nome}</option>`
        )).join("");
      } catch (error) {
        console.error(error);
        select.innerHTML = '<option value="">Não foi possível carregar áreas</option>';
      }
    }

    async function loadCurso() {
      const response = await fetch(`/Curso/${id}/api`, { headers: { Accept: "application/json" } });
      const result = await response.json();

      if (!response.ok) {
        message.textContent = result.message || "Curso não encontrado.";
        message.dataset.type = "error";
        return;
      }

      Object.entries(result.data).forEach(([key, value]) => {
        if (!form.elements[key]) return;
        form.elements[key].value = value ?? "";
      });
      document.querySelector("[data-show-link]").href = `/Curso/${id}`;
      await loadAreas(result.data.area_formacao_id);
    }

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const data = Object.fromEntries(new FormData(form).entries());

      try {
        const response = await fetch(`/Curso/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify(data),
        });
        const result = await response.json();

        if (!response.ok) throw new Error(result.message || "Não foi possível atualizar o curso.");
        window.location.href = `/Curso/${id}`;
      } catch (error) {
        message.textContent = error.message;
        message.dataset.type = "error";
      }
    });

    loadCurso();