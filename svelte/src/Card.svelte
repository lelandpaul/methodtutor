<script>
  export let method;
  export let bell;
</script>

<style>
  .card {
    width: 400px;
  }
</style>

<div class="card mb-2">
  <div class="card-body py-0 text-center">
    <h3 class="card-title mt-3 mb-3">
      {#if method}
        {method} {bell}
      {:else}
        Done for the day!
      {/if}
    </h3>
  </div>
</div>
