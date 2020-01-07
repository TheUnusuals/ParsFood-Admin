<template>
    <div>
        <v-expand-transition>
            <v-card v-if="group && !editing" flat>
                <v-card-title>
                    {{group.name}}
                    <v-spacer/>
                    <v-btn color="primary" @click="edit()" outlined>
                        {{$t('components.additional-ingredients-group-component.edit')}}
                    </v-btn>
                    <confirm-dialog :title="$t('components.additional-ingredients-group-component.delete-dialog.title')"
                                    :confirm-text="$t('components.additional-ingredients-group-component.delete')"
                                    :cancel-text="$t('components.additional-ingredients-group-component.delete-dialog.cancel')"
                                    :confirm="deleteGroup"
                                    :on-error="deleteError"
                                    v-if="onDelete"
                                    v-slot="{ on }">
                        <v-btn class="ml-2" color="error" v-on="on" outlined>
                            {{$t('components.additional-ingredients-group-component.delete')}}
                        </v-btn>
                    </confirm-dialog>
                </v-card-title>
                <v-card-text>
                    {{$t('components.additional-ingredients-group-component.ingredients')}}:
                    <ul>
                        <li v-for="(additionalIngredient, i) of group.ingredients" :key="i">
                            {{additionalIngredient.name}} | {{$n(additionalIngredient.price, 'currency')}}
                        </li>
                    </ul>
                </v-card-text>
            </v-card>
        </v-expand-transition>

        <v-expand-transition>
            <v-card :loading="loading" :disabled="disabled" v-if="editing" flat>
                <validation-observer v-slot="{handleSubmit}">
                    <v-form @submit.prevent="handleSubmit(save)">
                        <v-card-text>
                            <validation-provider :name="$t('components.additional-ingredients-group-component.name')"
                                                 rules="required"
                                                 v-slot="{ errors }"
                                                 slim>
                                <v-text-field v-model="editedGroup.name"
                                              :label="$t('components.additional-ingredients-group-component.name')"
                                              outlined
                                              :error-messages="errors"
                                              required/>
                            </validation-provider>

                            <v-card outlined>
                                <v-card-title>
                                    {{$t('components.additional-ingredients-group-component.ingredients')}}:
                                </v-card-title>
                                <v-divider/>
                                <v-list>
                                    <v-card-text v-if="editedGroup.ingredients.length === 0">
                                        {{$t('components.additional-ingredients-group-component.ingredients-empty')}}
                                    </v-card-text>
                                    <div v-for="(ingredient, i) of editedGroup.ingredients" :key="i">
                                        <v-divider v-if="i !== 0"/>
                                        <v-list-item>
                                            <v-list-item-content>
                                                <validation-provider
                                                        :name="$t('components.additional-ingredients-group-component.ingredient-name')"
                                                        rules="required"
                                                        v-slot="{ errors }"
                                                        slim>
                                                    <v-text-field v-model="ingredient.name"
                                                                  :style="{'width': $vuetify.breakpoint.xs ? '100%' : undefined}"
                                                                  :label="$t('components.additional-ingredients-group-component.ingredient-name')"
                                                                  :error-messages="errors"
                                                                  dense
                                                                  required/>
                                                </validation-provider>

                                                <validation-provider
                                                        :name="$t('components.additional-ingredients-group-component.ingredient-price')"
                                                        rules="required|min_value:0"
                                                        v-slot="{ errors }"
                                                        slim>
                                                    <v-text-field v-model.number="ingredient.price"
                                                                  type="number"
                                                                  min="0"
                                                                  step="0.01"
                                                                  class="ml-sm-2"
                                                                  :label="$t('components.additional-ingredients-group-component.ingredient-price')"
                                                                  :error-messages="errors"
                                                                  :style="{'max-width': $vuetify.breakpoint.smAndUp ? '100px' : undefined}"
                                                                  dense
                                                                  required/>
                                                </validation-provider>
                                            </v-list-item-content>
                                            <v-list-item-action>
                                                <v-btn color="error" @click="editedGroup.ingredients.splice(i, 1)" icon>
                                                    <v-icon>mdi-delete</v-icon>
                                                </v-btn>
                                            </v-list-item-action>
                                        </v-list-item>
                                    </div>
                                </v-list>
                                <v-divider/>
                                <v-card-actions>
                                    <v-btn color="primary" @click="editedGroup.ingredients.push({name: '', price: 0})">
                                        {{$t('components.additional-ingredients-group-component.add-ingredient')}}
                                    </v-btn>
                                </v-card-actions>
                            </v-card>
                        </v-card-text>
                        <v-card-actions>
                            <v-btn type="submit" color="primary">
                                {{creation ? $t('components.additional-ingredients-group-component.create')
                                : $t('components.additional-ingredients-group-component.update')}}
                            </v-btn>
                            <v-btn color="error" @click="cancel()" outlined>
                                {{$t('components.additional-ingredients-group-component.cancel')}}
                            </v-btn>
                        </v-card-actions>
                    </v-form>
                </validation-observer>
            </v-card>
        </v-expand-transition>
    </div>
</template>

<script lang="ts">
    import Vue from "vue";
    import Component from "vue-class-component";
    import {AdditionalIngredientsGroup, IAdditionalIngredientsGroup} from "@/data/AdditionalIngredientsGroup";
    import {Prop} from "vue-property-decorator";
    import {ValidationObserver, ValidationProvider} from "vee-validate";
    import ConfirmDialog from "@/components/ConfirmDialog.vue";

    @Component({
        components: {ConfirmDialog, ValidationProvider, ValidationObserver}
    })
    export default class AdditionalIngredientsGroupsView extends Vue {

        loading: boolean = false;
        disabled: boolean = false;
        editing: boolean = false;

        editedGroup: IAdditionalIngredientsGroup = new AdditionalIngredientsGroup().copy({});

        @Prop()
        readonly group?: IAdditionalIngredientsGroup;

        @Prop({required: true})
        readonly onSave!: (editedGroup: IAdditionalIngredientsGroup) => Promise<void>;

        @Prop({required: true})
        readonly onSaveError!: (error: any) => Promise<void>;

        @Prop()
        readonly onDelete?: (editedGroup: IAdditionalIngredientsGroup) => Promise<void>;

        @Prop()
        readonly onDeleteError?: (error: any) => Promise<void>;

        @Prop()
        readonly onCancel?: () => Promise<void>;

        @Prop({default: () => false})
        readonly creation!: boolean;

        beforeMount() {
            this.editing = this.creation;
        }

        edit() {
            this.editing = true;
            AdditionalIngredientsGroup.copy(this.group!, this.editedGroup);
        }

        cancel() {
            this.editing = false;
            this.onCancel?.();
        }

        async deleteGroup() {
            if (this.onDelete)
                await this.onDelete(this.editedGroup);
        }

        async deleteError(error: any) {
            if (this.onDeleteError) {
                this.onDeleteError(error);
            }
        }

        async save() {
            this.loading = true;
            this.disabled = true;

            try {
                await this.onSave(this.editedGroup);

                if (!this.creation)
                    this.editing = false;
            } catch (error) {
                console.error(error);
                await this.onSaveError(error);
            }

            this.loading = false;
            this.disabled = false;
        }

    }
</script>
