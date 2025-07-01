import { createApp } from 'vue'
import App from './App.vue'

// PrimeVue imports
import PrimeVue from 'primevue/config'
import Aura from '@primeuix/themes/aura'
import ConfirmationService from 'primevue/confirmationservice'
import ToastService from 'primevue/toastservice'

// PrimeVue components
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Textarea from 'primevue/textarea'
import Select from 'primevue/select'
import Checkbox from 'primevue/checkbox'
import Card from 'primevue/card'
import Toolbar from 'primevue/toolbar'
import Accordion from 'primevue/accordion'
import AccordionTab from 'primevue/accordiontab'
import Message from 'primevue/message'
import Toast from 'primevue/toast'
import ConfirmDialog from 'primevue/confirmdialog'

// Enforma imports
import usePrimeVuePreset from '@/presets/primevue'
import { EnformaPlugin, setGlobalConfig } from '@'

// PrimeIcons CSS
import 'primeicons/primeicons.css'

// Tailwind CSS
import './style.css'

const app = createApp(App)

// Configure PrimeVue
app.use(PrimeVue, {
  theme: {
    preset: Aura,
    options: {
      prefix: 'p',
      darkModeSelector: '.dark',
      cssLayer: false
    }
  }
})

// PrimeVue services
app.use(ConfirmationService)
app.use(ToastService)

// Configure Enforma
app.use(EnformaPlugin)
usePrimeVuePreset({
  input: InputText,
  text: InputText,
  textarea: Textarea,
  select: Select,
  checkbox: Checkbox,
  number: InputNumber,
  email: InputText,
  password: InputText,
  date: InputText,
  button: Button
})

// Register PrimeVue components globally
app.component('Button', Button)
app.component('InputText', InputText)
app.component('InputNumber', InputNumber)
app.component('Textarea', Textarea)
app.component('Select', Select)
app.component('Checkbox', Checkbox)
app.component('Card', Card)
app.component('Toolbar', Toolbar)
app.component('Accordion', Accordion)
app.component('AccordionTab', AccordionTab)
app.component('Message', Message)
app.component('Toast', Toast)
app.component('ConfirmDialog', ConfirmDialog)

app.mount('#app')