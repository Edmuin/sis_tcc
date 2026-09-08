document.addEventListener("DOMContentLoaded", async () => {
    const cursoSelect = document.getElementById("curso");
    const areaSelect = document.getElementById("area_formacao");

    const loadOptions = async (select, endpoint, emptyLabel, getLabel) => {
        if (!select) return;

        select.disabled = true;
        select.innerHTML = `<option value="">A carregar...</option>`;

        try {
            const response = await fetch(endpoint, {
                headers: { Accept: "application/json" },
            });
            const payload = await response.json();
            if (!response.ok) throw new Error(payload.message || "Não foi possível carregar as opções.");

            const options = payload.data || [];
            select.innerHTML = `<option value="">${emptyLabel}</option>`;
            options.forEach((item) => {
                const option = document.createElement("option");
                option.value = item.id;
                option.textContent = getLabel(item);
                select.append(option);
            });

            if (options.length === 0) {
                select.innerHTML = `<option value="">Nenhuma opção disponível</option>`;
            }
        } catch (error) {
            console.error(`Erro ao carregar ${emptyLabel.toLowerCase()}:`, error);
            select.innerHTML = `<option value="">Não foi possível carregar</option>`;
        } finally {
            select.disabled = false;
        }
    };

    await Promise.all([
        loadOptions(cursoSelect, "/auth/registration/courses", "Selecione o curso...", (curso) => curso.nome),
        loadOptions(areaSelect, "/auth/registration/areas", "Selecione a área...", (area) => area.nome),
    ]);
});
