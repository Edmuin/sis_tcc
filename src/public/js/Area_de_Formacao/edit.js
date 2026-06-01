const id = window.location.pathname.split("/").filter(Boolean)[1];
    const form = document.querySelector("[data-area-form]");
    const message = document.querySelector("[data-message]");

    async function loadArea() {
      const response = await fetch(`/AreadeFormacao/${id}/api`, { headers: { Accept: "application/json" } });
      const result = await response.json();

      if (!response.ok) {
        message.textContent = result.message || "Área de formação não encontrada.";
        message.dataset.type = "error";
        return;
      }

      Object.entries(result.data).forEach(([key, value]) => {
        if (!form.elements[key]) return;
        form.elements[key].value = value ?? "";
      });
      document.querySelector("[data-show-link]").href = `/AreadeFormacao/${id}`;
    }

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const data = Object.fromEntries(new FormData(form).entries());

      try {
        const response = await fetch(`/AreadeFormacao/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify(data),
        });
        const result = await response.json();

        if (!response.ok) throw new Error(result.message || "Não foi possível atualizar a área de formação.");
        window.location.href = `/AreadeFormacao/${id}`;
      } catch (error) {
        message.textContent = error.message;
        message.dataset.type = "error";
      }
    });

    loadArea();