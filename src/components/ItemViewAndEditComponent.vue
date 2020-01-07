<template>
    <state-multiplexer-component :valid-states="states" :state="state">
        <template #view>
            <v-card flat>
                <v-card-title>
                    {{title}}
                    <v-spacer/>
                    <v-btn color="primary" @click="edit()" v-if="onSave" outlined>
                        {{editText || $t('components.item-view-and-edit-component.edit')}}
                    </v-btn>
                    <confirm-dialog
                            :title="deleteDialogTitle || $t('components.item-view-and-edit-component.delete-dialog.title')"
                            :confirm-text="deleteDialogDelete || deleteText || $t('components.item-view-and-edit-component.delete')"
                            :cancel-text="deleteDialogCancel || $t('components.item-view-and-edit-component.delete-dialog.cancel')"
                            :confirm="deleteItem"
                            :on-error="deleteError"
                            v-if="onDelete"
                            v-slot="{ on }">
                        <v-btn class="ml-2" color="error" v-on="on" outlined>
                            {{deleteText || $t('components.item-view-and-edit-component.delete')}}
                        </v-btn>
                    </confirm-dialog>
                </v-card-title>
                <v-card-text>
                    <slot name="view"/>
                </v-card-text>
            </v-card>
        </template>
        <template #edit>
            <v-card :loading="loading" :disabled="disabled" flat>
                <validation-observer v-slot="{ handleSubmit }" slim>
                    <v-form>
                        <v-card-text>
                            <slot name="edit"/>
                        </v-card-text>
                        <v-card-actions>
                            <v-btn @click="handleSubmit(save)" color="primary">
                                {{creation ? createText || $t('components.item-view-and-edit-component.create')
                                : updateText || $t('components.item-view-and-edit-component.update')}}
                            </v-btn>
                            <v-btn @click="cancel()" color="error" outlined>
                                {{cancelText || $t('components.item-view-and-edit-component.cancel')}}
                            </v-btn>
                        </v-card-actions>
                    </v-form>
                </validation-observer>
            </v-card>
        </template>
    </state-multiplexer-component>
</template>

<script lang="ts">
    import Vue from "vue";
    import Component from "vue-class-component";
    import StateMultiplexerComponent from "@/components/StateMultiplexerComponent.vue";
    import {Prop, Watch} from "vue-property-decorator";
    import {ValidationObserver, ValidationProvider} from "vee-validate";
    import ConfirmDialog from "@/components/ConfirmDialog.vue";

    type ComponentState = "view" | "edit";

    @Component({
        components: {ConfirmDialog, StateMultiplexerComponent, ValidationProvider, ValidationObserver}
    })
    export default class ItemViewAndEditComponent extends Vue {

        states: ComponentState[] = ["view", "edit"];
        state: ComponentState = "view";

        loading: boolean = false;
        disabled: boolean = false;

        @Prop() readonly title?: string;

        @Prop() readonly onEdit?: () => void;
        @Prop() readonly onEditClose?: () => void;
        @Prop() readonly onSave?: () => Promise<void>;
        @Prop() readonly onSaveError?: (error: any) => void;
        @Prop() readonly onDelete?: () => Promise<void>;
        @Prop() readonly onDeleteError?: (error: any) => void;
        @Prop() readonly onCancel?: () => Promise<void>;

        @Prop({default: () => false}) readonly creation!: boolean;

        @Prop() readonly editText?: string;
        @Prop() readonly deleteText?: string;
        @Prop() readonly deleteDialogTitle?: string;
        @Prop() readonly deleteDialogDelete?: string;
        @Prop() readonly deleteDialogCancel?: string;
        @Prop() readonly createText?: string;
        @Prop() readonly updateText?: string;
        @Prop() readonly cancelText?: string;

        @Watch("state")
        onState(newState: ComponentState, oldState: ComponentState) {
            if (oldState === "edit") {
                this.onEditClose?.();
            }
        }

        beforeMount() {
            if (this.creation) this.state = "edit";
        }

        edit() {
            if (this.onSave) this.state = "edit";
            this.onEdit?.();
        }

        cancel() {
            if (!this.creation) this.state = "view";
            this.onCancel?.();
        }

        async deleteItem() {
            if (this.onDelete) await this.onDelete();
        }

        deleteError(error: any) {
            if (this.onDeleteError) this.onDeleteError(error);
        }

        async save() {
            if (!this.onSave) return;

            this.loading = true;
            this.disabled = true;

            try {
                await this.onSave();
                if (!this.creation) this.state = "view";
            } catch (error) {
                this.onSaveError?.(error);
            }

            this.loading = false;
            this.disabled = false;
        }

    }
</script>
