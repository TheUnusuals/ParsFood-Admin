<template>
    <v-container>
        <v-container>
            <v-card :loading="loading" :disabled="disabled">
                <v-card-title>{{$t('views.provider-info.title')}}</v-card-title>
                <v-card-text v-if="!editing">
                    <div class="d-flex justify-space-between">
                        <div>
                            <div>
                                <strong>{{$t('views.provider-info.name')}}:</strong> {{provider.name}}
                            </div>
                            <div>
                                <strong>{{$t('views.provider-info.website-url')}}:</strong> {{provider.websiteUrl}}
                            </div>
                            <div>
                                <strong>{{$t('views.provider-info.phone-number')}}:</strong> {{provider.phoneNumber}}
                            </div>
                            <div>
                                <strong>{{$t('views.provider-info.email')}}:</strong> {{provider.email}}
                            </div>
                        </div>
                        <img :src="provider.logo" :alt="provider.name" style="height: 100px; width: auto">
                    </div>
                    <v-btn class="ma-2" @click="openEdit()" outlined color="primary">
                        {{$t('views.provider-info.edit')}}
                    </v-btn>
                </v-card-text>
                <v-card-text v-if="editing">
                    <validation-observer v-slot="{handleSubmit}">
                        <v-form @submit.prevent="handleSubmit(submit)">
                            <v-row>
                                <v-col cols="12" sm="6" md="6">
                                    <validation-provider :name="$t('views.provider-info.name')"
                                                         rules="required"
                                                         v-slot="{ errors }"
                                                         slim>
                                        <v-text-field v-model="editedProvider.name"
                                                      :label="$t('views.provider-info.name')"
                                                      outlined
                                                      :error-messages="errors"
                                                      required/>
                                    </validation-provider>
                                </v-col>
                                <v-col cols="12" sm="6" md="6">
                                    <validation-provider :name="$t('views.provider-info.website-url')"
                                                         rules="required"
                                                         v-slot="{ errors }"
                                                         slim>
                                        <v-text-field v-model="editedProvider.websiteUrl"
                                                      :label="$t('views.provider-info.website-url')"
                                                      outlined
                                                      :error-messages="errors"
                                                      required/>
                                    </validation-provider>
                                </v-col>
                                <v-col cols="12" sm="6" md="3">
                                    <validation-provider :name="$t('views.provider-info.phone-number')"
                                                         rules="required"
                                                         v-slot="{ errors }"
                                                         slim>
                                        <v-text-field v-model="editedProvider.phoneNumber"
                                                      :label="$t('views.provider-info.phone-number')"
                                                      outlined
                                                      :error-messages="errors"
                                                      required/>
                                    </validation-provider>
                                </v-col>
                                <v-col cols="12" sm="6" md="6">
                                    <validation-provider :name="$t('views.provider-info.email')"
                                                         rules="required|email"
                                                         v-slot="{ errors }"
                                                         slim>
                                        <v-text-field v-model="editedProvider.email"
                                                      :label="$t('views.provider-info.email')"
                                                      outlined
                                                      :error-messages="errors"
                                                      required/>
                                    </validation-provider>
                                </v-col>
                                <v-col cols="12" sm="6" md="3">
                                    <!-- todo: add an upload button -->
                                    <validation-provider :name="$t('views.provider-info.logo')"
                                                         v-slot="{ errors }"
                                                         slim>
                                        <v-text-field v-model="editedProvider.logo"
                                                      :label="$t('views.provider-info.logo')"
                                                      outlined
                                                      :error-messages="errors"
                                        />
                                    </validation-provider>
                                </v-col>
                            </v-row>
                            <v-btn class="ma-2" type="submit" outlined color="primary">
                                {{$t('views.provider-info.save')}}
                            </v-btn>
                            <v-btn class="ma-2" @click="editing=false" outlined color="error">
                                {{$t('views.provider-info.cancel')}}
                            </v-btn>
                        </v-form>
                    </validation-observer>
                </v-card-text>
            </v-card>
        </v-container>
    </v-container>

</template>

<script lang="ts">
    import Vue from "vue";
    import Component from "vue-class-component";
    import {ValidationObserver, ValidationProvider} from "vee-validate";
    import {getDocument, setDocument} from "@/common/js/firestore-utils";
    import {IProvider, Provider} from "@/data/Provider";
    import {Prop} from "vue-property-decorator";
    import Messages from "@/components/Messages.vue";

    @Component({
        components: {
            ValidationProvider,
            ValidationObserver
        }
    })
    export default class ProviderInfoView extends Vue {
        @Prop({required: true})
        readonly providerId!: string;

        loading: boolean = false;
        disabled: boolean = false;
        editing: boolean = false;

        provider: IProvider = new Provider().copy({});

        editedProvider: IProvider = new Provider().copy({});

        get messages(): Messages {
            return this.$inject("messages");
        }

        async mounted() {
            this.loading = true;
            this.disabled = true;
            try {
                this.provider = await getDocument<IProvider>(this.providerId, {collectionPath: "/providers"});
                this.disabled = false;
            } catch (error) {
                await this.messages.showError(this.$t("views.provider-info.messages.could-not-get-provider-data") as string);
            }
            this.loading = false;
        }

        openEdit() {
            this.editing = true;
            Provider.copy(this.provider, this.editedProvider);
        }

        async submit() {
            this.loading = true;
            this.disabled = true;
            try {
                await setDocument(this.editedProvider, {collectionPath: "/providers"});
                Provider.copy(this.editedProvider, this.provider);
                await this.messages.showSuccess(this.$t("views.provider-info.messages.save-success") as string);
                this.editing = false;
            } catch (error) {
                await this.messages.showError(this.$t("views.provider-info.messages.could-not-save-provider-data") as string);
            }
            this.loading = false;
            this.disabled = false;
        }
    }
</script>
