<template>
    <v-app>
        <navigation/>
        <v-content>
            <v-container>
                <slot/>
            </v-container>
        </v-content>
        <messages ref="messages"/>
    </v-app>
</template>

<script lang="ts">
    import Vue from "vue";
    import Component from "vue-class-component";
    import Navigation from "@/components/Navigation.vue";
    import Messages from "@/components/Messages.vue";
    import {Ref} from "vue-property-decorator";

    @Component({
        components: {Messages, Navigation}
    })
    export default class DefaultLayout extends Vue {

        @Ref() readonly messages!: Messages;

        mounted() {
            this.$provide("messages", this.messages);
        }
    }
</script>
