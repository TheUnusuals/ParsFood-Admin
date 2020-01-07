import "reflect-metadata";

import Vue from "vue";
import App from "@/views/App.vue";
import {router} from "@/plugins/router";
import {store} from "@/store/store";
import {i18n} from "@/plugins/i18n";
import {vuetify} from '@/plugins/vuetify';
import IdPlugin from "@/common/plugins/vue/IdPlugin";
import DependencyPlugin from "@/common/plugins/vue/DependencyPlugin";
import "@/plugins/firebase";
import "@/plugins/validation";
import "@/layouts/index";

Vue.config.productionTip = false;

Vue.use(IdPlugin);
Vue.use(DependencyPlugin);

new Vue({
    router: router,
    store: store,
    i18n: i18n,
    vuetify: vuetify,
    render: h => h(App)
}).$mount("#app");
