(function () {
    "use strict";

    function filterRows(table, term) {
        table.querySelectorAll("tbody tr").forEach((row) => {
            row.style.display = row.textContent.toLowerCase().includes(term) ? "" : "none";
        });
    }

    function exportCsv(page, rows) {
        const headers = page.columns.map(([, label]) => label);
        const keys = page.columns.map(([key]) => key);
        const csvRows = [
            headers.join(";"),
            ...rows.map((row) => keys.map((key) => `"${String(row[key] ?? "").replace(/"/g, '""')}"`).join(";")),
        ];

        const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${page.title.toLowerCase().replace(/\s+/g, "-")}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    }

    window.OperationalTableTools = {
        exportCsv,
        filterRows,
    };
})();
