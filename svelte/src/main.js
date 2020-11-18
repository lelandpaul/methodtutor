import MethodCards from './MethodCards.svelte';
import Login from './Login.svelte';

var main = document.querySelector('#svelte-app')

if (main) {

    const cards = new MethodCards({
        target: main,
    });

}

var login = document.querySelector('#login-app')

if (login) {
    const cards = new Login({
        target: login,
    });
}

