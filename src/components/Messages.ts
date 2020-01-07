import Vue from "vue";

declare module "@/components/Messages.vue" {
    // @ts-ignore
    export default class Messages extends Vue {
        show(type: MessageType, message: string, options?: MessageOptions): Promise<void>;

        showError(message: string, options?: MessageOptions): Promise<void>;

        showSuccess(message: string, options?: MessageOptions): Promise<void>;

        showInfo(message: string, options?: MessageOptions): Promise<void>;

        showWarning(message: string, options?: MessageOptions): Promise<void>;

        hide(): void;
    }
}

export type MessageType = "error" | "info" | "warning" | "success";

export interface MessageOptions {
    timeout?: number;
}
