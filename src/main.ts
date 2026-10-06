import '@fontsource/anton/latin-400.css';
import './styles/tokens.css';
import './styles/base.css';
import './styles/layout.css';
import { startApp } from './app';
import { listDrinks } from './data/catalog';

const main = document.getElementById('contenido');
if (main) {
  if (listDrinks().some((d) => d.demo)) {
    document.getElementById('aviso-demo')?.removeAttribute('hidden');
  }
  startApp(main);
}
