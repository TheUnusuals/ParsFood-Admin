<template>
    <component :is="layout">
        <router-view/>
    </component>
</template>

<script lang="ts">
    import Vue from "vue";
    import Component from "vue-class-component";

    @Component
    export default class App extends Vue {

        defaultLayout: string = "default";

        get layout(): string {
            return (this.$route.meta.layout || this.defaultLayout) + "-layout";
        }

    }
</script>