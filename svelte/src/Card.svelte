<script>
  export let method;
  export let bell;
  export let width;
  export let small = true;
</script>


<div class="card mx-auto mb-2"
     style="width: {width}">
  <div class="card-body py-0 text-center">
    {#if small}
      <h6 class="card-title mt-3 mb-3">
        {#if method}
          {method} {bell}
        {:else}
          Done for the day!
        {/if}
      </h6>
    {:else}
      <h3 class="card-title mt-3 mb-3">
        {#if method}
          {method} {bell}
        {:else}
          Done for the day!
        {/if}
      </h3>
    {/if}
  </div>
</div>
