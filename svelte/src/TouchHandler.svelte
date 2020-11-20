<script>

import { createEventDispatcher } from 'svelte';
import { card_complete } from './stores.js';

let dispatch = createEventDispatcher()
export let width;

function handleTouch(e){
  if (e.layerY < 200) { return }
  if (e.touches.length > 1) { return }
  if ($card_complete) { dispatch('done') }
  if (e.layerX < (width/3) - 20) {
    dispatch('touch', {dir: -1});
  } else if (e.layerX < (2*width/3) + 20){
    dispatch('touch', {dir: 0});
  } else {
    dispatch('touch', {dir: 1});
  }
}

</script>

<style>

</style>

<svelte:window on:touchstart|preventDefault="{(e)=>handleTouch(e)}"/>

