<template>
    <editable-list :title="title"
                   v-model="allImages"
                   :deleted-items.sync="deletedItems"
                   :item-key="(item, index) => item.new ? item.file && getFileUrl(item.file) || index : item.path"
                   :add="() => ({new: true})"
                   :mark-deleted-filter="image => !image.new"
                   mark-deleted
                   content-min-width="initial"
                   can-order
                   v-bind="$attrs">
        <template #default="{ item, index }">
            <template v-if="item.new">
                <cloud-storage-image :value="getFileUrl(item.file)"
                                     v-if="item.file"
                                     class="mb-4"
                                     max-height="300"/>
                <validation-provider
                        :vid="index.toString()"
                        :name="inputLabel || $t('components.editable-cloud-storage-image-list.select-image')"
                        rules="required|image"
                        :custom-messages="{'image': imageValidationMessage || $t('components.editable-cloud-storage-image-list.validation.image')}"
                        v-slot="{ errors }"
                        slim>
                    <v-file-input v-model="item.file"
                                  :label="inputLabel || $t('components.editable-cloud-storage-image-list.select-image')"
                                  :error-messages="errors"
                                  accept="image/*"
                                  dense/>
                </validation-provider>
            </template>
            <cloud-storage-image :path="item.path" max-height="300" v-else/>
        </template>
    </editable-list>
</template>

<script lang="ts">
    import Vue from "vue";
    import Component from "vue-class-component";
    import EditableList from "@/components/EditableList.vue";
    import {Model, Prop, Watch} from "vue-property-decorator";
    import CloudStorageImage from "@/components/CloudStorageImage.vue";
    import {ValidationProvider} from "vee-validate";
    import isEqual from "lodash/isEqual";
    import {EditableListImage, FormImageWithFile, StorageImage} from "@/components/EditableCloudStorageImageList";
    import {storage} from "firebase/app";
    import {firebaseStorage} from "@/plugins/firebase";
    import {deleteStorageFile} from "@/common/js/storage-utils";

    const modelEvent = "change";

    @Component({
        components: {CloudStorageImage, EditableList, ValidationProvider}
    })
    // @ts-ignore
    export default class EditableCloudStorageImageList extends Vue {

        fileUrlsCache: Map<File, string> = new Map();

        allImages: EditableListImage[] = [];

        deletedItems: EditableListImage[] = [];

        @Model(modelEvent, {default: () => []}) readonly value!: EditableListImage[];

        @Prop({required: true}) readonly images!: string[];

        @Prop() readonly title?: string;
        @Prop() readonly inputLabel?: string;
        @Prop() readonly imageValidationMessage?: string;

        @Watch("value", {deep: true, immediate: true})
        onValue(value: EditableListImage[]) {
            if (!isEqual(this.allImages, value)) this.allImages = value.map(image => ({...image}));
        }

        @Watch("images", {immediate: true})
        onImages(images: string[], oldImages: string[]) {
            if (isEqual(images, oldImages)) return;

            const newImages: StorageImage[] = images
                .filter(path => !this.allImages.find(image => !image.new && image.path === path))
                .map(path => ({new: false, deleted: false, path}));
            const deletedImages: number[] = this.allImages
                .map((image, index) => ({image, index}))
                .filter(({image}) => !image.new && !images.find(path => path === image.path))
                .map(({index}) => index);

            this.allImages = [
                ...newImages,
                ...this.allImages.filter((image, index) => !deletedImages.includes(index))
            ];
        }

        @Watch("allImages", {deep: true})
        onAllImages(allImages: EditableListImage[]) {
            if (!isEqual(allImages, this.value)) {
                this.$emit(modelEvent, allImages.map(image => ({...image})));

                const updatedImages = (this.allImages.filter(image => !image.new) as StorageImage[]).map(image => image.path);

                if (!isEqual(updatedImages, this.images)) {
                    this.$emit("update:images", updatedImages);
                }
            }
        }

        @Watch("deletedItems", {deep: true})
        onDeletedItems(newDeletedItems: EditableListImage[], oldDeletedItems: EditableListImage[]) {
            if (!isEqual(newDeletedItems, oldDeletedItems)) {
                this.allImages = this.allImages.map(image => image.new ? image : {
                    ...image, deleted: newDeletedItems.includes(image)
                });
            }
        }

        destroyed() {
            for (let [file, url] of this.fileUrlsCache) {
                URL.revokeObjectURL(url);
            }
        }

        async syncToStorage(getStorageRef: (image: FormImageWithFile) => Promise<storage.Reference>): Promise<string[]> {
            const newImages = this.allImages
                .map((image, index) => ({image: image as FormImageWithFile, index}))
                .filter(({image}) => image.new && image.file);
            const deletedImages = this.allImages
                .map((image, index) => ({image: image as StorageImage, index}))
                .filter(({image}) => !image.new && image.deleted);

            for (let newImage of newImages) {
                const ref = await getStorageRef(newImage.image);
                this.$set(newImage.image, "uploadTask", ref.put(newImage.image.file));
                await newImage.image.uploadTask;
                this.$set(this.allImages, newImage.index, {
                    new: false,
                    deleted: false,
                    path: ref.fullPath
                });
            }

            for (let deletedImage of deletedImages.sort((a, b) => b.index - a.index)) {
                await deleteStorageFile(deletedImage.image.path);
                this.allImages.splice(deletedImage.index, 1);
            }

            return (this.allImages.filter(image => !image.new) as StorageImage[]).map(image => image.path);
        }

        getFileUrl(file: File) {
            if (this.fileUrlsCache.has(file)) return this.fileUrlsCache.get(file);
            const url = URL.createObjectURL(file);
            this.fileUrlsCache.set(file, url);
            return url;
        }

    }
</script>
