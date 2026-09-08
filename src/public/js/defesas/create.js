    const escapeHtml = (value) => String(value ?? "")
      .replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;").replaceAll("'", "&#039;");

    async function loadOptions() {
      const tccSelect = document.querySelector("[data-tcc-select]");
      const bancaSelect = document.querySelector("[data-banca-select]");

      try {
        const [tccResponse, bancaResponse] = await Promise.all([
          fetch("/tcc/api", { headers: { Accept: "application/json" } }),
          fetch("/Bancas/api", { headers: { Accept: "application/json" } }),
        ]);
        const [tccResult, bancaResult] = await Promise.all([tccResponse.json(), bancaResponse.json()]);

        tccSelect.innerHTML = '<option value="">Selecione um TCC</option>' + (tccResult.data || []).map((row) => (
          `<option value="${escapeHtml(row.id)}">${escapeHtml(row.tema || `TCC ${row.id}`)}</option>`
        )).join("");
        bancaSelect.innerHTML = '<option value="">Selecione uma banca</option>' + (bancaResult.data || []).map((row) => (
          `<option value="${escapeHtml(row.id)}">Sala ${escapeHtml(row.sala || "-")}${row.data ? ` - ${escapeHtml(row.data)}` : ""}</option>`
        )).join("");
      } catch (error) {
        console.error(error);
        tccSelect.innerHTML = '<option value="">Não foi possível carregar TCCs</option>';
        bancaSelect.innerHTML = '<option value="">Não foi possível carregar bancas</option>';
      }
    }

    document.querySelector("[data-defesa-form]").addEventListener("submit", async (event) => {
      event.preventDefault();
      const message = document.querySelector("[data-message]");
      const submit = event.target.querySelector("button[type=submit]");
      const data = Object.fromEntries(new FormData(event.target).entries());
      if (submit) { submit.disabled = true; submit.textContent = "A guardar..."; }

      try {
        const response = await fetch("/Defesas", {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify(data),
        });
        const result = await response.json();

        if (!response.ok) throw new Error(result.message || "Não foi possível criar a defesa.");
        window.location.href = `/Defesas/${result.data.id}`;
      } catch (error) {
        message.textContent = error.message;
        message.dataset.type = "error";
      } finally {
        if (submit) { submit.disabled = false; submit.textContent = "Criar Defesa"; }
      }
    });

    loadOptions();