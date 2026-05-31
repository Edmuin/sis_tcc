(function () {
    "use strict";

    async function request(path, options = {}) {
        const headers = {
            Accept: "application/json",
            ...(options.body && !(options.body instanceof FormData) ? { "Content-Type": "application/json" } : {}),
            ...(options.headers || {}),
        };

        const response = await fetch(path, {
            ...options,
            headers,
        });

        const contentType = response.headers.get("content-type") || "";
        const payload = contentType.includes("application/json")
            ? await response.json()
            : await response.text();

        if (!response.ok) {
            const message = typeof payload === "object" && payload?.message
                ? payload.message
                : "Não foi possível processar o pedido.";
            throw new Error(message);
        }

        return payload;
    }

    window.ApiClient = {
        get(path) {
            return request(path);
        },

        post(path, data) {
            return request(path, {
                method: "POST",
                body: JSON.stringify(data),
            });
        },

        postForm(path, formData) {
            return request(path, {
                method: "POST",
                body: formData,
                headers: {},
            });
        },

        put(path, data) {
            return request(path, {
                method: "PUT",
                body: JSON.stringify(data),
            });
        },

        delete(path) {
            return request(path, {
                method: "DELETE",
            });
        },
    };
})();
