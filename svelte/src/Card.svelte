<script>
  import { cur_blueline, cur_treble, cur_bell, stage, cur_method } from './stores.js';
</script>

<style>
  .card {
    width: 400px;
  }
</style>

<div class="card mb-2">
  <div class="card-body py-0 text-center">
    <h3 class="card-title mt-3 mb-3">{$cur_method} {$cur_bell}</h3>
  </div>
</div>
