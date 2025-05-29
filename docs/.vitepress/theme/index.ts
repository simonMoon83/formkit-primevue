import type { Theme } from 'vitepress'
import type { App } from 'vue'
import DefaultTheme from 'vitepress/theme'
import DisplayComponents from './components/DisplayComponents.vue'
import DisplayFormComponents from './components/DisplayFormComponents.vue'
import DisplayOutputComponents from './components/DisplayOutputComponents.vue'
import Todo from './components/Todo.vue'
import 'uno.css'

// PrimeVue imports
import PrimeVue from 'primevue/config'
import Aura from '@primeuix/themes/aura' // Assuming this theme is used, adjust if different
import Ripple from 'primevue/ripple'
import Tooltip from 'primevue/tooltip'
import ToastService from 'primevue/toastservice'
import ConfirmationService from 'primevue/confirmationservice'
import 'primeicons/primeicons.css'
// Import for registerInputs - adjust path relative to this file
import { usePrimeInputs } from '../../../src/composables/usePrimeInputs' 

// FormKit imports
import { plugin as formKitPlugin, defaultConfig as formKitDefaultConfig } from '@formkit/vue'
import { createAutoAnimatePlugin } from '@formkit/addons'
import { de, en } from '@formkit/i18n' // Assuming these are sufficient for the demo
// Import for primeInputs, primeOutputs, addPrimeAsteriskPlugin - adjust paths
import { primeInputs, primeOutputs } from '../../../src/definitions'
import { addPrimeAsteriskPlugin } from '../../../src/plugins'

// Main library SCSS
import '../../../src/sass/formkit-primevue.scss'

// AG-Grid styles are imported directly in GridFormDemo4.vue, so not needed globally here.

export default {
  ...DefaultTheme,
  enhanceApp({ app }: { app: App }) {
    // Original component registrations
    app.component('Todo', Todo)
    app.component('DisplayComponents', DisplayComponents)
    app.component('DisplayOutputComponents', DisplayOutputComponents)
    app.component('DisplayFormComponents', DisplayFormComponents)

    // PrimeVue setup
    app.use(PrimeVue, {
      theme: {
        preset: Aura, // Make sure this is the desired theme
        options: {
          darkModeSelector: '.p-dark', // Or '.dark' if that's what VitePress uses
        },
      },
      ripple: false, // Consistent with dev setup
    })
    app.directive('ripple', Ripple)
    app.directive('tooltip', Tooltip)
    app.use(ToastService)
    app.use(ConfirmationService)

    // Call registerInputs to make PrimeVue FormKit components available
    // This was seen in dev/modules/primevue.ts
    const { registerInputs } = usePrimeInputs()
    registerInputs(app)
    
    // FormKit setup
    app.use(formKitPlugin, formKitDefaultConfig({
      locales: { de, en }, // Add more if needed
      locale: 'en', // Default locale
      inputs: { ...primeInputs, ...primeOutputs },
      plugins: [
        createAutoAnimatePlugin(
          { duration: 250, easing: 'ease-in-out' },
          { global: ['outer', 'inner'], form: ['form'], repeater: ['items'] }
        ),
        addPrimeAsteriskPlugin,
      ],
    }))
  },
} satisfies Theme
