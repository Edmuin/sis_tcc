document.addEventListener("DOMContentLoaded", async () => {
    const roleList = document.getElementById("roles");
    if (!roleList) return;

    try {
        const roles = await window.ApiClient.get("/roles");
        /*roles.forEach((role) => {
            const newOption = document.createElement("option");
            newOption.value = role.nome;
            newOption.textContent = role.nome;
            roleList.append(newOption);
        });*/
    } catch (error) {
        console.error("Não foi possível carregar os perfis.", error);
    }
});

document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    alert("teste");

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email,
                password
            })
        });

        const data = await response.json();

        if (response.ok) {
            alert("Utilizador Autenticado com Sucesso!");

            localStorage.setItem('user', JSON.stringify(data.user));
            localStorage.setItem('token', data.token);

            alert('Redirecionando...');
            window.location.href = '/';
        } else {
            console.log('Erro ao autenticar:', data.message);
            alert(data.message || "Erro ao autenticar.");
        }
    } catch (error) {
        console.error("Erro na requisição:", error);
        alert("Erro de conexão com o servidor.");
    }
});
