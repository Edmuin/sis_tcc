document.addEventListener("DOMContentLoaded", async () => {
    
    const roleSelect = document.getElementById("role");
    const cursoSelect = document.getElementById("curso");
    const areaSelect = document.getElementById("area_coordenacao");

    try {
        // Roles
        const rolesRes = await fetch("/roles");
        const roles = await rolesRes.json();

        roles.forEach(role => {
            const option = document.createElement("option");
            option.value = role.nome;
            option.textContent = role.nome;
            roleSelect.appendChild(option);
        });

        // Cursos
        const cursosRes = await fetch("/cursos");
        const cursos = await cursosRes.json();

        cursos.forEach(curso => {
            const option = document.createElement("option");
            option.value = curso.id; // ou codigo
            option.textContent = curso.nome;
            cursoSelect.appendChild(option);
        });

        // Áreas
        const areasRes = await fetch("/areas");
        const areas = await areasRes.json();

        areas.forEach(area => {
            const option = document.createElement("option");
            option.value = area.id;
            option.textContent = area.nome;
            areaSelect.appendChild(option);
        });

    } catch (error) {
        console.log("Erro ao carregar cursos/áreas:", error);
    }

    const nProcesso = document.getElementById("n_processo").parentElement;
    const curso = document.getElementById("curso").parentElement;
    const nMecanografico = document.getElementById("n_mecanografico").parentElement;
    const areaCoordenacao = document.getElementById("area_formacao").parentElement;

    function atualizarCampos(role) {
        // esconder todos primeiro
        nProcesso.style.display = "none";
        curso.style.display = "none";
        nMecanografico.style.display = "none";
        areaCoordenacao.style.display = "none";

        // regra por tipo
        if (role === "aluno") {
            nProcesso.style.display = "block";
            curso.style.display = "block";
        } 
        
        if (role === "tutor") {
            curso.style.display = "block";
            nMecanografico.style.display = "block";
        } 
        
        if (role === "coordenador") {
            nMecanografico.style.display = "block";
            areaCoordenacao.style.display = "block";
        }
    }

    // esconder tudo ao carregar
    atualizarCampos("");

    // evento de mudança
    roleSelect.addEventListener("change", (e) => {
        atualizarCampos(e.target.value);
    });
});