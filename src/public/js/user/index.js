
const all = async () => {

    const response = await fetch('/users/all', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
    });

    const payload = await response.json();
    const users = Array.isArray(payload) ? payload : payload.data || [];

    console.log("Users carregados:", users);

    const table = document.getElementById('users-table');
    const tbody = table.querySelector('tbody') || table;
    tbody.replaceChildren();

    const uniqueUsers = [...new Map(users.map((user) => [String(user.id), user])).values()];

    uniqueUsers.forEach(user => {
        const row = document.createElement('tr');
        const values = [user.fullname, user.email, user.telefone, user.role_id];
        values.forEach((value) => {
            const cell = document.createElement('td');
            cell.textContent = value || '-';
            row.appendChild(cell);
        });
        const actions = document.createElement('td');
        actions.innerHTML = `<a class="card-btn" style="padding: 6px 12px;" href="/users/edit/${encodeURIComponent(user.id)}">Editar</a>`;
        row.appendChild(actions);
        tbody.appendChild(row);
    });

};

all();