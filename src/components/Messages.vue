<template>
    <v-snackbar :color="colors[type]" v-model="showMessage" :timeout="timeout" top>
        {{message}}
        <v-btn @click="showMessage = false" text>{{$t('common.snackbar.close')}}</v-btn>
    </v-snackbar>
</template>

<script lang="ts">
    import Vue from "vue";
    import Component from "vue-class-component";
    import {MessageOptions, MessageType} from "@/components/Messages";

    @Component
    // @ts-ignore
    export default class Messages extends Vue {

        showMessage = false;
        type: MessageType = "error";
        message: string = "";
        timeout: number = 5000;

        colors: { [type in MessageType]: string } = {
            error: "error",
            info: "info",
            warning: "warning",
            success: "success"
        };

        async show(type: MessageType, message: string, options: MessageOptions = {}) {
            const mergedOptions = {timeout: 10000, ...options};

            this.type = type;
            this.message = message;
            this.timeout = mergedOptions.timeout;
            this.showMessage = false;
            await this.$nextTick();
            this.showMessage = true;
        }

        async showError(message: string, options?: MessageOptions) {
            await this.show("error", message, options);
        }

        async showSuccess(message: string, options?: MessageOptions) {
            await this.show("success", message, options);
        }

        async showInfo(message: string, options?: MessageOptions) {
            await this.show("info", message, options);
        }

        async showWarning(message: string, options?: MessageOptions) {
            await this.show("warning", message, options);
        }

        hide() {
            this.showMessage = false;
        }

    }
</script>
