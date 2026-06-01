document.querySelector("[data-banca-form]").addEventListener("submit", async (event) => {
      event.preventDefault();
      const message = document.querySelector("[data-message]");
      const data = Object.fromEntries(new FormData(event.target).entries());

      try {
        const response = await fetch("/Bancas", {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify(data),
        });
        const result = await response.json();

        if (!response.ok) throw new Error(result.message || "Não foi possível criar a banca.");
        window.location.href = `/Bancas/${result.data.id}`;
      } catch (error) {
        message.textContent = error.message;
        message.dataset.type = "error";
      }
    });