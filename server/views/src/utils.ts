/**
 * Utility class for encoding and decoding Base64.
 * 
 * JavaScript's `btoa` and `atob` work on binary strings.
 * Since `Uint8Array` stores raw bytes, we use `String.fromCharCode(...data)`
 * to convert the byte array to a string, then encode it using Base64.
 */
class Base64Utils {
    /**
     * Encodes a Uint8Array to a Base64 string.
     * @param data - The binary data to encode.
     * @returns The Base64-encoded string.
     */
    static encode(data: Uint8Array): string {
        return btoa(String.fromCharCode(...data));
    }

    /**
     * Decodes a Base64 string back into a Uint8Array.
     * @param base64 - The Base64-encoded string.
     * @returns The decoded Uint8Array.
     */
    static decode(base64: string): Uint8Array {
        return new Uint8Array(atob(base64).split("").map(c => c.charCodeAt(0)));
    }
}

class ButtonLoader {
    private button: HTMLButtonElement;
    private originalText: string;
    private isLoading: boolean = false;

    constructor(button: HTMLButtonElement) {
        this.button = button;
        this.originalText = button.innerHTML; // Preserve original content
    }

    /**
     * Shows the loader by replacing the button text and disabling the button.
     * @param loaderText Optional text to show during loading (default: "Loading...")
     */
    show(loaderText: string = "Loading..."): void {
        if (this.isLoading) return;
        this.isLoading = true;

        this.button.disabled = true;
        this.button.innerHTML = `<span class="loader"></span> ${loaderText}`;
    }

    /**
     * Hides the loader and restores the original button state.
     */
    hide(): void {
        if (!this.isLoading) return;
        this.isLoading = false;

        this.button.disabled = false;
        this.button.innerHTML = this.originalText;
    }
}

class FormUtil {
    private form: HTMLFormElement;
    private submitButton: HTMLButtonElement;
    private responseMessage: HTMLElement;
    private callback: (response: any) => void;

    constructor(formId: string, submitButtonId: string, responseMessageId: string, callback: (response: any) => void) {
        this.form = document.getElementById(formId) as HTMLFormElement;
        this.submitButton = document.getElementById(submitButtonId) as HTMLButtonElement;
        this.responseMessage = document.getElementById(responseMessageId) as HTMLElement;
        this.callback = callback;

        this.attachEvent();
    }

    private attachEvent() {
        this.submitButton.addEventListener("click", async (e) => {
            e.preventDefault();
            this.clearErrors();
            const formData = this.getFormData();
            this.submitButton.disabled = true;

            try {
                const response = await this.sendRequest(this.form.action, formData);
                this.handleResponse(response);
            } catch (error: any) {
                this.showMessage(error.message || "An error occurred", "danger");
            } finally {
                this.submitButton.disabled = false;
            }
        });
    }

    private getFormData(): Record<string, string> {
        const inputs = this.form.querySelectorAll<HTMLInputElement>("input, textarea, select");
        return Array.from(inputs).reduce((acc, input: HTMLInputElement) => {
            acc[input.id] = input.value;
            return acc;
        }, {} as Record<string, string>);
    }

    private async sendRequest(url: string, data: Record<string, string>): Promise<any> {
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });

        return response.json();
    }

    private handleResponse(response: any) {
        if (response.errors) {
            this.showMessage(response.message, "danger");
            this.displayErrors(response.errors);
        } else {
            this.showMessage(response.message, "success");
            this.callback(response);
        }
    }

    private showMessage(message: string, type: "success" | "danger") {
        this.responseMessage.innerHTML = `<div class="form-control bg-${type} text-light">${message}</div>`;
        this.responseMessage.classList.remove("d-none");
    }

    private displayErrors(errors: { field: string; message: string }[]) {
        errors.forEach((err) => {
            const input = this.form.querySelector(`#${err.field}`) as HTMLInputElement;
            if (!input) return;

            input.classList.add("is-invalid");

            const errorSpan = document.createElement("span");
            errorSpan.setAttribute("data-attr", err.field);
            errorSpan.classList.add("invalid-feedback");
            errorSpan.textContent = err.message;

            input.parentNode?.appendChild(errorSpan);

            input.addEventListener("input", () => {
                input.classList.remove("is-invalid");
                errorSpan.remove();
            });
        });
    }

    private clearErrors() {
        this.responseMessage.classList.add("d-none");
        this.form.querySelectorAll(".is-invalid").forEach((input) => input.classList.remove("is-invalid"));
        this.form.querySelectorAll(".invalid-feedback").forEach((errorMsg) => errorMsg.remove());
    }
}

class HttpClient {
    private baseUrl: string;
    private endpoint: string = "";
    private method: string = "GET";
    private headers: HeadersInit = { "Content-Type": "application/json" };
    private body: any = null;
    private queryParams: Record<string, string> = {};
    private static controllers: Map<string, AbortController> = new Map();

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    setEndpoint(endpoint: string): this {
        this.endpoint = endpoint;
        return this;
    }

    setMethod(method: "GET" | "POST" | "PUT" | "DELETE"): this {
        this.method = method;
        return this;
    }

    setHeaders(headers: Record<string, string>): this {
        this.headers = { ...this.headers, ...headers };
        return this;
    }

    setQueryParams(params: Record<string, string>): this {
        this.queryParams = params;
        return this;
    }

    setBody(body: Record<string, any>): this {
        this.body = JSON.stringify(body);
        return this;
    }

    async send<T = any>(): Promise<T> {
        const queryString = new URLSearchParams(this.queryParams).toString();
        const url = `${this.baseUrl}${this.endpoint}${queryString ? `?${queryString}` : ""}`;

        // Abort previous request if it exists
        if (HttpClient.controllers.has(url)) {
            HttpClient.controllers.get(url)?.abort();
        }

        const controller = new AbortController();
        HttpClient.controllers.set(url, controller);

        try {
            const response = await fetch(url, {
                method: this.method,
                headers: this.headers,
                body: this.method !== "GET" ? this.body : null,
                signal: controller.signal, // Attach signal for request cancellation
            });

            if (!response.ok) {
                throw new Error(`HTTP Error: ${response.status}`);
            }

            HttpClient.controllers.delete(url); // Remove controller after success
            return response.json();
        } catch (error) {
            if ((error as Error).name === "AbortError") {
                console.warn(`Request to ${url} was aborted.`);
            }
            HttpClient.controllers.delete(url);
            throw error;
        }
    }
}

class ToastMessage {
    private static container: HTMLElement;
    private defaultDuration: number;

    constructor(defaultDuration = 3000) {
        this.defaultDuration = defaultDuration;

        if (!ToastMessage.container) {
            ToastMessage.container = document.createElement("div");
            ToastMessage.container.style.position = "fixed";
            ToastMessage.container.style.top = "20px";
            ToastMessage.container.style.right = "20px";
            ToastMessage.container.style.zIndex = "1000";
            ToastMessage.container.style.display = "flex";
            ToastMessage.container.style.flexDirection = "column";
            ToastMessage.container.style.gap = "10px";
            document.body.appendChild(ToastMessage.container);
        }
    }

    show(message: string, type: "success" | "error" | "info" = "info", duration?: number): void {
        const toast = document.createElement("div");
        toast.textContent = message;
        toast.style.padding = "12px 16px";
        toast.style.borderRadius = "8px";
        toast.style.color = "white";
        toast.style.fontSize = "14px";
        toast.style.minWidth = "200px";
        toast.style.maxWidth = "300px";
        toast.style.boxShadow = "0px 4px 6px rgba(0, 0, 0, 0.1)";
        toast.style.opacity = "1";
        toast.style.transition = "opacity 0.5s ease-in-out";
        toast.style.cursor = "pointer";

        // Background colors based on type
        switch (type) {
            case "success":
                toast.style.backgroundColor = "#28a745"; // Green
                break;
            case "error":
                toast.style.backgroundColor = "#dc3545"; // Red
                break;
            default:
                toast.style.backgroundColor = "#007bff"; // Blue (info)
                break;
        }

        // Remove toast on click
        toast.addEventListener("click", () => {
            toast.style.opacity = "0";
            setTimeout(() => toast.remove(), 500);
        });

        ToastMessage.container.appendChild(toast);

        // Auto-remove after the configured duration
        setTimeout(() => {
            toast.style.opacity = "0";
            setTimeout(() => toast.remove(), 500);
        }, duration ?? this.defaultDuration);
    }
}


