<template>
    <v-container style="max-width: 400px; margin-top: 60px">
        <v-card :loading="loading">
            <v-card-title>{{$t("views.login.title")}}</v-card-title>

            <v-card-text v-if="error.show" class="pb-0">
                <v-alert type="error" class="mb-0">{{error.message}}</v-alert>
            </v-card-text>

            <v-card-text>
                <validation-observer v-slot="{ handleSubmit }" slim>
                    <v-form @submit.prevent="handleSubmit(submit)">
                        <validation-provider :name="$t('views.login.username')"
                                             rules="required"
                                             v-slot="{ errors }"
                                             slim>
                            <v-text-field v-model="username"
                                          :label="$t('views.login.username')"
                                          :error-messages="errors"
                                          required/>
                        </validation-provider>

                        <validation-provider :name="$t('views.login.password')"
                                             rules="required"
                                             v-slot="{ errors }"
                                             slim>
                            <v-text-field v-model="password"
                                          :label="$t('views.login.password')"
                                          type="password"
                                          :error-messages="errors"
                                          required/>
                        </validation-provider>

                        <v-btn color="primary" type="submit" class="mt-2">
                            {{$t('views.login.login')}}
                        </v-btn>
                    </v-form>
                </validation-observer>
            </v-card-text>
        </v-card>
    </v-container>
</template>

<script lang="ts">
    import Vue from "vue";
    import Component from "vue-class-component";
    import {ValidationObserver, ValidationProvider} from "vee-validate";
    import authFunctions from "@/plugins/firebase-functions/auth-functions";
    import {firebaseAuth} from "@/plugins/firebase";
    import {defaultPage} from "@/plugins/router";
    import {Prop} from "vue-property-decorator";
    import {RawLocation} from "vue-router";
    import {isLoggedIn} from "@/js/utils/auth-utils";
    import {safeRedirect} from "@/js/utils/router-utils";
    import {isHttpsError} from "@/common/js/firebase-utils";

    @Component({
        components: {
            ValidationProvider,
            ValidationObserver
        }
    })
    export default class LoginView extends Vue {

        @Prop({default: () => defaultPage, type: [String, Object]})
        readonly redirectTo!: RawLocation;

        username: string = "";
        password: string = "";

        loading: boolean = false;

        error = {
            message: "",
            show: false
        };

        mounted() {
            const unsubscribe = firebaseAuth.onAuthStateChanged(async () => {
                if (isLoggedIn()) {
                    unsubscribe();
                    await safeRedirect(this.redirectTo);
                }
            });
        }

        async submit() {
            this.loading = true;
            this.error.show = false;

            try {
                let token = await authFunctions.login(this.username, this.password);

                await firebaseAuth.signInWithCustomToken(token);
            } catch (error) {
                if (isHttpsError(error) && error.details === "invalid-credentials") {
                    this.showError(this.$t("views.login.errors.invalid-credentials") as string);
                } else {
                    this.showError(this.$t("views.login.errors.could-not-login") as string);
                }
            }

            this.loading = false;
        }

        showError(error: string) {
            this.error.message = error;
            this.error.show = true;
        }

    }
</script>
