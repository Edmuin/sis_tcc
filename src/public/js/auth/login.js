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
      alert("Preencha todos os campos.");
    }
});