import { createApp } from "vue";
import App from "./App.vue";
import { createPinia } from "pinia";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";
import router from "./store/router";

const app = createApp(App);

// 建立 Pinia 實例
const pinia = createPinia();
// 插入持久化插件
pinia.use(piniaPluginPersistedstate);

// 開發模式下讓你可以在 console 用 window.__pinia 查看
if (import.meta.env.DEV) {
  (window as any).__pinia = pinia;
}

// 安裝插件
app.use(pinia);
app.use(router);

// 掛載 app
app.mount("#app");
