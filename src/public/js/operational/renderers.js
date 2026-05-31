(function () {
    "use strict";

    function setText(element, value) {
        if (element) element.textContent = value;
    }

    function renderHeader(dom, page) {
        document.title = `${page.title} - Gestor TCC`;

        setText(dom.title, page.title);
        setText(dom.breadcrumb, page.title);
        setText(dom.tableTitle, page.tableTitle);
        setText(dom.tableSubtitle, page.subtitle);
        setText(dom.panelTitle, page.action);
        setText(dom.panelSubtitle, "Informação principal do registo");
        setText(dom.primaryAction, page.action);

        if (dom.search) dom.search.placeholder = `Pesquisar ${page.title.toLowerCase()}...`;
    }

    function renderStats(dom, stats) {
        dom.statsGrid.innerHTML = stats.map(([label, value], index) => `
            <div class="glass-card glass-card-3d stat-card">
                <div class="stat-card-inner">
                    <div class="stat-info">
                        <h3>${label}</h3>
                        <div class="stat-value">${value}</div>
                        <span class="stat-change positive">Atualizado</span>
                    </div>
                    <div class="stat-icon ${["cyan", "magenta", "purple", "success"][index] || "cyan"}"></div>
                </div>
            </div>
        `).join("");
    }

    function getRowCells(page, row, fromApi) {
        if (!fromApi) return row;
        return page.columns.map(([key]) => row[key] ?? "");
    }

    function renderTableCell(cell) {
        return `<td>${cell || "-"}</td>`;
    }

    function renderTable(dom, page, rows = [], fromApi = false) {
        const header = page.columns.map((column) => {
            return `<th>${Array.isArray(column) ? column[1] : column}</th>`;
        }).join("");

        const hasActions = fromApi && page.form.length > 0;
        const actionHeader = hasActions ? "<th>Ações</th>" : "";

        if (rows.length === 0) {
            const colspan = page.columns.length + (hasActions ? 1 : 0);
            dom.table.innerHTML = `
                <thead><tr>${header}${actionHeader}</tr></thead>
                <tbody><tr><td colspan="${colspan}" class="empty-table-message">Nenhum registo encontrado.</td></tr></tbody>
            `;
            return;
        }

        const body = rows.map((row) => {
            const cells = getRowCells(page, row, fromApi);
            const actions = hasActions && row.id
                ? `<td class="table-actions">
                    <button class="card-btn" data-edit-id="${row.id}" data-edit-type="${row.tipo || ""}" type="button">Editar</button>
                    <button class="card-btn" data-delete-id="${row.id}" data-delete-type="${row.tipo || ""}" type="button">Eliminar</button>
                </td>`
                : "";

            return `<tr>${cells.map(renderTableCell).join("")}${actions}</tr>`;
        }).join("");

        dom.table.innerHTML = `<thead><tr>${header}${actionHeader}</tr></thead><tbody>${body}</tbody>`;
    }

    function renderSelectInput(name, label, type, required) {
        const options = type.replace("select:", "").split("|");
        return `
            <select class="form-input" name="${name}" ${required ? "required" : ""}>
                <option value="">${label}</option>
                ${options.map((option) => `<option value="${option}">${option}</option>`).join("")}
            </select>
        `;
    }

    function renderForm(dom, page) {
        if (page.form.length === 0) {
            dom.form.innerHTML = '<p class="card-subtitle">Use o botão Exportar para consultar estes indicadores fora do sistema.</p>';
            return;
        }

        dom.form.innerHTML = page.form.map(([name, label, type, required = false]) => {
            const input = type.startsWith("select:")
                ? renderSelectInput(name, label, type, required)
                : `<input class="form-input" name="${name}" type="${type}" placeholder="${label}" ${required ? "required" : ""}>`;

            return `
                <div class="form-group">
                    <label class="form-label">${label}</label>
                    ${input}
                </div>
            `;
        }).join("") + `
            <div class="operational-actions">
                <button type="submit" class="btn btn-primary operational-submit">${page.action}</button>
                <button type="button" class="btn btn-secondary operational-cancel" data-cancel-edit hidden>Cancelar</button>
            </div>
        `;
    }

    window.OperationalRenderers = {
        renderHeader,
        renderStats,
        renderTable,
        renderForm,
    };
})();
