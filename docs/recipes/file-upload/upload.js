/**
 * Uploads the file, and gives the id the server stores it under.
 *
 * The demo has no server: it answers after 2 seconds, and refuses files over 1 MB. Yours
 * sends the file, and passes the signal on, so a dropped upload stops:
 *
 *   export async function upload(file, signal) {
 *     const body = new FormData()
 *     body.append('file', file)
 *     const response = await fetch('/api/uploads', { method: 'POST', body, signal })
 *     if (!response.ok) throw new Error(`${file.name} wasn't uploaded`)
 *     return response.json()
 *   }
 */
export function upload(file, signal) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      if (file.size > 1024 * 1024) {
        reject(new Error(`${file.name} is over 1 MB`))
      } else {
        resolve({ id: `upload-${Math.random().toString(36).slice(2, 8)}` })
      }
    }, 2000)
    signal.addEventListener('abort', () => {
      clearTimeout(timer)
      reject(signal.reason)
    })
  })
}
