(function () {
    "use strict";

    function setText(element, value) {
        if (element) element.textContent = value;
    }

    async function loadSessionIdentity() {
        try {
            const response = await fetch("/auth/me", { headers: { Accept: "application/json" } });
            if (!response.ok) return;
            const result = await response.json();
            const user = result.data || {};
            const labels = { aluno: "Aluno", tutor: "Professor / Orientador", coordenador: "Coordenação" };
            setText(document.querySelector("[data-session-name]"), user.fullname || "Utilizador");
            setText(document.querySelector("[data-session-role]"), labels[user.role] || "Utilizador");
            setText(document.querySelector("[data-session-status]"), "Sessão ativa");
        } catch (error) {
            console.error("Não foi possível carregar a identidade da sessão.", error);
        }
    }

    function escapeHtml(value) {
        return String(value ?? "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }

    function renderStats(stats = []) {
        document.querySelectorAll(".stats-grid .stat-card").forEach((card, index) => {
            const stat = stats[index];
            if (!stat) return;

            setText(card.querySelector(".stat-info h2, .stat-info h3"), stat.label);
            setText(card.querySelector(".stat-value, .stat.value"), stat.value);
            setText(card.querySelector(".stat-change"), "Atualizado");
        });
    }

    function renderChart(chart = []) {
        const container = document.querySelector(".chart-placeholder");
        if (!container) return;

        const max = Math.max(...chart.map((item) => Number(item.value) || 0), 1);
        const classes = ["bar-emerald", "bar-gold", "bar-coral", "bar-teal", "bar-amber"];

        if (!chart.length) {
            container.innerHTML = '<p class="empty-table-message">Não existem indicadores disponíveis.</p>';
            return;
        }
        container.innerHTML = chart.map((item, index) => {
            const height = Math.max(24, Math.round((Number(item.value) / max) * 190));
            return `
                <div class="chart-bar-group">
                    <div class="chart-bar ${classes[index % classes.length]}" style="height: ${height}px;"></div>
                    <span class="chart-label">${escapeHtml(item.label)}</span>
                </div>
            `;
        }).join("");
    }

    function statusClass(estado) {
        const value = String(estado ?? "").toLowerCase();
        if (value.includes("concl") || value.includes("aprov")) return "completed";
        if (value.includes("pend")) return "pending";
        return "processing";
    }

    function renderRecentTccs(rows = []) {
        const tbody = document.querySelector(".table-card .data-table tbody");
        if (!tbody) return;

        if (rows.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="empty-table-message">Nenhum TCC registado.</td></tr>';
            return;
        }

        tbody.innerHTML = rows.map((row) => `
            <tr>
                <td>
                    <div class="table-user">
                        <div class="table-avatar" style="background: linear-gradient(135deg, var(--emerald-light), var(--emerald));">TC</div>
                        <div class="table-user-info">
                            <span class="table-user-name">${escapeHtml(row.tema || "TCC sem tema")}</span>
                                <span class="table-user-email">Estudante ${escapeHtml(row.id_estudante || "-")}</span>
                        </div>
                    </div>
                </td>
                <td>${escapeHtml(row.objectivo || "Submissão de TCC")}</td>
                <td>${escapeHtml(row.data_submissao || row.created_at || "-")}</td>
                <td><span class="status-badge ${statusClass(row.estado)}">${escapeHtml(row.estado ?? "Em análise")}</span></td>
            </tr>
        `).join("");
    }

    async function loadDashboard() {
        if (!window.ApiClient || !document.querySelector(".stats-grid")) return;

        loadSessionIdentity();

        try {
            const result = await window.ApiClient.get("/api/dashboard");
            const data = result.data || {};

            renderStats(data.stats || []);
            renderChart(data.chart || []);
            renderRecentTccs(data.recentTccs || []);
        } catch (error) {
            console.error("Não foi possível carregar o dashboard.", error);
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", loadDashboard);
    } else {
        loadDashboard();
    }
})();
