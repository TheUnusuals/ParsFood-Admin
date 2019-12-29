import "@mdi/font/css/materialdesignicons.css";
import Vue from "vue";
import Vuetify, {colors} from "vuetify/lib";
import {Framework} from "vuetify/index";
import {i18n} from "@/plugins/i18n";

Vue.use(Vuetify);

export const vuetify = new Vuetify({
    lang: {
        t: (key: string, ...params) => i18n.t(key, params) as string
    },
    theme: {
        dark: false,
        themes: {
            light: {
                primary: colors.green.darken2,
                secondary: colors.lightGreen.darken1,
                accent: colors.cyan.base,
                error: colors.red.base,
                warning: colors.orange.base,
                info: colors.blue.base,
                success: colors.green.base
            },
            dark: {
                primary: colors.green.darken4,
                secondary: colors.lightGreen.darken3,
                accent: colors.cyan.base,
                error: colors.red.base,
                warning: colors.orange.base,
                info: colors.blue.base,
                success: colors.green.base
            },
        }
    }
});

declare module "vue/types/vue" {
    interface Vue {
        $vuetify: Framework
    }
}
