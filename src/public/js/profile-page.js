document.addEventListener("DOMContentLoaded", async () => {
    const setText = (selector, value) => {
        const element = document.querySelector(selector);
        if (element) element.textContent = value || "-";
    };

    const setField = (name, value) => {
        const element = document.querySelector(`[data-profile-field="${name}"]`);
        if (element) element.value = value || "-";
    };

    try {
        const response = await fetch("/auth/me", {
            headers: {
                Accept: "application/json",
            },
        });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.message || "Não foi possível carregar os dados.");

        const user = payload.data || {};
        const isAluno = String(user.role || "").toLowerCase() === "aluno";
        const nMecanograficoRow = document.querySelector('[data-profile-field="n_mecanografico"]')?.closest(".settings-row");
        if (nMecanograficoRow) {
            nMecanograficoRow.style.display = isAluno ? "none" : "flex";
        }

        const [coursesResponse, areasResponse] = await Promise.all([
            fetch("/auth/registration/courses"),
            fetch("/auth/registration/areas"),
        ]);
        const courses = (await coursesResponse.json()).data || [];
        const areas = (await areasResponse.json()).data || [];
        const course = courses.find((item) => String(item.id) === String(user.curso));
        const area = areas.find((item) => String(item.id) === String(user.area_formacao));
        const name = user.fullname || "Utilizador";
        const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase();

        setText("[data-profile-name]", name);
        setText("[data-profile-summary]", `${user.email || "-"} • ${user.role || "Utilizador"}`);
        setText("[data-profile-initials]", initials || "--");
        setField("fullname", user.fullname);
        setField("n_processo", user.n_processo);
        setField("email", user.email);
        setField("telefone", user.telefone);
        setField("genero", user.genero);
        if (!isAluno) {
            setText('[data-profile-field="n_mecanografico"]', user.n_mecanografico);
        }
        setText('[data-profile-field="curso"]', course?.nome || user.curso);
        setText('[data-profile-field="area_formacao"]', area?.nome || user.area_formacao);
    } catch (error) {
        console.error("Erro ao carregar os dados do perfil:", error);
        setText("[data-profile-summary]", "Não foi possível carregar os dados.");
    }
});
