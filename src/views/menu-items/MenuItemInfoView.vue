<template>
    <div>
        <v-btn :to="{name: 'menu-items', params: {providerId: providerId}}"
               class="mb-2"
               text
               small>
            <v-icon>mdi-keyboard-backspace</v-icon>
            {{$t('views.menu-item-info.back')}}
        </v-btn>
        <v-card>
            <menu-item-component ref="menuItemComponent"
                                 :on-save="update"
                                 :on-save-error="updateError"
                                 :on-delete="deleteMenuItem"
                                 :on-delete-error="deleteError"
                                 :provider-id="providerId"
                                 :menu-item="menuItem"
                                 :additional-ingredients-groups="additionalIngredientsGroup.list"
                                 :additional-ingredients-groups-loading="additionalIngredientsGroup.syncing"/>
        </v-card>
    </div>
</template>

<script lang="ts">
    import Vue from "vue";
    import Component from "vue-class-component";
    import {additionalIngredientsGroupsModule, menuItemsModule} from "@/store/store";
    import {Prop, Ref} from "vue-property-decorator";
    import {IMenuItem} from "@/data/MenuItem";
    import MenuItemComponent from "@/components/menu-items/MenuItemComponent.vue";
    import Messages from "@/components/Messages.vue";
    import {
        deleteDocument,
        FirestoreObjectOptions,
        NormalizedFirestoreObjectOptions,
        normalizeFirestoreObjectOptions,
        setDocument
    } from "@/common/js/firestore-utils";
    import {deleteStorageFile} from "@/common/js/storage-utils";
    import {firebaseFirestore} from "@/plugins/firebase";

    class PicturesError extends Error {
        constructor(public error: any) {
            super();
        }
    }

    @Component({
        components: {MenuItemComponent}
    })
    export default class MenuItemInfoView extends Vue {

        @Prop({required: true}) readonly providerId!: string;
        @Prop({required: true}) readonly menuItemId!: string;

        @Ref() readonly menuItemComponent!: MenuItemComponent;

        stopMenuItemsSync!: () => void;
        stopAdditionalIngredientsGroupsSync!: () => void;

        get messages(): Messages {
            return this.$inject("messages");
        }

        get menuItemOptions(): FirestoreObjectOptions {
            return `/providers/${this.providerId}/menu-items`;
        }

        get normalizedMenuItemOptions(): NormalizedFirestoreObjectOptions {
            return normalizeFirestoreObjectOptions(this.menuItemOptions);
        }

        get menuItem(): IMenuItem | undefined {
            return menuItemsModule.collections[this.providerId].list.find(menuItem => menuItem.id === this.menuItemId);
        }

        get additionalIngredientsGroup() {
            return additionalIngredientsGroupsModule.collections[this.providerId];
        }

        beforeMount() {
            this.stopMenuItemsSync = menuItemsModule.syncMenuItems(this.providerId);
            this.stopAdditionalIngredientsGroupsSync = additionalIngredientsGroupsModule.syncGroups(this.providerId);
        }

        destroyed() {
            this.stopMenuItemsSync();
            this.stopAdditionalIngredientsGroupsSync();
        }

        async update(editedMenuItem: IMenuItem) {
            await setDocument(editedMenuItem, this.menuItemOptions);

            try {
                const pictures = await this.menuItemComponent.savePictures();
                await firebaseFirestore
                    .collection(this.normalizedMenuItemOptions.collectionPath)
                    .doc(editedMenuItem.id)
                    .update({pictures});
            } catch (error) {
                throw new PicturesError(error);
            }
        }

        updateError(error: any) {
            if (error instanceof PicturesError) {
                this.messages.showError(this.$t("views.menu-item-info.messages.failed-to-update-pictures") as string);
                console.error(error.error);
            } else {
                this.messages.showError(this.$t("views.menu-item-info.messages.failed-to-update") as string);
                console.error(error);
            }
        }

        async deleteMenuItem() {
            if (this.menuItem) {
                try {
                    for (let path of this.menuItem.pictures) {
                        await deleteStorageFile(path);
                    }
                } catch (error) {
                    throw new PicturesError(error);
                }

                await deleteDocument(this.menuItem.id, this.menuItemOptions);
                await this.messages.showSuccess(this.$t("views.menu-item-info.messages.menu-item-deleted") as string);
                await this.$router.push({name: "menu-items", params: {providerId: this.providerId}});
            }
        }

        deleteError(error: any) {
            if (error instanceof PicturesError) {
                this.messages.showError(this.$t("views.menu-item-info.messages.failed-to-delete-pictures") as string);
                console.error(error.error);
            } else {
                this.messages.showError(this.$t("views.menu-item-info.messages.failed-to-delete") as string);
                console.error(error);
            }
        }

    }
</script>
