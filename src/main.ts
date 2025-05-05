import { createApp } from "vue";
import App from "./App.vue";
import { createPinia } from "pinia";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";
import router from "./store/router";

const app = createApp(App);

const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

if (import.meta.env.DEV) {
  (window as any).__pinia = pinia;
}

app.use(pinia);
app.use(router);

app.mount("#app");
