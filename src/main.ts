import "reflect-metadata";

import Vue from "vue"
import App from "@/App.vue"
import router from "@/router"
import {store} from "@/store/store"
import "@/firebase";
import IdPlugin from "@/common/plugins/vue/IdPlugin";

Vue.config.productionTip = false;

Vue.use(IdPlugin);

new Vue({
    router: router,
    store: store,
    render: h => h(App)
}).$mount("#app");
