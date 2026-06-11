document.addEventListener("DOMContentLoaded", async () => {
    const cursoSelect = document.getElementById("curso");
    if (!cursoSelect) return;

    try {
        const response = await fetch("/Curso/api", { headers: { Accept: "application/json" } });
        const result = await response.json();
        const cursos = result.data || [];

        cursos.forEach((curso) => {
            const option = document.createElement("option");
            option.value = curso.id;
            option.textContent = curso.nome;
            cursoSelect.appendChild(option);
        });
    } catch (error) {
        console.error("Erro ao carregar cursos:", error);
    }
});
