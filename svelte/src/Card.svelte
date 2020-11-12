<script>
  import { cur_blueline, cur_treble, cur_bell, stage, cur_method, cards_remaining } from './stores.js';
</script>

<style>
  .card {
    width: 400px;
  }
</style>

<div class="card mb-2">
  <div class="card-body py-0 text-center">
    <h3 class="card-title mt-3 mb-3">
      {#if $cards_remaining > 0}
        {$cur_method} {$cur_bell}
      {:else}
        Done for the day!
      {/if}
    </h3>
  </div>
</div>
