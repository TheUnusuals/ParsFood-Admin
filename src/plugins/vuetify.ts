import "@mdi/font/css/materialdesignicons.css";
import "typeface-roboto";
import Vue from "vue";
import Vuetify, {colors} from "vuetify/lib";
import {Framework} from "vuetify/index";

Vue.use(Vuetify);

export const vuetify = new Vuetify({
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
