const id = window.location.pathname.split("/").filter(Boolean)[1];
    const form = document.querySelector("[data-tcc-form]");
    const message = document.querySelector("[data-message]");
    const tipoSelect = document.querySelector("[data-tcc-tipo]");
    const colectivoGroup = document.querySelector("[data-colectivo-group]");
    const estudantesAdicionais = document.querySelector("[data-estudantes-adicionais]");
    const professorSelect = document.querySelector("[data-professor-select]");

    const optionLabel = (item, fallback) => {
      const details = [item.numero_estudante, item.turma, item.especializacao].filter(Boolean).join(" - ");
      return details ? `${item.nome || fallback} (${details})` : item.nome || fallback;
    };

    const fillSelect = (select, rows, placeholder, fallbackPrefix) => {
      select.innerHTML = "";
      select.appendChild(new Option(placeholder, ""));

      rows.forEach((row) => {
        select.appendChild(new Option(optionLabel(row, `${fallbackPrefix} ${row.id}`), row.id));
      });
    };

    const fillAdditionalStudents = (rows) => {
      estudantesAdicionais.innerHTML = "";
      rows.forEach((row) => {
        estudantesAdicionais.appendChild(new Option(optionLabel(row, `Estudante ${row.id}`), row.id));
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

      fillSelect(form.elements.id_estudante, result.data.estudantes || [], "Selecione um aluno", "Estudante");
      fillAdditionalStudents(result.data.estudantes || []);
      fillSelect(professorSelect, result.data.professores || [], "Selecione um orientador", "Professor");
    }

    async function loadTcc() {
      await loadOptions();
      const response = await fetch(`/tcc/${id}/api`, { headers: { Accept: "application/json" } });
      const result = await response.json();

      if (!response.ok) {
        message.textContent = result.message || "TCC não encontrado.";
        message.dataset.type = "error";
        return;
      }

      Object.entries(result.data).forEach(([key, value]) => {
        if (!form.elements[key]) return;
        if (form.elements[key].type === "file") return;
        form.elements[key].value = key === "data_submissao" && value ? String(value).slice(0, 10) : value ?? "";
      });
      const participantes = result.data.estudantes || [];
      const participantesAdicionais = participantes
        .filter((estudante) => String(estudante.id_estudante) !== String(result.data.id_estudante))
        .map((estudante) => String(estudante.id_estudante));

      Array.from(estudantesAdicionais.options).forEach((option) => {
        option.selected = participantesAdicionais.includes(option.value);
      });
      updateTccType();
      document.querySelector("[data-show-link]").href = `/tcc/${id}`;
      document.querySelector("[data-existing-files]").innerHTML = `
        ${result.data.relatorio_pdf ? `<a class="card-btn" href="${result.data.relatorio_pdf}" target="_blank" rel="noopener">Ver relatório</a>` : ""}
      `;
    }

    tipoSelect.addEventListener("change", updateTccType);
    updateTccType();

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const data = new FormData(form);
      if (!form.elements.relatorio_pdf.files.length) data.delete("relatorio_pdf");
      if (tipoSelect.value !== "colectivo") data.delete("estudantes_ids");

      try {
        const response = await fetch(`/tcc/${id}`, {
          method: "PUT",
          headers: { Accept: "application/json" },
          body: data,
        });
        const result = await response.json();

        if (!response.ok) throw new Error(result.message || "Não foi possível atualizar o TCC.");
        window.location.href = `/tcc/${id}`;
      } catch (error) {
        message.textContent = error.message;
        message.dataset.type = "error";
      }
    });

    loadTcc().catch((error) => {
      message.textContent = error.message;
      message.dataset.type = "error";
    });
