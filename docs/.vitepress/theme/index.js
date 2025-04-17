import DefaultTheme from 'vitepress/theme'

/** @type {import('vitepress').Theme} */
export default {
  ...DefaultTheme,
  enhanceApp(app) {
    const script = document.createElement('script')
    script.src = 'https://cdn.tailwindcss.com/' // or script.textContent = 'console.log("inline script")';
    script.type = 'text/javascript'
    script.defer = true // optional: defer execution
    document.head.appendChild(script) // or document.body.appendChild(script)
  }
}