document.addEventListener("DOMContentLoaded", async () => {
    const areaSelect = document.getElementById("area_formacao");
    if (!areaSelect) return;

    try {
        const response = await fetch("/AreadeFormacao/api", { headers: { Accept: "application/json" } });
        const result = await response.json();
        const areas = result.data || [];

        areas.forEach((area) => {
            const option = document.createElement("option");
            option.value = area.id;
            option.textContent = area.nome;
            areaSelect.appendChild(option);
        });
    } catch (error) {
        console.error("Erro ao carregar áreas de formação:", error);
    }
});
