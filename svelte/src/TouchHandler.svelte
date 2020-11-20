<script>

import { createEventDispatcher } from 'svelte';
import { card_complete } from './stores.js';

let dispatch = createEventDispatcher()

</script>

<style>

  i {
    opacity: 0.3;
    font-size: 5rem;
  }

</style>

  <div id="touchHandler" class="fixed-bottom row no-gutter mb-3">

    {#if $card_complete}
      <div class="col-12 text-center" on:touchstart|preventDefault="{e=>dispatch('done')}">
        <button class="btn btn-outline-secondary">Next</button>
      </div>
    {:else}
      <div class="col-4 text-left" on:touchstart|preventDefault="{e=>dispatch('touch', {dir: -1})}">
        <i class="fas fa-arrow-circle-left"></i>
      </div>

      <div class="col-4 text-center" on:touchstart|preventDefault="{e=>dispatch('touch', {dir: 0})}">
        <i class="fas fa-arrow-circle-down"></i>
      </div>

      <div class="col-4 text-right" on:touchstart|preventDefault="{e=>dispatch('touch', {dir: 1})}">
        <i class="fas fa-arrow-circle-right"></i>
      </div>
    {/if}

  </div>

