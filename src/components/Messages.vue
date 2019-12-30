<template>
    <v-snackbar :color="colors[type]" v-model="showMessage" :timeout="timeout" top>
        {{message}}
        <v-btn @click="showMessage = false" text>{{$t('common.snackbar.close')}}</v-btn>
    </v-snackbar>
</template>

<script lang="ts">
    import Vue from "vue";
    import Component from "vue-class-component";
    import {MessageType} from "@/components/Messages";

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

        async show(type: MessageType, message: string) {
            this.type = type;
            this.message = message;
            this.showMessage = false;
            await this.$nextTick();
            this.showMessage = true;
        }

        async showError(message: string) {
            await this.show("error", message);
        }

        async showSuccess(message: string) {
            await this.show("success", message);
        }

        async showInfo(message: string) {
            await this.show("info", message);
        }

        async showWarning(message: string) {
            await this.show("warning", message);
        }

        hide() {
            this.showMessage = false;
        }

    }
</script>
