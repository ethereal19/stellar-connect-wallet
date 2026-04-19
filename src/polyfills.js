import { Buffer } from 'buffer';
import process from 'process';

window.Buffer = window.Buffer || Buffer;
window.process = window.process || process;
window.global = window;

if (!window.process.browser) {
    window.process.browser = true;
}

console.log("Polyfills loaded: Buffer and process are now global.");
