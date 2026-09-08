(function () {
    const status = new URLSearchParams(window.location.search).get("status");
    const content = {
        sent: {
            icon: "OK",
            title: "Pedido enviado",
            message: "Se a conta existir, receberá uma palavra-passe temporária no telefone associado.",
        },
        config: {
            icon: "!",
            title: "Serviço temporariamente indisponível",
            message: "A recuperação por SMS ainda não está configurada. Contacte a coordenação ou tente novamente mais tarde.",
        },
        error: {
            icon: "!",
            title: "Não foi possível concluir o pedido",
            message: "Verifique o e-mail e o telefone associado à conta e tente novamente.",
        },
    }[status] || {
        icon: "?",
        title: "Recuperação de acesso",
        message: "Preencha o formulário para iniciar a recuperação da palavra-passe.",
    };

    document.querySelector("[data-result-icon]").textContent = content.icon;
    document.querySelector("[data-result-title]").textContent = content.title;
    document.querySelector("[data-result-message]").textContent = content.message;
})();