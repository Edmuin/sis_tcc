const id = window.location.pathname.split("/").filter(Boolean)[1];
    const form = document.querySelector("[data-defesa-form]");
    const message = document.querySelector("[data-message]");

    const escapeHtml = (value) => String(value ?? "")
      .replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;").replaceAll("'", "&#039;");

    async function loadOptions(selectedTccId, selectedBancaId) {
      const tccSelect = document.querySelector("[data-tcc-select]");
      const bancaSelect = document.querySelector("[data-banca-select]");

      try {
        const [tccResponse, bancaResponse] = await Promise.all([
          fetch("/tcc/api", { headers: { Accept: "application/json" } }),
          fetch("/Bancas/api", { headers: { Accept: "application/json" } }),
        ]);
        const [tccResult, bancaResult] = await Promise.all([tccResponse.json(), bancaResponse.json()]);

        tccSelect.innerHTML = '<option value="">Selecione um TCC</option>' + (tccResult.data || []).map((row) => (
          `<option value="${escapeHtml(row.id)}" ${String(row.id) === String(selectedTccId) ? "selected" : ""}>${escapeHtml(row.tema || `TCC ${row.id}`)}</option>`
        )).join("");
        bancaSelect.innerHTML = '<option value="">Selecione uma banca</option>' + (bancaResult.data || []).map((row) => (
          `<option value="${escapeHtml(row.id)}" ${String(row.id) === String(selectedBancaId) ? "selected" : ""}>Sala ${escapeHtml(row.sala || "-")}${row.data ? ` - ${escapeHtml(row.data)}` : ""}</option>`
        )).join("");
      } catch (error) {
        console.error(error);
        tccSelect.innerHTML = '<option value="">Não foi possível carregar TCCs</option>';
        bancaSelect.innerHTML = '<option value="">Não foi possível carregar bancas</option>';
      }
    }

    async function loadDefesa() {
      const response = await fetch(`/Defesas/${id}/api`, { headers: { Accept: "application/json" } });
      const result = await response.json();

      if (!response.ok) {
        message.textContent = result.message || "Defesa não encontrada.";
        message.dataset.type = "error";
        return;
      }

      Object.entries(result.data).forEach(([key, value]) => {
        if (!form.elements[key]) return;
        form.elements[key].value = key === "data_defesa" && value ? String(value).slice(0, 10) : value ?? "";
      });
      document.querySelector("[data-show-link]").href = `/Defesas/${id}`;
      await loadOptions(result.data.id_tcc, result.data.id_banca);
    }

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const submit = form.querySelector("button[type=submit]");
      const data = Object.fromEntries(new FormData(form).entries());
      if (submit) { submit.disabled = true; submit.textContent = "A guardar..."; }

      try {
        const response = await fetch(`/Defesas/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify(data),
        });
        const result = await response.json();

        if (!response.ok) throw new Error(result.message || "Não foi possível atualizar a defesa.");
        window.location.href = `/Defesas/${id}`;
      } catch (error) {
        message.textContent = error.message;
        message.dataset.type = "error";
      } finally {
        if (submit) { submit.disabled = false; submit.textContent = "Guardar alterações"; }
      }
    });

    loadDefesa();