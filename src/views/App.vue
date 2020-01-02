<template>
    <component :is="layout">
        <router-view/>
    </component>
</template>

<script lang="ts">
    import Vue from "vue";
    import Component from "vue-class-component";
    import {authModule, routerModule} from "@/store/store";

    @Component
    export default class App extends Vue {

        defaultLayout: string = "default";

        get forceLayout(): string | null {
            return authModule.authInitialized && routerModule.routerInitialized ? null : "empty";
        }

        get layout(): string {
            return (this.forceLayout || this.$route.meta.layout || this.defaultLayout) + "-layout";
        }

    }
</script>
