(function () {
    "use strict";

    const pageConfigs = {
        "/Utilizadores": {
            title: "Utilizadores",
            endpoint: "/api/users",
            tableTitle: "Utilizadores cadastrados",
            subtitle: "Contas e dados principais dos utilizadores do sistema",
            action: "Novo Utilizador",
            stats: [["Total", "0"], ["Ativos", "-"], ["Perfis", "-"], ["Recentes", "-"]],
            columns: [
                ["nome", "Nome"],
                ["email", "Email"],
                ["telefone", "Telefone"],
                ["idade", "Idade"],
                ["genero", "Gênero"],
                ["role_id", "Perfil"],
            ],
            form: [
                ["nome", "Nome", "text", true],
                ["email", "Email", "email", true],
                ["password", "Senha", "password", true],
                ["telefone", "Telefone", "text"],
                ["idade", "Idade", "number"],
                ["genero", "Gênero", "text"],
                ["foto", "Foto", "text"],
                ["role_id", "ID do perfil", "number"],
            ],
        },
        "/Perfis": {
            title: "Perfis",
            endpoint: "/api/roles",
            tableTitle: "Perfis do sistema",
            subtitle: "Papéis usados para organizar permissões e acesso",
            action: "Novo Perfil",
            stats: [["Total", "0"], ["Sistema", "-"], ["Acadêmico", "-"], ["Recentes", "-"]],
            columns: [["nome", "Nome"], ["descricao", "Descrição"], ["created_at", "Criado em"], ["updated_at", "Atualizado em"]],
            form: [["nome", "Nome", "text", true], ["descricao", "Descrição", "text"]],
        },
        "/Cursos": {
            title: "Cursos",
            endpoint: "/api/cursos",
            tableTitle: "Cursos cadastrados",
            subtitle: "Cursos disponíveis para associação aos estudantes",
            action: "Novo Curso",
            stats: [["Total", "0"], ["Ativos", "-"], ["Com estudantes", "-"], ["Recentes", "-"]],
            columns: [["nome", "Curso"], ["descricao", "Descrição"], ["created_at", "Criado em"], ["updated_at", "Atualizado em"]],
            form: [["nome", "Nome do curso", "text", true], ["descricao", "Descrição", "text"]],
        },
        "/Estudantes": {
            title: "Estudantes",
            endpoint: "/api/estudantes",
            tableTitle: "Todos os estudantes",
            subtitle: "Dados acadêmicos ligados aos utilizadores com perfil de aluno",
            action: "Novo Estudante",
            stats: [["Total", "128"], ["Com TCC", "76"], ["Pendentes", "18"], ["Finalistas", "42"]],
            columns: [
                ["utilizador_nome", "Utilizador"],
                ["numero_estudante", "Nº Estudante"],
                ["curso_nome", "Curso"],
                ["turma", "Turma"],
                ["ano_lectivo", "Ano Lectivo"],
                ["numero_processo", "Processo"],
            ],
            rows: [
                ["Ana Manuel", "2024017", "Informática", "INF4A", "2025/2026", "Com TCC"],
                ["Carlos Bunga", "2024032", "Gestão", "GES4B", "2025/2026", "Pendente"],
                ["Helena Costa", "2024008", "Informática", "INF4B", "2025/2026", "Finalista"],
            ],
            form: [
                ["id_user", "ID do utilizador", "number", false],
                ["numero_estudante", "Número de estudante", "number", true],
                ["numero_processo", "Número de processo", "text"],
                ["turma", "Turma", "text"],
                ["ano_lectivo", "Ano lectivo", "text"],
                ["id_curso", "ID do curso", "number", true],
            ],
        },
        "/Professores": {
            title: "Professores",
            endpoint: "/api/professores",
            tableTitle: "Orientadores e docentes",
            subtitle: "Gestão de professores disponíveis para orientação e bancas",
            action: "Novo Professor",
            stats: [["Total", "36"], ["Orientadores", "21"], ["Em Banca", "12"], ["Disponíveis", "9"]],
            columns: [
                ["utilizador_nome", "Utilizador"],
                ["especializacao", "Especialização"],
                ["categoria", "Categoria"],
                ["created_at", "Criado em"],
                ["updated_at", "Atualizado em"],
            ],
            rows: [
                ["12", "Engenharia de Software", "Assistente", "2026-05-12", "2026-05-12"],
                ["13", "Redes", "Auxiliar", "2026-05-18", "2026-05-18"],
                ["14", "Base de Dados", "Titular", "2026-05-20", "2026-05-20"],
            ],
            form: [
                ["id_user", "ID do utilizador", "number", true],
                ["especializacao", "Especialização", "text"],
                ["categoria", "Categoria", "text"],
            ],
        },
        "/Subdireccoes": {
            title: "Subdirecções",
            endpoint: "/api/subdireccoes",
            tableTitle: "Subdirecções cadastradas",
            subtitle: "Responsáveis por aprovações e validações acadêmicas",
            action: "Nova Subdirecção",
            stats: [["Total", "0"], ["Ativas", "-"], ["Com aprovações", "-"], ["Recentes", "-"]],
            columns: [["utilizador_nome", "Utilizador"], ["cargo", "Cargo"], ["created_at", "Criada em"], ["updated_at", "Atualizada em"]],
            form: [["id_user", "ID do utilizador", "number"], ["cargo", "Cargo", "text"]],
        },
        "/Bancas": {
            title: "Bancas",
            endpoint: "/api/bancas",
            tableTitle: "Bancas constituídas",
            subtitle: "Composição das bancas, sala e data prevista",
            action: "Nova Banca",
            stats: [["Bancas", "14"], ["Aprovadas", "8"], ["Pendentes", "4"], ["Revisão", "2"]],
            columns: [["id", "Banca"], ["data", "Data"], ["sala", "Sala"], ["created_at", "Criada em"]],
            rows: [
                ["Banca 01", "12/06/2026", "12", "2026-05-12"],
                ["Banca 02", "15/06/2026", "08", "2026-05-18"],
                ["Banca 03", "20/06/2026", "Lab 2", "2026-05-20"],
            ],
            form: [["data", "Data", "date"], ["sala", "Sala", "number", true]],
        },
        "/ProfessorBancas": {
            title: "Professores em Bancas",
            endpoint: "/api/professor_bancas",
            tableTitle: "Composição das bancas",
            subtitle: "Ligação entre professores e bancas constituídas",
            action: "Associar Professor",
            stats: [["Total", "0"], ["Bancas", "-"], ["Professores", "-"], ["Recentes", "-"]],
            columns: [["professor_nome", "Professor"], ["banca_sala", "Sala"], ["banca_data", "Data"], ["created_at", "Criado em"]],
            form: [["id_professor", "ID do professor", "number", true], ["id_banca", "ID da banca", "number", true]],
        },
        "/Defesas": {
            title: "Defesas",
            endpoint: "/api/defesas",
            tableTitle: "Defesas registadas",
            subtitle: "Agenda e resultado das defesas de TCC",
            action: "Nova Defesa",
            stats: [["Total", "0"], ["Aprovadas", "-"], ["Pendentes", "-"], ["Recentes", "-"]],
            columns: [["tcc_tema", "TCC"], ["banca_sala", "Sala"], ["data_defesa", "Data"], ["resultado", "Resultado"], ["created_at", "Criada em"]],
            form: [
                ["id_tcc", "ID do TCC", "number", true],
                ["id_banca", "ID da banca", "number", true],
                ["data_defesa", "Data da defesa", "date", true],
                ["resultado", "Resultado", "text", true],
            ],
        },
        "/Documentos": {
            title: "Documentos",
            endpoint: "/api/documentos",
            uploadEndpoint: "/api/documentos/upload",
            tableTitle: "Documentos dos TCCs",
            subtitle: "Submissões, versões e ficheiros associados aos trabalhos",
            action: "Novo Documento",
            stats: [["Ficheiros", "92"], ["Relatórios", "38"], ["Propostas", "31"], ["Pendentes", "23"]],
            columns: [
                ["nome", "Documento"],
                ["tcc_tema", "TCC"],
                ["tipo", "Tipo"],
                ["caminho_arquivo", "Arquivo"],
                ["created_at", "Criado em"],
            ],
            rows: [
                ["Relatório Final", "1", "PDF", "/uploads/relatorio-final.pdf", "2026-05-12"],
                ["Proposta", "2", "PDF", "/uploads/proposta.pdf", "2026-05-18"],
                ["Correções", "3", "DOCX", "/uploads/correcoes.docx", "2026-05-20"],
            ],
            form: [
                ["id_tcc", "ID do TCC", "number", true],
                ["nome", "Nome do documento", "text", true],
                ["tipo", "Tipo", "text", true],
                ["ficheiro", "Ficheiro", "file", true],
            ],
        },
        "/Avaliacoes": {
            title: "Avaliações",
            endpoint: "/api/avaliacoes",
            tableTitle: "Pareceres e observações",
            subtitle: "Histórico de análise feita pelos orientadores e coordenação",
            action: "Nova Avaliação",
            stats: [["Avaliações", "47"], ["Favoráveis", "29"], ["Com correções", "13"], ["Rejeitadas", "5"]],
            columns: [["tcc_tema", "TCC"], ["observacao", "Observação"], ["data_avaliacao", "Data"], ["created_at", "Criada em"]],
            rows: [
                ["1", "Apto para defesa", "22/05/2026", "2026-05-22"],
                ["2", "Rever objetivos", "24/05/2026", "2026-05-24"],
                ["3", "Boa estrutura", "27/05/2026", "2026-05-27"],
            ],
            form: [
                ["id_tcc", "ID do TCC", "number", true],
                ["observacao", "Observação", "text", true],
                ["data_avaliacao", "Data da avaliação", "date", true],
            ],
        },
        "/Aprovacoes": {
            title: "Aprovações",
            endpoint: "/api/aprovacoes",
            tableTitle: "Fila de aprovações",
            subtitle: "TCCs, bancas e defesas que aguardam validação",
            action: "Nova Aprovação",
            stats: [["Pendentes", "16"], ["TCCs", "7"], ["Bancas", "5"], ["Defesas", "4"]],
            columns: [
                ["tipo", "Tipo"],
                ["tcc_tema", "TCC"],
                ["banca_sala", "Banca"],
                ["id_subdireccao", "Subdirecção"],
                ["status", "Status"],
                ["observacao", "Observação"],
            ],
            rows: [
                ["Sistema de Gestão de TCC", "TCC", "Coordenação", "22/05/2026", "Pendente", "Aguardar subdirecção"],
                ["Banca 02", "Banca", "Secretaria", "24/05/2026", "Aprovado", "Sem observações"],
                ["Defesa de Helena Costa", "Defesa", "Coordenação", "28/05/2026", "Pendente", "Confirmar sala"],
            ],
            form: [
                ["tipo", "Tipo de aprovação", "select:tcc|banca|defesa"],
                ["id_tcc", "ID do TCC", "number"],
                ["id_banca", "ID da banca", "number"],
                ["id_subdireccao", "ID da subdirecção", "number", true],
                ["status", "Status", "number", true],
                ["observacao", "Observação", "text"],
            ],
        },
        "/AprovacaoTccs": {
            title: "Aprovações de TCC",
            endpoint: "/api/aprovacao_tccs",
            tableTitle: "Aprovações de TCC",
            subtitle: "Validações feitas pela subdirecção sobre os trabalhos submetidos",
            action: "Nova Aprovação de TCC",
            stats: [["Total", "0"], ["Aprovadas", "-"], ["Pendentes", "-"], ["Recentes", "-"]],
            columns: [
                ["tcc_tema", "TCC"],
                ["id_subdireccao", "Subdirecção"],
                ["status", "Status"],
                ["data_aprovacao", "Data"],
                ["observacao", "Observação"],
            ],
            form: [
                ["id_tcc", "ID do TCC", "number", true],
                ["id_subdireccao", "ID da subdirecção", "number", true],
                ["status", "Status", "number", true],
                ["data_aprovacao", "Data da aprovação", "date"],
                ["observacao", "Observação", "text"],
            ],
        },
        "/AprovacaoBancas": {
            title: "Aprovações de Bancas",
            endpoint: "/api/aprovacao_bancas",
            tableTitle: "Aprovações de bancas",
            subtitle: "Validações da composição e agenda de bancas",
            action: "Nova Aprovação de Banca",
            stats: [["Total", "0"], ["Aprovadas", "-"], ["Pendentes", "-"], ["Recentes", "-"]],
            columns: [
                ["banca_sala", "Banca"],
                ["id_subdireccao", "Subdirecção"],
                ["status", "Status"],
                ["data", "Data"],
                ["observacao", "Observação"],
            ],
            form: [
                ["id_banca", "ID da banca", "number", true],
                ["id_subdireccao", "ID da subdirecção", "number", true],
                ["status", "Status", "number", true],
                ["data", "Data", "date"],
                ["observacao", "Observação", "text"],
            ],
        },
        "/AprovacaoDefesas": {
            title: "Aprovações de Defesas",
            endpoint: "/api/aprovacao_defesas",
            tableTitle: "Aprovações de defesas",
            subtitle: "Validações feitas antes ou depois da defesa",
            action: "Nova Aprovação de Defesa",
            stats: [["Total", "0"], ["Aprovadas", "-"], ["Pendentes", "-"], ["Recentes", "-"]],
            columns: [
                ["tcc_tema", "TCC"],
                ["id_subdireccao", "Subdirecção"],
                ["status", "Status"],
                ["observacao", "Observação"],
            ],
            form: [
                ["id_tcc", "ID do TCC", "number", true],
                ["id_subdireccao", "ID da subdirecção", "number", true],
                ["status", "Status", "number"],
                ["observacao", "Observação", "text", true],
            ],
        },
        "/DetalhesTcc": {
            title: "Detalhes do TCC",
            endpoint: "/api/tccs",
            tableTitle: "Histórico do trabalho",
            subtitle: "Resumo do TCC selecionado, documentos, avaliações e defesa",
            action: "Atualizar TCC",
            stats: [["Progresso", "75%"], ["Documentos", "4"], ["Avaliações", "3"], ["Defesa", "1"]],
            columns: [
                ["tema", "Tema"],
                ["objectivo", "Objetivo"],
                ["estado", "Estado"],
                ["data_submissao", "Submissão"],
                ["estudante_nome", "Estudante"],
                ["professor_nome", "Orientador"],
            ],
            rows: [
                ["Submissão", "Ana Manuel", "02/04/2026", "Concluída", "Tema submetido", "Ver"],
                ["Avaliação", "Prof. João Pedro", "22/05/2026", "Concluída", "Apto para defesa", "Ver"],
                ["Defesa", "Coordenação", "12/06/2026", "Agendada", "Sala 12", "Editar"],
            ],
            form: [
                ["tema", "Tema", "text"],
                ["objectivo", "Objetivo", "text"],
                ["estado", "Estado", "number"],
                ["data_submissao", "Data de submissão", "date"],
                ["id_estudante", "ID do estudante", "number", true],
                ["id_professor", "ID do professor", "number", true],
            ],
        },
        "/Relatorios": {
            title: "Relatórios",
            endpoint: "/api/relatorios",
            tableTitle: "Indicadores acadêmicos",
            subtitle: "Síntese para acompanhamento e exportação",
            action: "Gerar Relatório",
            stats: [["TCCs", "128"], ["Aprovados", "64"], ["Em análise", "39"], ["Defesas", "25"]],
            columns: [["nome", "Relatório"], ["categoria", "Categoria"], ["total", "Registos"]],
            rows: [
                ["TCCs por estado", "TCC", "128"],
                ["Defesas agendadas", "Defesas", "25"],
                ["Orientações por professor", "Acadêmico", "36"],
            ],
            form: [],
        },
    };

    pageConfigs["/Curso"] = pageConfigs["/Cursos"];
    pageConfigs["/ConfigUtilizadores"] = pageConfigs["/Utilizadores"];
    pageConfigs["/Agendar"] = pageConfigs["/Defesas"];
    pageConfigs["/tcc"] = {
        ...pageConfigs["/DetalhesTcc"],
        title: "TCCs",
        tableTitle: "Todos os TCCs",
        subtitle: "Trabalhos submetidos e acompanhados no sistema",
        action: "Novo TCC",
    };

    const selectors = {
        breadcrumb: "[data-page-breadcrumb]",
        form: "[data-operational-form]",
        message: "[data-operational-message]",
        panelSubtitle: "[data-panel-subtitle]",
        panelTitle: "[data-panel-title]",
        primaryAction: "[data-primary-action]",
        exportAction: "[data-export-action]",
        search: "[data-page-search]",
        statsGrid: "[data-stats-grid]",
        table: "[data-data-table]",
        tableSubtitle: "[data-table-subtitle]",
        tableTitle: "[data-table-title]",
        title: "[data-page-title]",
    };

    const dom = {};
    let editingId = null;
    let editingType = "";
    let currentRows = [];

    function getPageConfig() {
        return pageConfigs[window.location.pathname] || pageConfigs["/Estudantes"];
    }

    function cacheDom() {
        Object.entries(selectors).forEach(([key, selector]) => {
            dom[key] = document.querySelector(selector);
        });
    }

    function setText(element, value) {
        if (element) element.textContent = value;
    }

    function setMessage(message = "", type = "") {
        dom.message.textContent = message;
        dom.message.dataset.type = type;
    }

    function activateCurrentMenuItem() {
        document.querySelectorAll("[data-route]").forEach((link) => {
            link.classList.toggle("active", link.dataset.route === window.location.pathname);
        });
    }

    function renderHeader(page) {
        window.OperationalRenderers.renderHeader(dom, page);
    }

    function renderStats(stats) {
        window.OperationalRenderers.renderStats(dom, stats);
    }

    function renderTable(page, rows = [], fromApi = false) {
        window.OperationalRenderers.renderTable(dom, page, rows, fromApi);
    }

    function renderForm(page) {
        window.OperationalRenderers.renderForm(dom, page);
    }

    function filterTableRows(term) {
        window.OperationalTableTools.filterRows(dom.table, term);
    }

    function normalizePayload(formData) {
        return window.OperationalForms.normalizePayload(formData);
    }

    function validatePayload(page, payload, formData) {
        return window.OperationalForms.validatePayload(page, payload, formData, editingId);
    }

    async function loadRows(page) {
        renderStats(page.stats.map(([label], index) => [label, index === 0 ? "0" : "-"]));
        renderTable(page, []);

        if (!page.endpoint) return;

        try {
            const result = await window.ApiClient.get(page.endpoint);
            const rows = result.data || [];
            currentRows = rows;

            renderTable(page, rows, true);
            renderStats(page.stats.map(([label], index) => [label, index === 0 ? String(rows.length) : "-"]));
            setMessage(rows.length === 0 ? "Ainda não há registos para esta área." : "", rows.length === 0 ? "info" : "");
        } catch (error) {
            currentRows = [];
            renderTable(page, [], true);
            console.error("Erro ao carregar dados:", error);
            setMessage("Não foi possível carregar os dados.", "error");
        }
    }

    function setFormMode(page, row = null) {
        const submitButton = dom.form.querySelector(".operational-submit");
        const cancelButton = dom.form.querySelector("[data-cancel-edit]");

        editingId = row?.id || null;
        editingType = row?.tipo || "";

        if (submitButton) submitButton.textContent = editingId ? "Guardar alterações" : page.action;
        if (cancelButton) cancelButton.hidden = !editingId;
        setText(dom.panelTitle, editingId ? "Editar registo" : page.action);
    }

    function fillForm(page, row) {
        window.OperationalForms.fillForm(dom, page, row);
        setFormMode(page, row);
        setMessage("Edite os campos e guarde as alterações.", "info");
    }

    async function handleSubmit(event, page) {
        event.preventDefault();
        if (!page.endpoint || page.form.length === 0) return;

        setMessage(editingId ? "A atualizar..." : "A gravar...", "info");

        try {
            const formData = new FormData(dom.form);
            const payload = normalizePayload(formData);
            const validationMessage = validatePayload(page, payload, formData);

            if (validationMessage) {
                setMessage(validationMessage, "error");
                return;
            }

            if (editingType && !payload.tipo) payload.tipo = editingType;

            if (editingId) {
                await window.ApiClient.put(`${page.endpoint}/${editingId}`, payload);
            } else if (page.uploadEndpoint && formData.get("ficheiro")?.name) {
                await window.ApiClient.postForm(page.uploadEndpoint, formData);
            } else {
                await window.ApiClient.post(page.endpoint, payload);
            }

            const wasEditing = Boolean(editingId);
            dom.form.reset();
            setFormMode(page);
            setMessage(wasEditing ? "Registo atualizado com sucesso." : "Registo gravado com sucesso.", "success");
            await loadRows(page);
        } catch (error) {
            console.error("Erro ao gravar dados:", error);
            setMessage("Não foi possível guardar o registo.", "error");
        }
    }

    function handleEdit(event, page) {
        const button = event.target.closest("[data-edit-id]");
        if (!button) return false;

        const row = currentRows.find((item) => String(item.id) === String(button.dataset.editId) && String(item.tipo || "") === String(button.dataset.editType || ""));
        if (row) fillForm(page, row);
        return true;
    }

    async function handleDelete(event, page) {
        const button = event.target.closest("[data-delete-id]");
        if (!button || !page.endpoint) return;
        if (!window.confirm("Deseja eliminar este registo?")) return;

        const query = button.dataset.deleteType ? `?tipo=${button.dataset.deleteType}` : "";
        setMessage("A eliminar...", "info");

        try {
            await window.ApiClient.delete(`${page.endpoint}/${button.dataset.deleteId}${query}`);

            setMessage("Registo eliminado com sucesso.", "success");
            await loadRows(page);
        } catch (error) {
            console.error("Erro ao eliminar dados:", error);
            setMessage("Não foi possível eliminar o registo.", "error");
        }
    }

    function handleCancelEdit(page) {
        dom.form.reset();
        setFormMode(page);
        setMessage("", "");
    }

    function exportRows(page) {
        if (currentRows.length === 0) {
            setMessage("Não há dados para exportar.", "info");
            return;
        }

        window.OperationalTableTools.exportCsv(page, currentRows);
    }

    function bindEvents(page) {
        dom.search.addEventListener("input", (event) => {
            filterTableRows(event.target.value.toLowerCase());
        });

        dom.form.addEventListener("submit", (event) => handleSubmit(event, page));
        dom.form.addEventListener("click", (event) => {
            if (event.target.closest("[data-cancel-edit]")) handleCancelEdit(page);
        });
        dom.table.addEventListener("click", (event) => {
            if (handleEdit(event, page)) return;
            handleDelete(event, page);
        });
        dom.exportAction?.addEventListener("click", () => exportRows(page));
    }

    function init() {
        const page = getPageConfig();

        cacheDom();
        activateCurrentMenuItem();
        renderHeader(page);
        renderForm(page);
        bindEvents(page);
        loadRows(page);
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
