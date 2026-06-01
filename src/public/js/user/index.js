
const all = async () => {

    const response = await fetch('/users/all', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
    });

    const users = await response.json();

    console.log("Users carregados:", users);

    const table = document.getElementById('users-table');

    users.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><div class="table-user"><div class="table-avatar" style="background: linear-gradient(135deg, var(--emerald-light), var(--emerald));">AL</div><div class="table-user-info"><span class="table-user-name">${user.fullname}</span></div></div></td>
            <td>${user.email}</td>
            <td>${user.telefone}</td>
            <td><span class="status-badge completed">${user?.role_id}</span></td>
            <td>
                <a class="card-btn" style="padding: 6px 12px;" href="/users/edit/${user.id}">Editar</a>
            </td>
        `;
        table.appendChild(row);
    });

};

all();