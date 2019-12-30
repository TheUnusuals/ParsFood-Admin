<template>
    <v-card>
        <v-card-title>
            {{$t('views.providers.title')}}
            <v-spacer/>
            <v-btn :to="{name: 'create-provider'}" color="primary">{{$t('views.providers.create')}}</v-btn>
        </v-card-title>

        <v-data-table :items="providers"
                      :headers="headers"
                      :loading="providersModule.syncing"
                      :search="filter"
                      sort-by="name"
                      must-sort>
            <template #top>
                <div class="mx-4 mb-2">
                    <v-text-field v-model="filter"
                                  :placeholder="$t('views.providers.list.filter')"
                                  clearable
                                  dense
                                  hide-details/>
                </div>
            </template>
            <template #item.actions="{ item }">
                <v-btn :to="{name: 'provider-info', params: { providerId: item.id }}" color="primary" outlined small>
                    {{$t('views.providers.list.view')}}
                </v-btn>
            </template>
        </v-data-table>
    </v-card>
</template>

<script lang="ts">
    import Vue from "vue";
    import Component from "vue-class-component";
    import {i18n} from "@/plugins/i18n";
    import {TableHeader} from "@/plugins/vuetify";
    import {providersModule} from "@/store/store";

    @Component
    export default class ProvidersView extends Vue {

        headers: TableHeader[] = [
            {value: "name", text: i18n.t("views.providers.list.name") as string},
            {value: "email", text: i18n.t("views.providers.list.email") as string},
            {value: "phoneNumber", text: i18n.t("views.providers.list.phone-number") as string},
            {value: "websiteUrl", text: i18n.t("views.providers.list.website-url") as string},
            {value: "actions", text: i18n.t("views.providers.list.actions") as string, sortable: false},
        ];

        filter: string = "";

        stopProviderSync!: () => void;

        get providers() {
            return providersModule.providers;
        }

        get providersModule() {
            return providersModule;
        }

        mounted() {
            this.stopProviderSync = providersModule.syncProviders();
        }

        destroyed() {
            this.stopProviderSync();
        }

    }
</script>
