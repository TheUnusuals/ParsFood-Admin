<template>
    <div>
        <v-navigation-drawer v-model="drawer"
                             color="secondary"
                             class="white--text"
                             clipped dark app>
            <v-list>
                <template v-for="(group, i) of links">
                    <v-divider v-if="i > 0" :key="i"/>
                    <v-subheader v-if="group.title" :key="i">
                        {{group.title}}
                    </v-subheader>
                    <v-list-item-group :key="i">
                        <template v-for="(link, j) of group.links">
                            <v-list-group :to="link.to"
                                          :key="j"
                                          @click="link.click && link.click()"
                                          v-if="link.children && link.children.length"
                                          color="white"
                                          no-action>
                                <template #activator>
                                    <v-list-item-icon v-if="link.icon">
                                        <v-icon>{{link.icon}}</v-icon>
                                    </v-list-item-icon>
                                    <v-list-item-title>
                                        {{link.title}}
                                    </v-list-item-title>
                                </template>
                                <template v-for="(childLink, k) of link.children">
                                    <v-list-group :to="childLink.to"
                                                  :key="k"
                                                  @click="childLink.click && childLink.click()"
                                                  v-if="childLink.children && childLink.children.length"
                                                  color="white"
                                                  sub-group no-action>
                                        <template #activator>
                                            <v-list-item-icon v-if="childLink.icon">
                                                <v-icon>{{childLink.icon}}</v-icon>
                                            </v-list-item-icon>
                                            <v-list-item-title>
                                                {{childLink.title}}
                                            </v-list-item-title>
                                        </template>
                                        <template v-for="(subChildLink, l) of childLink.children">
                                            <v-list-item :to="subChildLink.to"
                                                         :key="l"
                                                         @click="subChildLink.click && subChildLink.click()">
                                                <v-list-item-icon v-if="subChildLink.icon">
                                                    <v-icon>{{subChildLink.icon}}</v-icon>
                                                </v-list-item-icon>
                                                <v-list-item-title>
                                                    {{subChildLink.title}}
                                                </v-list-item-title>
                                            </v-list-item>
                                        </template>
                                    </v-list-group>
                                    <v-list-item :to="childLink.to"
                                                 :key="k"
                                                 @click="childLink.click && childLink.click()"
                                                 v-else>
                                        <v-list-item-icon v-if="childLink.icon">
                                            <v-icon>{{childLink.icon}}</v-icon>
                                        </v-list-item-icon>
                                        <v-list-item-title>
                                            {{childLink.title}}
                                        </v-list-item-title>
                                    </v-list-item>
                                </template>
                            </v-list-group>
                            <v-list-item :to="link.to"
                                         :key="j"
                                         @click="link.click && link.click()"
                                         v-else>
                                <v-list-item-icon v-if="link.icon">
                                    <v-icon>{{link.icon}}</v-icon>
                                </v-list-item-icon>
                                <v-list-item-title>
                                    {{link.title}}
                                </v-list-item-title>
                            </v-list-item>
                        </template>
                    </v-list-item-group>
                </template>
            </v-list>
        </v-navigation-drawer>
        <v-app-bar color="primary" clipped-left dark app>
            <v-app-bar-nav-icon @click="drawer = !drawer" v-if="$vuetify.breakpoint.mdAndDown"/>

            <v-toolbar-title>
                <!-- todo: change with a site logo -->
                <router-link class="white--text" :to="{name: 'home'}">{{$t('app.title')}}</router-link>
            </v-toolbar-title>

            <div class="ml-4 overflow-hidden" style="text-overflow:ellipsis;max-height:100%"
                 v-if="title !== $t('app.title')">
                {{title}}
            </div>

            <v-spacer/>

            <v-btn @click="logout" text>{{$t('components.navigation.logout')}}</v-btn>
        </v-app-bar>
    </div>
</template>

<script lang="ts">
    import Vue from "vue";
    import Component from "vue-class-component";
    import {firebaseAuth} from "@/plugins/firebase";
    import {defaultUnauthorizedPage, router} from "@/plugins/router";
    import {getPageTitle} from "@/js/router-utils";
    import Messages from "@/components/Messages.vue";
    import {NavigationGroup} from "@/components/Navigation";

    @Component
    export default class Navigation extends Vue {

        drawer: boolean = false;

        get links(): NavigationGroup[] {
            return [
                {
                    links: [
                        {title: this.$t("components.navigation.providers") as string, to: {name: "providers"}},
                        {
                            title: this.$t("components.navigation.additional-ingredients-groups") as string,
                            to: {name: "additional-ingredients-groups-default"}
                        },
                        {
                            title: this.$t("components.navigation.menu-items") as string,
                            to: {name: "menu-items-default"}
                        },
                    ]
                }
            ];
        }

        get messages(): Messages {
            return this.$inject("messages");
        }

        get title() {
            return getPageTitle(this.$route);
        }

        mounted() {
            this.drawer = this.$vuetify.breakpoint.mdAndUp;
        }

        async logout() {
            try {
                await firebaseAuth.signOut();
                await router.push(defaultUnauthorizedPage);
            } catch (e) {
                console.error(e);
                await this.messages.showError(this.$t("components.navbar.errors.failed-to-logout") as string);
            }
        }

    }
</script>
