<template>
    <v-card dark>
        <v-carousel show-arrows-on-hover height="100%" :style="{'max-height':maxHeight}">
            <v-carousel-item v-for="(path, index) of images" :key="index">
                <div class="fill-height" style="min-height:200px">
                    <cloud-storage-image :path="path" :max-height="maxHeight" class="fill-height"/>
                </div>
            </v-carousel-item>
        </v-carousel>
    </v-card>
</template>

<script lang="ts">
    import Vue from "vue";
    import Component from "vue-class-component";
    import {Prop} from "vue-property-decorator";
    import CloudStorageImage from "@/components/CloudStorageImage.vue";

    @Component({
        components: {CloudStorageImage}
    })
    export default class CloudStorageImageCarousel extends Vue {

        @Prop({required: true}) readonly images!: string[];
        @Prop({default: () => "100%"}) readonly maxHeight!: string;

    }
</script>
