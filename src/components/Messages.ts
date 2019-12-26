import Vue from "vue";

declare module "@/components/Messages.vue" {
    // @ts-ignore
    export default class Messages extends Vue {
        show(type: MessageType, message: string): Promise<void>;

        showError(message: string): Promise<void>;

        showInfo(message: string): Promise<void>;

        showWarning(message: string): Promise<void>;

        hide(): void;
    }
}

export type MessageType = "error" | "info" | "warning";
