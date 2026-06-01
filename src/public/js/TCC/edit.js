const id = window.location.pathname.split("/").filter(Boolean)[1];
    const form = document.querySelector("[data-tcc-form]");
    const message = document.querySelector("[data-message]");

    async function loadTcc() {
      const response = await fetch(`/tcc/${id}/api`, { headers: { Accept: "application/json" } });
      const result = await response.json();

      if (!response.ok) {
        message.textContent = result.message || "TCC não encontrado.";
        message.dataset.type = "error";
        return;
      }

      Object.entries(result.data).forEach(([key, value]) => {
        if (!form.elements[key]) return;
        if (form.elements[key].type === "file") return;
        form.elements[key].value = value ?? "";
      });
      document.querySelector("[data-show-link]").href = `/tcc/${id}`;
      document.querySelector("[data-existing-files]").innerHTML = `
        ${result.data.relatorio_pdf ? `<a class="card-btn" href="${result.data.relatorio_pdf}" target="_blank" rel="noopener">Ver relatório</a>` : ""}
      `;
    }

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const data = new FormData(form);
      if (!form.elements.relatorio_pdf.files.length) data.delete("relatorio_pdf");

      try {
        const response = await fetch(`/tcc/${id}`, {
          method: "PUT",
          headers: { Accept: "application/json" },
          body: data,
        });
        const result = await response.json();

        if (!response.ok) throw new Error(result.message || "Não foi possível atualizar o TCC.");
        window.location.href = `/tcc/${id}`;
      } catch (error) {
        message.textContent = error.message;
        message.dataset.type = "error";
      }
    });

    loadTcc();