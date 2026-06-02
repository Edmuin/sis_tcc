(function () {
    "use strict";

    function setText(element, value) {
        if (element) element.textContent = value;
    }

    function escapeHtml(value) {
        return String(value ?? "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }

    function formatDate(value) {
        if (!value) return "-";
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return String(value).slice(0, 10);
        return new Intl.DateTimeFormat("pt-PT", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        }).format(date);
    }

    function renderStats(stats = []) {
        document.querySelectorAll(".stats-grid .stat-card").forEach((card, index) => {
            const stat = stats[index];
            if (!stat) return;

            setText(card.querySelector(".stat-info h2, .stat-info h3"), stat.label);
            setText(card.querySelector(".stat-value, .stat.value"), stat.value);
            setText(card.querySelector(".stat-change"), "Atualizado agora");
        });
    }

    function renderChart(chart = []) {
        const container = document.querySelector(".chart-placeholder");
        if (!container) return;

        const max = Math.max(...chart.map((item) => Number(item.value) || 0), 1);
        const classes = ["bar-emerald", "bar-gold", "bar-coral", "bar-teal", "bar-amber"];

        container.innerHTML = chart.map((item, index) => {
            const height = Math.max(24, Math.round((Number(item.value) / max) * 190));
            return `
                <div class="chart-bar-group">
                    <div class="chart-bar ${classes[index % classes.length]}" style="height: ${height}px;"></div>
                    <span class="chart-label">${item.label}</span>
                </div>
            `;
        }).join("");
    }

    function statusClass(estado) {
        const value = String(estado ?? "").toLowerCase();
        if (value.includes("defendido") || value.includes("aprov")) return "completed";
        if (value.includes("rejeitado") || value.includes("rascunho")) return "pending";
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
                            <span class="table-user-name">${escapeHtml(row.estudante_nome || "Aluno não informado")}</span>
                            <span class="table-user-email">${escapeHtml(row.professor_nome ? `Orientador: ${row.professor_nome}` : "Orientador não informado")}</span>
                        </div>
                    </div>
                </td>
                <td>${escapeHtml(row.tema || "TCC sem tema")}</td>
                <td>${formatDate(row.data_submissao || row.created_at)}</td>
                <td><span class="status-badge ${statusClass(row.estado)}">${escapeHtml(row.estado_label || row.estado || "Rascunho")}</span></td>
            </tr>
        `).join("");
    }

    function renderUpcomingDefesas(rows = []) {
        const list = document.querySelector(".activity-list");
        if (!list) return;

        if (rows.length === 0) {
            list.innerHTML = `
                <div class="activity-item">
                    <div class="activity-avatar" style="background: linear-gradient(135deg, var(--gold), var(--amber));">DF</div>
                    <div class="activity-content">
                        <p class="activity-text"><strong>Nenhuma defesa próxima</strong></p>
                        <span class="activity-time">Sem agenda futura registada</span>
                    </div>
                </div>
            `;
            return;
        }

        list.innerHTML = rows.map((row) => `
            <div class="activity-item">
                <div class="activity-avatar" style="background: linear-gradient(135deg, var(--emerald-light), var(--emerald));">DF</div>
                <div class="activity-content">
                    <p class="activity-text"><strong>${escapeHtml(row.tcc_tema || `TCC ${row.id_tcc}`)}</strong></p>
                    <span class="activity-time">${formatDate(row.data_defesa)} · Sala ${escapeHtml(row.banca_sala || "-")}</span>
                </div>
            </div>
        `).join("");
    }

    async function loadDashboard() {
        if (!window.ApiClient || !document.querySelector(".stats-grid")) return;

        try {
            const result = await window.ApiClient.get("/api/dashboard");
            const data = result.data || {};

            renderStats(data.stats || []);
            renderChart(data.chart || []);
            renderRecentTccs(data.recentTccs || []);
            renderUpcomingDefesas(data.upcomingDefesas || []);
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
