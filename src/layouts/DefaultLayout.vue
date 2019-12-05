<template>
    <v-app>
        <v-content>
            <v-container>
                <!-- TODO: replace the logout button with a real one -->
                <v-btn @click="logout">Logout</v-btn>
                <slot/>
            </v-container>
        </v-content>
    </v-app>
</template>

<script lang="ts">
    import Vue from "vue";
    import Component from "vue-class-component";
    import {firebaseAuth} from "@/plugins/firebase";
    import {defaultUnauthorizedPage, router} from "@/plugins/router";

    @Component
    export default class DefaultLayout extends Vue {

        // TODO: replace the logout button with the real one
        async logout() {
            await firebaseAuth.signOut();
            await router.push(defaultUnauthorizedPage);
        }

    }
</script>