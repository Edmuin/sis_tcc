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

document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    if (email && password) {
      localStorage.setItem('email', email);//
      localStorage.setItem('password', password);//

      console.log('Usuário autenticado:', email);
      console.log('Redirecionando para a página principal...');

      // Redirecionar
      window.location.href = '/';
    } else {
      console.log('Erro ao autenticar:', data.message);
        window.alert(data.message || "Erro ao autenticar. Tente novamente.");
    }
});
