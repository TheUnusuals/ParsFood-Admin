<template>
    <v-card>
        <v-card-title>{{$t('views.menu-item-create.title')}}</v-card-title>

        <menu-item-component ref="menuItemComponent"
                             :on-save="create"
                             :on-save-error="createError"
                             :on-cancel="cancel"
                             :additional-ingredients-groups="additionalIngredientsGroup.list"
                             :additional-ingredients-groups-loading="additionalIngredientsGroup.syncing"
                             :provider-id="providerId"
                             creation/>
    </v-card>
</template>

<script lang="ts">
    import Vue from "vue";
    import Component from "vue-class-component";
    import Messages from "@/components/Messages.vue";
    import {
        addDocument,
        FirestoreObjectOptions,
        NormalizedFirestoreObjectOptions,
        normalizeFirestoreObjectOptions
    } from "@/common/js/firestore-utils";
    import {Prop, Ref} from "vue-property-decorator";
    import MenuItemComponent from "@/components/menu-items/MenuItemComponent.vue";
    import {IMenuItem} from "@/data/MenuItem";
    import {firebaseFirestore} from "@/plugins/firebase";
    import {additionalIngredientsGroupsModule} from "@/store/store";

    class PicturesError extends Error {
        constructor(public error: any) {
            super();
        }
    }

    @Component({
        components: {MenuItemComponent}
    })
    export default class MenuItemCreateView extends Vue {

        @Prop({required: true}) readonly providerId!: string;

        @Ref() readonly menuItemComponent!: MenuItemComponent;

        stopAdditionalIngredientsGroupsSync!: () => void;

        get menuItemOptions(): FirestoreObjectOptions {
            return {
                collectionPath: `/providers/${this.providerId}/menu-items`
            };
        }

        get normalizedMenuItemOptions(): NormalizedFirestoreObjectOptions {
            return normalizeFirestoreObjectOptions(this.menuItemOptions);
        }

        get messages(): Messages {
            return this.$inject("messages");
        }

        get additionalIngredientsGroup() {
            return additionalIngredientsGroupsModule.collections[this.providerId];
        }

        beforeMount() {
            this.stopAdditionalIngredientsGroupsSync = additionalIngredientsGroupsModule.syncGroups(this.providerId);
        }

        destroyed() {
            this.stopAdditionalIngredientsGroupsSync();
        }

        async create(menuItem: IMenuItem) {
            const menuItemRef = await addDocument(menuItem, this.menuItemOptions);

            try {
                const pictures = await this.menuItemComponent.savePictures(menuItemRef.id);
                await firebaseFirestore
                    .collection(this.normalizedMenuItemOptions.collectionPath)
                    .doc(menuItemRef.id)
                    .update({pictures});

                await this.messages.showSuccess(this.$t("views.menu-item-create.messages.menu-item-created") as string);
                await this.$router.push({name: "menu-items", params: {providerId: this.providerId}});
            } catch (error) {
                throw new PicturesError(error);
            }
        }

        async createError(error: any) {
            if (error instanceof PicturesError) {
                await this.messages.showWarning(
                    this.$t("views.menu-item-create.messages.menu-item-created-but-pictures-not-uploaded") as string,
                    {timeout: 15000}
                );
                await this.$router.push({name: "menu-items", params: {providerId: this.providerId}});
            } else {
                console.error(error);
                await this.messages.showError(this.$t("views.menu-item-create.messages.failed-to-create-menu-item") as string);
            }
        }

        async cancel() {
            await this.$router.push({name: "menu-items", params: {providerId: this.providerId}});
        }

    }
</script>
