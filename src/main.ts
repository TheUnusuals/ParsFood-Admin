import "reflect-metadata";

import Vue from "vue"
import App from "@/views/App.vue"
import {router} from "@/plugins/router"
import {store} from "@/store/store"
import {i18n} from "@/plugins/i18n";
import {vuetify} from '@/plugins/vuetify';
import "@/plugins/firebase";
import IdPlugin from "@/common/plugins/vue/IdPlugin";

Vue.config.productionTip = false;

Vue.use(IdPlugin);

new Vue({
    router: router,
    store: store,
    i18n: i18n,
    vuetify: vuetify,
    render: h => h(App)
}).$mount("#app");
