document.addEventListener("DOMContentLoaded", async () => {
    
    const roleSelect = document.getElementById("role");
    const cursoSelect = document.getElementById("curso");
    const areaSelect = document.getElementById("area_formacao");

    try {
        // Users
        const response = await fetch('/users/getusertoedit', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
        });
        const user = await response.json();
        console.log("User carregado:", user);

        document.getElementById("fullname").value = user.fullname || "";
        document.getElementById("email").value = user.email || "";
        document.getElementById("telefone").value = user.telefone || "";
        document.getElementById("n_processo").value = user.n_processo || "";
        document.getElementById("idade").value = user.idade || "";
        document.getElementById("genero").value = user.genero || "";
        document.getElementById("n_mecanografico").value = user.n_mecanografico || "";

        // Roles
        const rolesRes = await fetch("/roles");
        const roles = await rolesRes.json() || [];

        roles.forEach(role => {
            if (role.id == user.role_id) {
                const option = document.createElement("option");
                option.selected = true;
                option.value = role.nome;
                atualizarCampos(option.value);
                option.textContent = role.nome;
                roleSelect.appendChild(option);
            }
        });

        // Cursos
        const cursosRes = await fetch("/cursos");
        const cursos = await cursosRes.json() || [];

        cursos.forEach(curso => {
            if(curso.id == user.curso) {
                const option = document.createElement("option");
                option.selected = true;
                option.value = curso.id; // ou codigo
                option.textContent = curso.nome;
                cursoSelect.appendChild(option);
            }
        });

        // Áreas
        const areasRes = await fetch("/areas");
        const areas = await areasRes.json() || [];

        areas.forEach(area => {
            if (area.id == user.area_formacao) {
                const option = document.createElement("option");
                option.selected = true;
                option.value = area.id;
                option.textContent = area.nome;
                areaSelect.appendChild(option);
            }
        });

    } catch (error) {
        console.log("Erro ao carregar cursos/áreas:", error);
    }

    function atualizarCampos(role) {

        const nProcesso = document.getElementById("n_processo").parentElement;
        const curso = document.getElementById("curso").parentElement;
        const nMecanografico = document.getElementById("n_mecanografico").parentElement;
        const areaCoordenacao = document.getElementById("area_formacao").parentElement;

        // esconder todos primeiro
        nProcesso.style.display = "none";
        curso.style.display = "none";
        nMecanografico.style.display = "none";
        areaCoordenacao.style.display = "none";

        // regra por tipo
        if (role === "aluno") {
            console.log("Mostrando campos para aluno");
            nProcesso.style.display = "block";
            curso.style.display = "block";
        } 
        
        if (role === "tutor") {
            console.log("Mostrando campos para tutor");
            curso.style.display = "block";
            nMecanografico.style.display = "block";
        } 
        
        if (role === "coordenador") {
            console.log("Mostrando campos para coordenador");
            nMecanografico.style.display = "block";
            areaCoordenacao.style.display = "block";
        }
    }

    // esconder tudo ao carregar
    atualizarCampos("");
});