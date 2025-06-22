import { createApp } from 'vue';
import App from './App.vue';
import PrimeVue from 'primevue/config';
import Aura from '@primeuix/themes/aura';
import 'primeicons/primeicons.css';
import usePrimeVuePreset from '@encolajs/enforma/presets/primevue';
import { Button, InputText, Select, ToggleSwitch } from 'primevue';
import { EnformaPlugin } from '@encolajs/enforma';
const app = createApp(App);
app.use(PrimeVue, {
    theme: {
        preset: Aura,
    },
});
// configure Enforma
app.use(EnformaPlugin);
usePrimeVuePreset({
    input: InputText,
    text: InputText,
    select: Select,
    toggle: ToggleSwitch,
    button: Button,
});
app.mount('#app');
//# sourceMappingURL=main.js.map