const form = document.querySelector("[data-tcc-form]");
const tipoSelect = document.querySelector("[data-tcc-tipo]");
const colectivoGroup = document.querySelector("[data-colectivo-group]");
const estudantePrincipal = document.querySelector("[data-estudante-principal]");
const estudantesAdicionais = document.querySelector("[data-estudantes-adicionais]");
const professorSelect = document.querySelector("[data-professor-select]");

const optionLabel = (item, fallback) => {
  const details = [item.numero_estudante, item.turma, item.especializacao].filter(Boolean).join(" - ");
  return details ? `${item.nome || fallback} (${details})` : item.nome || fallback;
};

const fillSelect = (select, rows, placeholder, fallbackPrefix) => {
  select.innerHTML = "";
  const placeholderOption = new Option(placeholder, "");
  select.appendChild(placeholderOption);

  rows.forEach((row) => {
    select.appendChild(new Option(optionLabel(row, `${fallbackPrefix} ${row.id}`), row.id));
  });
};

const fillAdditionalStudents = (rows) => {
  estudantesAdicionais.innerHTML = "";
  rows.forEach((row) => {
    const option = new Option(optionLabel(row, `Estudante ${row.id}`), row.id);
    estudantesAdicionais.appendChild(option);
  });
};

const updateTccType = () => {
  const colectivo = tipoSelect.value === "colectivo";
  colectivoGroup.hidden = !colectivo;
  estudantesAdicionais.disabled = !colectivo;
};

async function loadOptions() {
  const response = await fetch("/tcc/options", { headers: { Accept: "application/json" } });
  const result = await response.json();
  if (!response.ok) throw new Error(result.message || "Não foi possível carregar alunos e professores.");

  fillSelect(estudantePrincipal, result.data.estudantes || [], "Selecione um aluno", "Estudante");
  fillAdditionalStudents(result.data.estudantes || []);
  fillSelect(professorSelect, result.data.professores || [], "Selecione um orientador", "Professor");
}

tipoSelect.addEventListener("change", updateTccType);
updateTccType();
loadOptions().catch((error) => {
  const message = document.querySelector("[data-message]");
  message.textContent = error.message;
  message.dataset.type = "error";
});

form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const message = document.querySelector("[data-message]");
      const data = new FormData(event.target);
      if (!event.target.elements.relatorio_pdf.files.length) data.delete("relatorio_pdf");
      if (tipoSelect.value !== "colectivo") data.delete("estudantes_ids");

      try {
        const response = await fetch("/tcc", {
          method: "POST",
          headers: { Accept: "application/json" },
          body: data,
        });
        const result = await response.json();

        if (!response.ok) throw new Error(result.message || "Não foi possível criar o TCC.");
        window.location.href = `/tcc/${result.data.id}`;
      } catch (error) {
        message.textContent = error.message;
        message.dataset.type = "error";
      }
    });
