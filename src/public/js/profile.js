const valueOrDefault = (value) => value || "Por definir";

const initials = (name) => {
  const parts = String(name || "").trim().split(/\s+/).filter(Boolean);
  return (parts[0]?.[0] || "U") + (parts[1]?.[0] || "");
};

document.addEventListener("DOMContentLoaded", async () => {
  const fields = document.querySelectorAll("[data-profile-field]");
  if (fields.length === 0) return;

  try {
    const response = await fetch("/MeusDados/api", { headers: { Accept: "application/json" } });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Não foi possível carregar os seus dados.");

    const user = result.data || {};
    const resumo = [
      user.role ? `Perfil: ${user.role}` : "",
      user.curso ? `Curso: ${user.curso}` : "",
      user.turma ? `Turma: ${user.turma}` : "",
      user.especializacao ? `Especialização: ${user.especializacao}` : "",
    ].filter(Boolean).join(" | ") || "Utilizador do sistema académico para acompanhamento de TCCs.";

    document.querySelector("[data-profile-avatar]").textContent = initials(user.fullname).toUpperCase();
    document.querySelector("[data-profile-name]").textContent = valueOrDefault(user.fullname);
    document.querySelector("[data-profile-summary]").textContent = `${valueOrDefault(user.email)} - ${valueOrDefault(user.role)}`;

    fields.forEach((field) => {
      const key = field.dataset.profileField;
      const value = key === "resumo" ? resumo : user[key];
      field.value = valueOrDefault(value);
    });
  } catch (error) {
    const summary = document.querySelector("[data-profile-summary]");
    if (summary) summary.textContent = error.message;
  }
});
