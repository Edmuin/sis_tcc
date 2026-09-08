document.querySelector("[data-area-form]").addEventListener("submit", async (event) => {
      event.preventDefault();
      const message = document.querySelector("[data-message]");
      const submit = event.target.querySelector("button[type=submit]");
      const data = Object.fromEntries(new FormData(event.target).entries());
      if (submit) { submit.disabled = true; submit.textContent = "A guardar..."; }

      try {
        const response = await fetch("/AreadeFormacao", {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify(data),
        });
        const result = await response.json();

        if (!response.ok) throw new Error(result.message || "Não foi possível criar a área de formação.");
        window.location.href = `/AreadeFormacao/${result.data.id}`;
      } catch (error) {
        message.textContent = error.message;
        message.dataset.type = "error";
      } finally {
        if (submit) { submit.disabled = false; submit.textContent = "Criar Área"; }
      }
    });