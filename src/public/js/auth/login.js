document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const form = e.currentTarget;
    const submitButton = form.querySelector('button[type="submit"]');
    const message = document.querySelector("[data-login-message]");
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    if (message) message.textContent = "A validar os dados...";
    if (submitButton) submitButton.disabled = true;

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

        const contentType = response.headers.get("content-type") || "";
        const data = contentType.includes("application/json")
            ? await response.json()
            : { message: await response.text() };

        if (response.ok) {
            localStorage.setItem('user', JSON.stringify(data.user));
            localStorage.setItem('token', data.token);
            window.location.href = '/';
        } else {
            if (message) message.textContent = data.message || "Erro ao autenticar.";
        }
    } catch (error) {
        console.error("Erro na requisição:", error);
        if (message) message.textContent = "Não foi possível contactar o servidor. Verifique se está em execução.";
    } finally {
        if (submitButton) submitButton.disabled = false;
    }
});

