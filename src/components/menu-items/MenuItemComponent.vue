<template>
    <item-view-and-edit-component
            :title="menuItem && menuItem.name"
            :on-edit="edit"
            :on-edit-close="closeEdit"
            :on-delete="onDelete && deleteMenuItem"
            :on-delete-error="onDeleteError"
            :on-save="onSave && save"
            :on-save-error="onSaveError"
            :on-cancel="onCancel"
            :creation="creation"
            :delete-dialog-title="$t('components.menu-item-component.delete-dialog-title')">
        <template v-if="menuItem" #view>
            <v-row dense>
                <v-col cols="12" sm="6" :md="menuItem.pictures.length ? 6 : 12">
                    <strong>{{$t('components.menu-item-component.description')}}:</strong>
                    <p class="mb-0">{{menuItem.description}}</p>
                </v-col>
                <v-col cols="12" md="6" v-if="menuItem.pictures.length">
                    <cloud-storage-image-carousel :images="menuItem.pictures" max-height="300px"/>
                </v-col>
            </v-row>

            <v-row dense>
                <v-col cols="12" sm="6" md v-if="menuItem.ingredients.length">
                    <strong>{{$t('components.menu-item-component.ingredients')}}:</strong>
                    <ul class="mb-2">
                        <li v-for="(ingredient, i) of menuItem.ingredients" :key="i">
                            {{ingredient.name}}
                            ({{ingredient.removable ? $t('components.menu-item-component.removable')
                            : $t('components.menu-item-component.not-removable')}})
                        </li>
                    </ul>
                </v-col>

                <v-col cols="12" sm="6" md v-if="menuItem.requiredChoices.length">
                    <strong>{{$t('components.menu-item-component.required-choices')}}:</strong>
                    <ul class="mb-2">
                        <li v-for="(requiredChoice, i) of menuItem.requiredChoices" :key="i">
                            {{requiredChoice.name}}: {{requiredChoice.choices.join(', ')}}
                        </li>
                    </ul>
                </v-col>

                <v-col cols="12" sm="6" md>
                    <strong>{{$t('components.menu-item-component.sizes')}}:</strong>
                    <ul class="mb-2">
                        <li v-for="(size, i) of menuItem.sizes" :key="i">
                            {{size.name}}: {{$n(size.price, 'currency')}}
                        </li>
                    </ul>
                </v-col>

                <v-col cols="12" sm="6" md v-if="menuItem.assignedAdditionalIngredientsGroups.length">
                    <strong>{{$t('components.menu-item-component.assigned-additional-ingredients-groups')}}:</strong>
                    <v-progress-linear v-if="additionalIngredientsGroupsLoading" indeterminate/>
                    <ul class="mb-2" v-else>
                        <li v-for="(group, i) of assignedAdditionalIngredientsGroups" :key="i">
                            <template v-if="group.document">
                                {{group.document.name}}:
                                <v-btn v-if="providerId"
                                       :to="{name: 'additional-ingredients-group-info',
                                                params: {providerId: providerId, additionalIngredientsGroupId: group.id}}"
                                       target="_blank"
                                       x-small>
                                    {{$t('components.menu-item-component.view-additional-ingredients-group')}}
                                    <v-icon x-small>mdi-open-in-new</v-icon>
                                </v-btn>
                                <ul>
                                    <li v-for="(ingredient, j) of group.document.ingredients" :key="j">
                                        {{ingredient.name}} | {{$n(ingredient.price, 'currency')}}
                                    </li>
                                </ul>
                            </template>
                            <span class="ma-0 error--text" v-else>
                            <v-icon color="error" small>mdi-alert</v-icon>
                            {{$t('components.menu-item-component.assigned-additional-ingredients-group-not-found')}}
                        </span>
                        </li>
                    </ul>
                </v-col>
            </v-row>
        </template>
        <template #edit>
            <v-row dense>
                <v-col cols="12" md="6">
                    <validation-provider :name="$t('components.menu-item-component.name')"
                                         rules="required"
                                         v-slot="{ errors }"
                                         slim>
                        <v-text-field v-model="editedMenuItem.name"
                                      :label="$t('components.menu-item-component.name')"
                                      outlined
                                      :error-messages="errors"/>
                    </validation-provider>

                    <validation-provider :name="$t('components.menu-item-component.description')"
                                         rules="required"
                                         v-slot="{ errors }"
                                         slim>
                        <v-textarea v-model="editedMenuItem.description"
                                    :label="$t('components.menu-item-component.description')"
                                    outlined
                                    auto-grow
                                    :error-messages="errors"/>
                    </validation-provider>
                </v-col>

                <v-col cols="12" md="6">
                    <editable-cloud-storage-image-list :title="$t('components.menu-item-component.pictures')"
                                                       v-model="editedMenuItemUpdatedPictures"
                                                       :images.sync="editedMenuItem.pictures"
                                                       ref="picturesList"/>
                </v-col>
            </v-row>

            <v-row dense>
                <v-col cols="12" md="6">
                    <editable-list :title="$t('components.menu-item-component.ingredients')"
                                   v-model="editedMenuItem.ingredients"
                                   :add="newIngredient"
                                   can-order>
                        <template #default="{ item, itemKey }">
                            <validation-provider
                                    :vid="itemKey.toString()"
                                    :name="$t('components.menu-item-component.ingredient-name')"
                                    rules="required"
                                    v-slot="{ errors }"
                                    slim>
                                <v-text-field v-model="item.name"
                                              :label="$t('components.menu-item-component.ingredient-name')"
                                              :error-messages="errors"
                                              dense/>
                            </validation-provider>
                        </template>
                        <template #append="{ item }">
                            <v-checkbox v-model="item.removable"
                                        :label="$t('components.menu-item-component.ingredient-removable')"
                                        hide-details
                                        dense/>
                        </template>
                    </editable-list>

                    <validation-provider
                            :name="$t('components.menu-item-component.sizes')"
                            rules="min_length:1"
                            :skipIfEmpty="false"
                            :custom-messages="{'min_length': $tc('components.menu-item-component.validation.sizes', 1)}"
                            v-slot="{ errors }"
                            slim>
                        <editable-list :title="$t('components.menu-item-component.sizes')"
                                       v-model="editedMenuItem.sizes"
                                       :error-messages="errors"
                                       :add="newSize"
                                       can-order>
                            <template #default="{ item, itemKey }">
                                <validation-provider
                                        :vid="itemKey.toString() + 'name'"
                                        :name="$t('components.menu-item-component.size-name')"
                                        rules="required"
                                        v-slot="{ errors }"
                                        slim>
                                    <v-text-field v-model="item.name"
                                                  :label="$t('components.menu-item-component.size-name')"
                                                  :error-messages="errors"
                                                  dense/>
                                </validation-provider>
                            </template>
                            <template #append="{ item, itemKey }">
                                <validation-provider
                                        :vid="itemKey.toString() + 'price'"
                                        :name="$t('components.menu-item-component.size-price')"
                                        rules="required|min_value:0"
                                        v-slot="{ errors }"
                                        slim>
                                    <v-text-field v-model.number="item.price"
                                                  min="0"
                                                  step="0.01"
                                                  type="number"
                                                  :label="$t('components.menu-item-component.size-price')"
                                                  :error-messages="errors"
                                                  dense/>
                                </validation-provider>
                            </template>
                        </editable-list>
                    </validation-provider>
                </v-col>
                <v-col cols="12" md="6">
                    <editable-list :title="$t('components.menu-item-component.required-choices')"
                                   v-model="editedMenuItem.requiredChoices"
                                   :add="newRequiredChoice"
                                   v-slot="{ item, itemKey }"
                                   can-order>
                        <validation-provider
                                :vid="itemKey.toString() + 'name'"
                                :name="$t('components.menu-item-component.required-choice-name')"
                                rules="required"
                                v-slot="{ errors }"
                                slim>
                            <v-text-field v-model="item.name"
                                          :label="$t('components.menu-item-component.required-choice-name')"
                                          :error-messages="errors"
                                          dense/>
                        </validation-provider>
                        <validation-provider
                                :vid="itemKey.toString() + 'choices'"
                                :name="$t('components.menu-item-component.required-choice-choices')"
                                rules="required"
                                v-slot="{ errors }"
                                slim>
                            <v-combobox v-model="item.choices"
                                        :label="$t('components.menu-item-component.required-choice-choices')"
                                        :error-messages="errors"
                                        dense
                                        multiple
                                        clearable
                                        small-chips
                                        deletable-chips/>
                        </validation-provider>
                    </editable-list>

                    <v-autocomplete :label="$t('components.menu-item-component.assigned-additional-ingredients-groups')"
                                    :items="additionalIngredientsGroupsSelect"
                                    v-model="editedAssignedAdditionalIngredientsGroups"
                                    :filter="filterAdditionalIngredientsGroupsSelect"
                                    :loading="additionalIngredientsGroupsLoading"
                                    item-value="id"
                                    return-object
                                    hide-selected
                                    multiple
                                    clearable
                                    outlined>
                        <template #selection="{ item }">
                            <v-chip :color="!item.document ? 'error' : undefined"
                                    @click:close="removeAdditionalIngredientsGroup(item)"
                                    close>
                                <template v-if="item.document">
                                    {{item.document.name}}:
                                    {{item.document.ingredients.map(
                                    ingredient => `${ingredient.name} - ${$n(ingredient.price, 'currency')}`
                                    ).join(' | ')}}
                                </template>
                                <template v-else>
                                    {{$t('components.menu-item-component.assigned-additional-ingredients-group-not-found')}}
                                </template>
                            </v-chip>
                        </template>
                        <template #item="{ item }">
                            <v-list-item-content>
                                {{item.document.name}}:
                                {{item.document.ingredients.map(
                                ingredient => `${ingredient.name} - ${$n(ingredient.price, 'currency')}`
                                ).join(' | ')}}
                            </v-list-item-content>
                        </template>
                    </v-autocomplete>
                </v-col>
            </v-row>
        </template>
    </item-view-and-edit-component>
</template>

<script lang="ts">
    import Vue from "vue";
    import Component from "vue-class-component";
    import {
        getMenuItemPicturesStorageRef,
        IMenuItem,
        MenuItem,
        MenuItemIngredient,
        MenuItemRequiredChoice,
        MenuItemSize
    } from "@/data/MenuItem";
    import {Prop, Ref} from "vue-property-decorator";
    import {ValidationObserver, ValidationProvider} from "vee-validate";
    import ItemViewAndEditComponent from "@/components/ItemViewAndEditComponent.vue";
    import EditableList from "@/components/EditableList.vue";
    import {getAdditionalIngredientsGroupRef, IAdditionalIngredientsGroup} from "@/data/AdditionalIngredientsGroup";
    import {
        DocumentOrRefMatch,
        DocumentRefMatch,
        matchRefsWithDocuments,
        RefDocumentMatch
    } from "@/common/js/firestore-utils";
    import CloudStorageImage from "@/components/CloudStorageImage.vue";
    import EditableCloudStorageImageList from "@/components/EditableCloudStorageImageList.vue";
    import {EditableListImage} from "@/components/EditableCloudStorageImageList";
    import {randomString} from "@/common/js/utils";
    import {storageFileExists} from "@/common/js/storage-utils";
    import CloudStorageImageCarousel from "@/components/CloudStorageImageCarousel.vue";

    @Component({
        components: {
            CloudStorageImageCarousel,
            EditableCloudStorageImageList,
            CloudStorageImage,
            EditableList,
            ItemViewAndEditComponent,
            ValidationProvider,
            ValidationObserver
        }
    })
    // @ts-ignore
    export default class MenuItemComponent extends Vue {

        editedMenuItem: IMenuItem = new MenuItem().copy({});
        editedMenuItemUpdatedPictures: EditableListImage[] = [];

        @Ref() readonly picturesList!: EditableCloudStorageImageList;

        @Prop() readonly menuItem?: IMenuItem;
        @Prop() readonly providerId?: string;
        @Prop() readonly additionalIngredientsGroups?: IAdditionalIngredientsGroup[];
        @Prop({default: () => false}) readonly additionalIngredientsGroupsLoading?: boolean;

        @Prop() readonly onSave?: (editedMenuItem: IMenuItem) => Promise<void>;
        @Prop() readonly onDelete?: (menuItem: IMenuItem) => Promise<void>;

        @Prop() readonly onSaveError?: (error: any) => void;
        @Prop() readonly onDeleteError?: (error: any) => void;
        @Prop() readonly onCancel?: () => Promise<void>;

        @Prop() readonly creation?: boolean;

        get matchedAdditionalIngredientsGroups(): DocumentRefMatch<IAdditionalIngredientsGroup>[] {
            if (!this.additionalIngredientsGroups) return [];
            return this.additionalIngredientsGroups.map(group => ({
                id: group.id,
                document: group,
                ref: this.providerId ? getAdditionalIngredientsGroupRef(this.providerId, group.id) : null
            }));
        }

        get assignedAdditionalIngredientsGroups(): RefDocumentMatch<IAdditionalIngredientsGroup>[] {
            if (!this.menuItem) return [];
            return matchRefsWithDocuments(
                this.menuItem.assignedAdditionalIngredientsGroups,
                this.additionalIngredientsGroups || []
            );
        }

        get additionalIngredientsGroupsSelect(): DocumentOrRefMatch<IAdditionalIngredientsGroup>[] {
            const groups: DocumentOrRefMatch<IAdditionalIngredientsGroup>[] = this.matchedAdditionalIngredientsGroups.map(group => group);
            for (let editedGroup of this.editedAssignedAdditionalIngredientsGroups)
                if (!groups.find(group => group.id === editedGroup.id))
                    groups.push(editedGroup);
            return groups;
        }

        get editedAssignedAdditionalIngredientsGroups(): RefDocumentMatch<IAdditionalIngredientsGroup>[] {
            return matchRefsWithDocuments(
                this.editedMenuItem.assignedAdditionalIngredientsGroups,
                this.additionalIngredientsGroups || []
            );
        }

        set editedAssignedAdditionalIngredientsGroups(groups: RefDocumentMatch<IAdditionalIngredientsGroup>[]) {
            this.editedMenuItem.assignedAdditionalIngredientsGroups = groups.map(group => group.ref);
        }

        async savePictures(menuItemId: string = this.editedMenuItem.id): Promise<string[]> {
            if (!this.providerId) return this.editedMenuItem.pictures;

            const providerImagesFolder = getMenuItemPicturesStorageRef(this.providerId, menuItemId);

            return await this.picturesList.syncToStorage(async (image) => {
                const imageExtension = image.file.name.split(".").pop();

                let imageRef;
                do {
                    const name = `${randomString(8)}.${imageExtension}`;
                    imageRef = providerImagesFolder.child(name);
                } while (await storageFileExists(imageRef));

                return imageRef;
            });
        }

        edit() {
            if (this.menuItem) {
                MenuItem.copy(this.menuItem, this.editedMenuItem);
            }
        }

        closeEdit() {
            new MenuItem().copy(this.editedMenuItem);
            this.editedMenuItemUpdatedPictures = [];
        }

        deleteMenuItem() {
            if (this.menuItem) this.onDelete?.(MenuItem.copy(this.menuItem, {}));
        }

        async save() {
            await this.onSave?.(MenuItem.copy(this.editedMenuItem, {}));
        }

        newIngredient() {
            return new MenuItemIngredient().copy({});
        }

        newSize() {
            return new MenuItemSize().copy({});
        }

        newRequiredChoice() {
            return new MenuItemRequiredChoice().copy({});
        }

        removeAdditionalIngredientsGroup(removedGroup: RefDocumentMatch<IAdditionalIngredientsGroup>) {
            this.editedMenuItem.assignedAdditionalIngredientsGroups = this.editedMenuItem.assignedAdditionalIngredientsGroups.filter(
                groupRef => groupRef.id !== removedGroup.id
            );
        }

        filterAdditionalIngredientsGroupsSelect(group: DocumentOrRefMatch<IAdditionalIngredientsGroup>, query: string) {
            query = query.toLocaleLowerCase();
            return group.document ?
                group.document.name.toLocaleLowerCase().includes(query) ||
                group.document.ingredients.some(ingredient => ingredient.name.toLocaleLowerCase().includes(query))
                : false;
        }

    }
</script>
