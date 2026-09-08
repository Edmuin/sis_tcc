async function loadAreas() {
      const select = document.querySelector("[data-area-select]");
  const escapeHtml = (value) => String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");

      try {
        const response = await fetch("/AreadeFormacao/api", { headers: { Accept: "application/json" } });
        const result = await response.json();
        const rows = result.data || [];
        select.innerHTML = '<option value="">Selecione uma área</option>' + rows.map((row) => (
          `<option value="${escapeHtml(row.id)}">${escapeHtml(row.nome)}</option>`
        )).join("");
      } catch (error) {
        console.error(error);
        select.innerHTML = '<option value="">Não foi possível carregar áreas</option>';
      }
    }

    document.querySelector("[data-curso-form]").addEventListener("submit", async (event) => {
      event.preventDefault();
      const message = document.querySelector("[data-message]");
      const submit = event.target.querySelector("button[type=submit]");
      const data = Object.fromEntries(new FormData(event.target).entries());
      if (submit) { submit.disabled = true; submit.textContent = "A guardar..."; }

      try {
        const response = await fetch("/Curso", {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify(data),
        });
        const result = await response.json();

        if (!response.ok) throw new Error(result.message || "Não foi possível criar o curso.");
        window.location.href = `/Curso/${result.data.id}`;
      } catch (error) {
        message.textContent = error.message;
        message.dataset.type = "error";
      } finally {
        if (submit) { submit.disabled = false; submit.textContent = "Criar Curso"; }
      }
    });

    loadAreas();