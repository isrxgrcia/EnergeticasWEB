import '@fontsource/anton/latin-400.css';
import './styles/tokens.css';
import './styles/base.css';
import './styles/layout.css';
import { startApp } from './app';
import { listDrinks } from './data/catalog';

const main = document.getElementById('contenido');
if (main) {
  if (listDrinks().some((d) => d.provisional)) {
    document.getElementById('aviso-provisional')?.removeAttribute('hidden');
  }
  startApp(main);
}
