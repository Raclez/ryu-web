import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import './assets/styles/main.scss';
import './assets/styles/fonts.css'
import Live2DWidget from './components/Live2DWidget.vue';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);
app.component('Live2DWidget', Live2DWidget);

app.mount('#app');