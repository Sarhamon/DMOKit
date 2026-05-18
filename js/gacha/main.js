import { loadTheme, toggleTheme } from '../theme.js';

document.querySelector('.theme-toggle').addEventListener('click', toggleTheme);
loadTheme();
