<template>
    <v-card>
        <v-card-title>
            {{$t('views.menu-items.title')}}
            <v-spacer/>
            <v-btn :to="{name: 'create-menu-item', params: {providerId: providerId}}"
                   color="primary">
                {{$t('views.menu-items.create')}}
            </v-btn>
        </v-card-title>

        <v-card-text class="pb-0">
            <v-form @submit="changeProvider(selectedProviderId)">
                <v-autocomplete :items="providersModule.sortedProviders"
                                v-model="selectedProviderId"
                                :loading="providersModule.syncing"
                                item-text="name"
                                item-value="id"
                                :label="$t('views.menu-items.provider')"/>
            </v-form>
        </v-card-text>

        <v-card-title class="pt-0">
            {{$t('views.menu-items.provider-menu-items')}}:
        </v-card-title>

        <v-data-table :items="menuItems ? menuItems.list : []"
                      :headers="headers"
                      :loading="menuItems ? menuItems.syncing : true"
                      :search="filter"
                      sort-by="name"
                      must-sort>
            <template #top>
                <div class="mx-4 mb-2">
                    <v-text-field v-model="filter"
                                  :placeholder="$t('views.menu-items.list.filter')"
                                  clearable
                                  dense
                                  hide-details/>
                </div>
            </template>
            <template #item.actions="{ item }">
                <v-btn :to="{name: 'menu-item-info', params: {providerId: providerId, menuItemId: item.id}}"
                       :title="$t('views.menu-items.list.view')"
                       icon>
                    <v-icon>mdi-eye</v-icon>
                </v-btn>
                <v-btn :title="$t('views.menu-items.list.duplicate')"
                       @click="duplicateMenuItem(item)"
                       :loading="loadingDuplicate"
                       icon>
                    <v-icon>mdi-content-copy</v-icon>
                </v-btn>
                <confirm-dialog :title="$t('views.menu-items.delete-dialog.title')"
                                :confirm-text="$t('views.menu-items.list.delete')"
                                :cancel-text="$t('views.menu-items.delete-dialog.cancel')"
                                :confirm="() => deleteMenuItem(item)"
                                :on-error="deleteError"
                                v-slot="{ on }">
                    <v-btn :title="$t('views.menu-items.list.delete')"
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
    import {Prop, Watch} from "vue-property-decorator";
    import {ValidationObserver, ValidationProvider} from "vee-validate";
    import {menuItemsModule, providersModule} from "@/store/store";
    import {CollectionSyncedList} from "@/common/vuex/FirestoreCollectionsModule";
    import {TableHeader} from "@/plugins/vuetify";
    import {i18n} from "@/plugins/i18n";
    import ConfirmDialog from "@/components/ConfirmDialog.vue";
    import Messages from "@/components/Messages.vue";
    import {addDocument, deleteDocument, FirestoreObjectOptions} from "@/common/js/firestore-utils";
    import {IMenuItem, MenuItem} from "@/data/MenuItem";
    import {deleteStorageFile} from "../../../ParsFood-Common/src/js/storage-utils";

    class PicturesError extends Error {
        constructor(public error: any) {
            super();
        }
    }

    @Component({
        components: {ConfirmDialog, ValidationProvider, ValidationObserver}
    })
    export default class MenuItemsView extends Vue {

        headers: TableHeader[] = [
            {value: "name", text: i18n.t("views.menu-items.list.name") as string},
            {
                value: "actions",
                text: i18n.t("views.menu-items.list.actions") as string,
                sortable: false
            },
        ];

        filter: string = "";
        selectedProviderId: string = "";

        loadingDuplicate: boolean = false;

        @Prop({required: true})
        readonly providerId!: string;

        get menuItems(): CollectionSyncedList<IMenuItem> {
            return menuItemsModule.collections[this.providerId];
        }

        get providersModule() {
            return providersModule;
        }

        get menuItemOptions(): FirestoreObjectOptions {
            return {
                collectionPath: `/providers/${this.providerId}/menu-items`
            };
        }

        get messages(): Messages {
            return this.$inject("messages");
        }

        stopMenuItemsSync?: () => void;
        stopProvidersSync!: () => void;

        beforeMount() {
            this.stopProvidersSync = providersModule.syncProviders();
        }

        destroyed() {
            this.stopProvidersSync();
            this.stopMenuItemsSync?.();
        }

        @Watch("providerId", {immediate: true})
        onProviderId() {
            this.selectedProviderId = this.providerId;

            this.stopMenuItemsSync?.();
            this.stopMenuItemsSync = menuItemsModule.syncMenuItems(this.providerId);
        }

        @Watch("selectedProviderId")
        onSelectedProviderId() {
            this.changeProvider(this.selectedProviderId);
        }

        async changeProvider(providerId: string) {
            if (providerId !== this.providerId && providersModule.providers.find(provider => provider.id === providerId))
                await this.$router.push({name: "menu-items", params: {providerId: providerId}});
        }

        async deleteMenuItem(menuItem: IMenuItem) {
            try {
                for (let path of menuItem.pictures) {
                    await deleteStorageFile(path);
                }
            } catch (error) {
                throw new PicturesError(error);
            }

            await deleteDocument(menuItem.id, this.menuItemOptions);
            await this.messages.showSuccess(this.$t("views.menu-items.messages.menu-item-deleted") as string);
        }

        async deleteError(error: any) {
            if (error instanceof PicturesError) {
                console.error(error.error);
                await this.messages.showError(this.$t("views.menu-items.messages.failed-to-delete-pictures") as string);
            } else {
                console.error(error);
                await this.messages.showError(this.$t("views.menu-items.messages.failed-to-delete-menu-item") as string);
            }
        }

        async duplicateMenuItem(menuItem: IMenuItem) {
            this.loadingDuplicate = true;

            const menuItemDuplicate = MenuItem.copy(menuItem, {});

            for (let i = 1; ; i++) {
                const name = `${menuItemDuplicate.name} (${i})`;
                if (!this.menuItems.list.find(group => group.name === name)) {
                    menuItemDuplicate.name = name;
                    break;
                }
            }

            menuItemDuplicate.pictures = [];

            try {
                await addDocument(menuItemDuplicate, this.menuItemOptions);
                await this.messages.showSuccess(this.$t("views.menu-items.messages.menu-item-duplicated") as string);
            } catch (error) {
                console.error(error);
                await this.messages.showError(this.$t("views.menu-items.messages.failed-to-duplicate-menu-item") as string);
            }

            this.loadingDuplicate = false;
        }

    }
</script>
