import Vue from "vue";
import {storage} from "firebase/app";

declare module "@/components/EditableCloudStorageImageList.vue" {
    // @ts-ignore
    export default class EditableCloudStorageImageList extends Vue {
        syncToStorage(getStorageRef: (newImage: FormImageWithFile) => Promise<storage.Reference>): Promise<string[]>;
    }
}

export interface StorageImage {
    new: false;
    deleted: boolean;
    path: string;
}

export interface FormImage {
    new: true;
    file?: File;
    uploadTask?: storage.UploadTask;
}

export interface FormImageWithFile extends FormImage {
    file: File;
}

export type EditableListImage = StorageImage | FormImage;
