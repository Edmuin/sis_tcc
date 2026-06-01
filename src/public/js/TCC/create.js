document.querySelector("[data-tcc-form]").addEventListener("submit", async (event) => {
      event.preventDefault();
      const message = document.querySelector("[data-message]");
      const data = new FormData(event.target);
      if (!event.target.elements.relatorio_pdf.files.length) data.delete("relatorio_pdf");

      try {
        const response = await fetch("/tcc", {
          method: "POST",
          headers: { Accept: "application/json" },
          body: data,
        });
        const result = await response.json();

        if (!response.ok) throw new Error(result.message || "Não foi possível criar o TCC.");
        window.location.href = `/tcc/${result.data.id}`;
      } catch (error) {
        message.textContent = error.message;
        message.dataset.type = "error";
      }
    });