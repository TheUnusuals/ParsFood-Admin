import Vue from "vue";
import VueI18n from "vue-i18n";
import lt from "@/locales/lt.json";
import en from "@/locales/en.json";

Vue.use(VueI18n);

export const i18n = new VueI18n({
    locale: "lt",
    fallbackLocale: "en",
    messages: {
        "lt": lt,
        "en": en
    }
});
