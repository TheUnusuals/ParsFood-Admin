import "reflect-metadata";

import Vue from "vue"
import App from "@/App.vue"
import router from "@/router"
import {store} from "@/store/store"
import {i18n} from "@/i18n";
import "@/firebase";
import IdPlugin from "@/common/plugins/vue/IdPlugin";

Vue.config.productionTip = false;

Vue.use(IdPlugin);

new Vue({
    router: router,
    store: store,
    i18n: i18n,
    render: h => h(App)
}).$mount("#app");
