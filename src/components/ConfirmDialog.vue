<template>
    <v-dialog v-model="dialog" width="initial">
        <template #activator="scope" v-if="$scopedSlots.default">
            <slot v-bind="scope"/>
        </template>
        <v-card :loading="loading" :disabled="loading">
            <v-card-title style="word-break: initial">{{title}}</v-card-title>
            <v-card-actions>
                <v-btn @click="dialog = false" text>{{cancelText}}</v-btn>
                <v-btn :color="confirmColor" @click="onConfirm" text>{{confirmText}}</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script lang="ts">
    import Vue from "vue";
    import Component from "vue-class-component";
    import {Prop} from "vue-property-decorator";

    @Component
    export default class ConfirmDialog extends Vue {

        dialog: boolean = false;
        loading: boolean = false;
        error: string = "";

        @Prop({required: true}) readonly title!: string;
        @Prop({required: true}) readonly cancelText!: string;
        @Prop({required: true}) readonly confirmText!: string;
        @Prop({default: "error"}) readonly confirmColor!: string;

        @Prop({required: true}) readonly confirm!: () => Promise<void>;
        @Prop({
            default: null,
            type: [String, Function]
        }) readonly onError?: string | ((error: any) => Promise<string | undefined>);

        async onConfirm() {
            this.loading = true;

            try {
                await this.confirm();
                this.dialog = false;
            } catch (error) {
                const message = typeof this.onError === "function" ? await this.onError(error) : this.onError;

                if (message) {
                    this.error = message;
                }
            }

            this.loading = false;
        }

    }
</script>
