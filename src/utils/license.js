const LICENSE_CHECK_URL = 'https://lsck.encolajs.com/'
const INITIAL_DELAY = 5 * 60 * 1000 // 5 minutes
const MAX_RETRY_DELAY = 60 * 60 * 1000 // 1 hour
const UNLICENSED_NOTICE_HTML = `
  <div id="encola-license-notice" style="position:fixed;bottom:10px;right:10px;padding:10px 15px;background:#fff;border:1px solid #ccc;border-radius:6px;font-family:sans-serif;font-size:14px;z-index:99999;">
    Forms on this page are generated using <a href="https://encolajs.com/" target="_blank">EncolaJS</a>.
    <button style="margin-left:10px;background:none;border:none;cursor:pointer;font-weight:bold;" onclick="document.getElementById('encola-license-notice')?.remove()">×</button>
  </div>
`

let retryDelay = INITIAL_DELAY
let initiated = false

export function startLicenseCheck(key) {
  if (initiated || typeof window === 'undefined') return
  initiated = true

  const domain = window.location.hostname

  if (isDevDomain(domain)) return

  setTimeout(
    () => checkLicense(domain, key || window.EncolaLicenseKey || null),
    INITIAL_DELAY
  )
}

function isDevDomain(domain) {
  return /^localhost$|^127\.0\.0\.1$|^test\.|^testing\.|^local\.|^staging\./.test(
    domain
  )
}

function checkLicense(domain, key = null) {
  const url = new URL(LICENSE_CHECK_URL)
  url.searchParams.set('domain', domain)
  if (key) url.searchParams.set('key', key)

  fetch(url.toString())
    .then((res) => (res.ok ? res.text() : Promise.reject()))
    .then((text) => {
      const result = parseInt(text.trim(), 10)
      if (result === 1) return // Licensed
      if (result === 0) {
        injectNotice()
        warnUnlicensed()
      }
      scheduleRetry(() => checkLicense(domain, key))
    })
    .catch(() => scheduleRetry(() => checkLicense(domain, key)))
}

function scheduleRetry(fn) {
  retryDelay = Math.min(retryDelay * 2, MAX_RETRY_DELAY)
  setTimeout(fn, retryDelay)
}

function injectNotice() {
  if (!document.body || document.getElementById('encola-license-notice')) return
  document.body.insertAdjacentHTML('beforeend', UNLICENSED_NOTICE_HTML)
}

function warnUnlicensed(domain) {
  console.warn(`
  ╭────────────────────────────────────────────╮
  │                                            │
  │   ---- EncolaJS License Not Detected ----  │
  │                                            │
  │   This domain (${domain}) does not appear  │
  │   to have a commercial license.            │
  │                                            │
  │   Visit https://encolajs.com/              │
  │   to get a license or remove this warning. │
  │                                            │
  ╰────────────────────────────────────────────╯
  `)
}
