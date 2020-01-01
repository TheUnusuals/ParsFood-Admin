<template>
    <v-card>
        <v-card-title>
            {{$t('views.additional-ingredients-groups.title')}}
            <v-spacer/>
            <v-btn :to="{name: 'create-additional-ingredients-group', params: {providerId: providerId}}"
                   color="primary">
                {{$t('views.additional-ingredients-groups.create')}}
            </v-btn>
        </v-card-title>

        <v-card-text class="pb-0">
            <v-form @submit="changeProvider(selectedProviderId)">
                <v-autocomplete :items="providersModule.sortedProviders"
                                v-model="selectedProviderId"
                                :loading="providersModule.syncing"
                                item-text="name"
                                item-value="id"
                                :label="$t('views.additional-ingredients-groups.provider')"/>
            </v-form>
        </v-card-text>

        <v-card-title class="pt-0">
            {{$t('views.additional-ingredients-groups.provider-groups')}}:
        </v-card-title>

        <v-data-table :items="groups ? groups.list : []"
                      :headers="headers"
                      :loading="groups ? groups.syncing : true"
                      :search="filter"
                      sort-by="name"
                      must-sort>
            <template #top>
                <div class="mx-4 mb-2">
                    <v-text-field v-model="filter"
                                  :placeholder="$t('views.additional-ingredients-groups.list.filter')"
                                  clearable
                                  dense
                                  hide-details/>
                </div>
            </template>
            <template #item.ingredients="{ item }">
                {{item.ingredients.length ? item.ingredients
                .map(ingredient => `${ingredient.name} - ${$n(ingredient.price, 'currency')}`)
                .join(', ')
                : '-'}}
            </template>
            <template #item.actions="{ item }">
                <v-btn :to="{
                            name: 'additional-ingredients-group-info',
                            params: { providerId: providerId, additionalIngredientsGroupId: item.id }
                        }"
                       :title="$t('views.additional-ingredients-groups.list.view')"
                       icon>
                    <v-icon>mdi-eye</v-icon>
                </v-btn>
                <v-btn :title="$t('views.additional-ingredients-groups.list.duplicate')"
                       @click="duplicateGroup(item)"
                       :loading="loadingDuplicate"
                       icon>
                    <v-icon>mdi-content-copy</v-icon>
                </v-btn>
                <confirm-dialog :title="$t('views.additional-ingredients-groups.delete-dialog.title')"
                                :confirm-text="$t('views.additional-ingredients-groups.list.delete')"
                                :cancel-text="$t('views.additional-ingredients-groups.delete-dialog.cancel')"
                                :confirm="() => deleteGroup(item.id)"
                                :on-error="deleteError"
                                v-slot="{ on }">
                    <v-btn :title="$t('views.additional-ingredients-groups.list.delete')"
                           v-on="on"
                           color="error"
                           icon>
                        <v-icon>mdi-delete</v-icon>
                    </v-btn>
                </confirm-dialog>
            </template>
        </v-data-table>
    </v-card>
</template>

<script lang="ts">
    import Vue from "vue";
    import Component from "vue-class-component";
    import {AdditionalIngredientGroup, IAdditionalIngredientGroup} from "@/data/AdditionalIngredientGroup";
    import {Prop, Watch} from "vue-property-decorator";
    import {ValidationObserver, ValidationProvider} from "vee-validate";
    import {additionalIngredientsGroupsModule, providersModule} from "@/store/store";
    import {CollectionSyncedList} from "@/common/vuex/FirestoreCollectionsModule";
    import {TableHeader} from "@/plugins/vuetify";
    import {i18n} from "@/plugins/i18n";
    import ConfirmDialog from "@/components/ConfirmDialog.vue";
    import Messages from "@/components/Messages.vue";
    import {addDocument, deleteDocument, FirestoreObjectOptions} from "@/common/js/firestore-utils";

    @Component({
        components: {ConfirmDialog, ValidationProvider, ValidationObserver}
    })
    export default class AdditionalIngredientsGroupsView extends Vue {

        headers: TableHeader[] = [
            {value: "name", text: i18n.t("views.additional-ingredients-groups.list.name") as string},
            {
                value: "ingredients",
                text: i18n.t("views.additional-ingredients-groups.list.ingredients") as string,
                sortable: false
            },
            {
                value: "actions",
                text: i18n.t("views.additional-ingredients-groups.list.actions") as string,
                sortable: false
            },
        ];

        filter: string = "";
        selectedProviderId: string = "";

        loadingDuplicate: boolean = false;

        @Prop({required: true})
        readonly providerId!: string;

        get groups(): CollectionSyncedList<IAdditionalIngredientGroup> {
            return additionalIngredientsGroupsModule.collections[this.providerId];
        }

        get providersModule() {
            return providersModule;
        }

        get additionalIngredientGroupOptions(): FirestoreObjectOptions {
            return {
                collectionPath: `/providers/${this.providerId}/additional-ingredients-groups`
            };
        }

        get messages(): Messages {
            return this.$inject("messages");
        }

        stopGroupsSync?: () => void;
        stopProvidersSync!: () => void;

        beforeMount() {
            this.stopProvidersSync = providersModule.syncProviders();
        }

        destroyed() {
            this.stopProvidersSync();
            this.stopGroupsSync?.();
        }

        @Watch("providerId", {immediate: true})
        onProviderId() {
            this.selectedProviderId = this.providerId;

            this.stopGroupsSync?.();
            this.stopGroupsSync = additionalIngredientsGroupsModule.syncGroups(this.providerId);
        }

        @Watch("selectedProviderId")
        onSelectedProviderId() {
            this.changeProvider(this.selectedProviderId);
        }

        async changeProvider(providerId: string) {
            if (providerId !== this.providerId && providersModule.providers.find(provider => provider.id === providerId))
                await this.$router.push({name: "additional-ingredients-groups", params: {providerId: providerId}});
        }

        async deleteGroup(groupId: string) {
            await deleteDocument(groupId, this.additionalIngredientGroupOptions);
            await this.messages.showSuccess(this.$t("views.additional-ingredients-groups.messages.group-deleted") as string);
        }

        async deleteError(error: any) {
            console.error(error);
            await this.messages.showError(this.$t("views.additional-ingredients-groups.messages.failed-to-delete-group") as string);
        }

        async duplicateGroup(group: IAdditionalIngredientGroup) {
            this.loadingDuplicate = true;

            const groupDuplicate = AdditionalIngredientGroup.copy(group, {});

            for (let i = 1; ; i++) {
                const name = `${groupDuplicate.name} (${i})`;
                if (!this.groups.list.find(group => group.name === name)) {
                    groupDuplicate.name = name;
                    break;
                }
            }

            try {
                await addDocument(groupDuplicate, this.additionalIngredientGroupOptions);
                await this.messages.showSuccess(this.$t("views.additional-ingredients-groups.messages.group-duplicated") as string);
            } catch (error) {
                console.error(error);
                await this.messages.showError(this.$t("views.additional-ingredients-groups.messages.failed-to-duplicate-group") as string);
            }

            this.loadingDuplicate = false;
        }

    }
</script>
