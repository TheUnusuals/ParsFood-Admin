<template>
    <div>
        <v-btn :to="{name: 'additional-ingredients-groups', params: {providerId: providerId}}"
               class="mb-2"
               text
               small>
            <v-icon>mdi-keyboard-backspace</v-icon>
            {{$t('views.additional-ingredients-group-info.back')}}
        </v-btn>
        <v-card>
            <additional-ingredients-group-component
                    :group="group"
                    :on-save="update"
                    :on-save-error="updateError"
                    :on-delete="deleteGroup"
                    :on-delete-error="deleteError"
                    v-if="group"/>
        </v-card>
    </div>
</template>

<script lang="ts">
    import Vue from "vue";
    import Component from "vue-class-component";
    import {IAdditionalIngredientGroup} from "@/data/AdditionalIngredientGroup";
    import {Prop} from "vue-property-decorator";
    import {deleteDocument, FirestoreObjectOptions, setDocument} from "@/common/js/firestore-utils";
    import Messages from "@/components/Messages.vue";
    import {ValidationObserver, ValidationProvider} from "vee-validate";
    import {additionalIngredientsGroupsModule} from "@/store/store";
    import {CollectionSyncedList} from "@/common/vuex/FirestoreCollectionsModule";
    import AdditionalIngredientsGroupComponent
        from "@/components/additional-ingredients-groups/AdditionalIngredientsGroupComponent.vue";

    @Component({
        components: {AdditionalIngredientsGroupComponent, ValidationProvider, ValidationObserver}
    })
    export default class AdditionalIngredientsGroupsView extends Vue {

        @Prop({required: true})
        readonly providerId!: string;

        @Prop({required: true})
        readonly additionalIngredientsGroupId!: string;

        get additionalIngredientGroupOptions(): FirestoreObjectOptions {
            return {
                collectionPath: `/providers/${this.providerId}/additional-ingredients-groups`
            };
        }

        get messages(): Messages {
            return this.$inject("messages");
        }

        get providerGroups(): CollectionSyncedList<IAdditionalIngredientGroup> {
            return additionalIngredientsGroupsModule.collections[this.providerId];
        }

        get group(): IAdditionalIngredientGroup | undefined {
            return this.providerGroups.list.find(group => group.id === this.additionalIngredientsGroupId);
        }

        stopGroupsSync!: () => void;

        beforeMount() {
            this.stopGroupsSync = additionalIngredientsGroupsModule.syncGroups(this.providerId);
        }

        destroyed() {
            this.stopGroupsSync();
        }

        async update(editedGroup: IAdditionalIngredientGroup) {
            await setDocument(editedGroup, this.additionalIngredientGroupOptions);
            await this.messages.showSuccess(this.$t("views.additional-ingredients-group-info.messages.group-updated") as string);
        }

        async updateError(error: any) {
            await this.messages.showError(this.$t("views.additional-ingredients-group-info.messages.failed-to-update-group") as string);
        }

        async deleteGroup() {
            if (this.group) {
                await deleteDocument(this.group.id, this.additionalIngredientGroupOptions);
                await this.messages.showSuccess(this.$t("views.additional-ingredients-group-info.messages.group-deleted") as string);
                await this.$router.push({name: "additional-ingredients-groups", params: {providerId: this.providerId}});
            }
        }

        async deleteError(error: any) {
            console.error(error);
            await this.messages.showError(this.$t("views.additional-ingredients-group-info.messages.failed-to-delete-group") as string);
        }

    }
</script>
