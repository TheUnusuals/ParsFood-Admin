<template>
    <v-card>
        <v-card-title>{{$t('views.additional-ingredients-group-create.title')}}</v-card-title>

        <additional-ingredients-group-component :on-save="create"
                                                :on-save-error="createError"
                                                :on-cancel="cancel"
                                                creation/>
    </v-card>
</template>

<script lang="ts">
    import Vue from "vue";
    import Component from "vue-class-component";
    import AdditionalIngredientsGroupComponent
        from "@/components/additional-ingredients-groups/AdditionalIngredientsGroupComponent.vue";
    import {IAdditionalIngredientsGroup} from "@/data/AdditionalIngredientsGroup";
    import Messages from "@/components/Messages.vue";
    import {addDocument, FirestoreObjectOptions} from "@/common/js/firestore-utils";
    import {Prop} from "vue-property-decorator";

    @Component({
        components: {AdditionalIngredientsGroupComponent}
    })
    export default class AdditionalIngredientsGroupCreateView extends Vue {

        @Prop({required: true})
        readonly providerId!: string;

        get additionalIngredientGroupOptions(): FirestoreObjectOptions {
            return {
                collectionPath: `/providers/${this.providerId}/additional-ingredients-groups`
            };
        }

        get messages(): Messages {
            return this.$inject("messages");
        }

        async create(group: IAdditionalIngredientsGroup) {
            await addDocument(group, this.additionalIngredientGroupOptions);
            await this.messages.showSuccess(this.$t("views.additional-ingredients-group-create.messages.group-created") as string);
            await this.$router.push({name: "additional-ingredients-groups", params: {providerId: this.providerId}});
        }

        async createError(error: any) {
            console.error(error);
            await this.messages.showError(this.$t("views.additional-ingredients-group-create.messages.failed-to-create-group") as string);
        }

        async cancel() {
            await this.$router.push({name: "additional-ingredients-groups", params: {providerId: this.providerId}});
        }

    }
</script>
