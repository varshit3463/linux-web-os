import App from './routes/+page.svelte'
import './styles/global.css'

const app = new App({
  target: document.getElementById('app')
})

export default app
