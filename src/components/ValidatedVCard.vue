<template>
    <div>
        <v-card :style="style" v-bind="$attrs" v-on="$listeners" :outlined="outlined">
            <template v-for="(_, slot) in $scopedSlots" v-slot:[slot]>
                <slot :name="slot"/>
            </template>
        </v-card>
        <v-messages class="pa-2" color="error" :value="errorMessages"/>
    </div>
</template>

<script lang="ts">
    import Vue from "vue";
    import Component from "vue-class-component";
    import {Model, Prop} from "vue-property-decorator";

    @Component({inheritAttrs: false})
    export default class ValidatedVCard extends Vue {

        @Model() readonly value?: any;
        @Prop() readonly errorMessages?: string[];

        @Prop() readonly outlined?: boolean;

        get valid(): boolean {
            return !this.errorMessages || this.errorMessages.length === 0;
        }

        get style() {
            return !this.valid ? {
                "border": !this.outlined ? "1px solid" : undefined,
                "border-color": this.$vuetify.theme.currentTheme.error,
            } : {};
        }

    }
</script>
