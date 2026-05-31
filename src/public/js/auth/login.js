document.addEventListener("DOMContentLoaded", async () => {
  const roleList = document.getElementById("roles");

  // podes criar esta rota JSON
  const response = await fetch("/roles"); 
  const roles = await response.json();

  /*roles.forEach(role => {
    const newOption = document.createElement("option");
    newOption.setAttribute("value", `${role.nome}`);
    newOption.innerHTML = `${role.nome}`;
    roleList.append(newOption);
  })*/
});

console.log("Login JS carregado");

document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    const response = await fetch("/auth/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            email: email,
            password: password
        })
    });

    const data = await response.json();

    if (response.ok) {
        localStorage.setItem('user', JSON.stringify(data.user)); // Armazenar o usuário no localStorage
        localStorage.setItem('token', data.token); // Armazenar o token no localStorage
        window.alert("Login bem-sucedido!");
        console.log('Token de autenticação:', localStorage.getItem('token'));
        console.log('Usuário autenticado:', JSON.parse(localStorage.getItem('user')));
        alert('Redirecionando para a página principal...');
        window.location.href = '/';
    } else {
      console.log('Erro ao autenticar:', data.message);
        window.alert(data.message || "Erro ao autenticar. Tente novamente.");
    }
});