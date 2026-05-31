(function () {
    "use strict";

    function normalizePayload(formData) {
        const payload = {};

        formData.forEach((value, key) => {
            if (value instanceof File) return;
            if (value !== "") payload[key] = value;
        });

        if (payload.tipo === "banca") {
            delete payload.id_tcc;
        } else {
            delete payload.id_banca;
        }

        return payload;
    }

    function validatePayload(page, payload, formData, editingId) {
        const missing = page.form
            .filter(([name, , type, required = false]) => {
                if (!required) return false;
                if (type === "file") return !formData.get(name)?.name && !editingId;
                return payload[name] === undefined || payload[name] === null || payload[name] === "";
            })
            .map(([, label]) => label);

        if (missing.length > 0) return `Campos obrigatórios em falta: ${missing.join(", ")}.`;

        const email = payload.email;
        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Informe um email válido.";

        const invalidNumber = page.form.find(([name, , type]) => {
            return type === "number" && payload[name] !== undefined && Number(payload[name]) < 0;
        });

        if (invalidNumber) return `${invalidNumber[1]} deve ser um número positivo.`;

        return "";
    }

    function fillForm(dom, page, row) {
        page.form.forEach(([name, , type]) => {
            const field = dom.form.elements[name];
            if (type === "file") return;
            if (field) field.value = row[name] ?? "";
        });
    }

    window.OperationalForms = {
        fillForm,
        normalizePayload,
        validatePayload,
    };
})();
