<template>
    <div class="d-flex align-center justify-center pa-2" v-bind="$attrs" v-if="error">
        <v-alert type="error" class="ma-0" border="left" outlined>
            {{error}}
        </v-alert>
    </div>
    <div class="d-flex align-center justify-center" style="max-width:100%" v-else-if="src || lazySrc">
        <v-img :src="src"
               :lazy-src="lazySrc || value"
               :contain="contain"
               v-bind="$attrs"
               v-on="$listeners">
            <template #placeholder>
                <div class="d-flex fill-height align-center justify-center pa-2">
                    <v-progress-linear :value="uploadProgress" v-if="uploadTask" color="primary" rounded/>
                    <v-progress-linear color="primary" v-else indeterminate rounded/>
                </div>
            </template>
        </v-img>
    </div>
    <div class="d-flex align-center justify-center pa-2" v-bind="$attrs" v-else>
        <v-progress-linear :value="uploadProgress" v-if="uploadTask" color="primary" rounded/>
        <v-progress-linear color="primary" v-else indeterminate rounded/>
    </div>
</template>

<script lang="ts">
    import Vue from "vue";
    import Component from "vue-class-component";
    import {Prop, Watch} from "vue-property-decorator";
    import {storage} from "firebase/app";
    import {firebaseStorage} from "@/plugins/firebase";

    @Component
    export default class CloudStorageImage extends Vue {

        src: string | null = null;
        error: string | null = null;

        @Prop({default: () => null, type: [String, Object]}) readonly value!: string | null;

        imageRef: storage.Reference | null = null;
        uploadProgress: number = 0;

        @Prop() readonly uploadTask?: storage.UploadTask;
        @Prop() readonly path?: string;

        @Prop() readonly onError?: (error: any) => string | void;
        @Prop() readonly errorText?: string;

        @Prop({default: () => true}) readonly contain!: boolean;
        @Prop() readonly lazySrc?: string;

        stopUploadTaskWatch?: () => void;

        beforeMount() {
            this.setImageRef();
        }

        @Watch("uploadTask")
        onUploadTask(newUploadTask: storage.UploadTask, oldUploadTask: storage.UploadTask) {
            this.setImageRef();

            if (!newUploadTask || newUploadTask !== oldUploadTask) {
                this.stopUploadTask();
            }
        }

        @Watch("path")
        onPath() {
            this.setImageRef();
        }

        @Watch("imageRef")
        async onImageRef() {
            if (this.imageRef) {
                if (this.uploadTask) {
                    if (this.uploadTask.snapshot.state === storage.TaskState.SUCCESS) {
                        this.onUploadTaskSnapshot(this.uploadTask.snapshot);
                    } else if ([storage.TaskState.RUNNING, storage.TaskState.PAUSED].includes(this.uploadTask.snapshot.state)) {
                        this.stopUploadTask();
                        this.stopUploadTaskWatch = this.uploadTask.on(
                            storage.TaskEvent.STATE_CHANGED,
                            (snapshot: storage.UploadTaskSnapshot) => {
                                this.onUploadTaskSnapshot(snapshot)
                            }
                        ) as () => void;
                    }
                } else {
                    this.tryToSetSrc();
                }
            } else {
                this.setSrc(this.value);
            }
        }

        async onUploadTaskSnapshot(snapshot: storage.UploadTaskSnapshot) {
            if (snapshot.state === storage.TaskState.SUCCESS) {
                this.stopUploadTask();
                await this.tryToSetSrc();
            } else if ([storage.TaskState.RUNNING, storage.TaskState.PAUSED].includes(snapshot.state)) {
                this.uploadProgress = 100 * snapshot.bytesTransferred / snapshot.totalBytes;
            } else if ([storage.TaskState.ERROR, storage.TaskState.CANCELED].includes(snapshot.state)) {
                this.stopUploadTask();
                this.setSrc(this.value);
            }
        }

        async tryToSetSrc() {
            if (this.imageRef) {
                try {
                    this.setSrc(await this.imageRef.getDownloadURL());
                } catch (error) {
                    this.error = this.onError?.(error) || this.errorText
                        || this.$t("components.cloud-storage-image.error") as string;
                }
            }
        }

        setImageRef() {
            this.error = null;
            if (this.uploadTask) this.imageRef = this.uploadTask.snapshot.ref;
            else if (this.path) this.imageRef = firebaseStorage.ref(this.path);
            else this.setSrc(this.value);
        }

        setSrc(src: string | null) {
            this.error = null;
            this.src = src;
        }

        stopUploadTask() {
            this.stopUploadTaskWatch?.();
            this.stopUploadTaskWatch = undefined;
            this.uploadProgress = 0;
        }

    }
</script>
