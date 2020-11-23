<script>
  import { mistakes, card_complete } from './stores.js';
  export let method;
  export let bell;
  export let width;
  export let small = true;

  let done_color;
  $: switch ($mistakes) {
    case 0:
      done_color = 'success';
      break;
    case 1:
    case 2:
      done_color = 'primary';
      break;
    case 3:
    case 4:
      done_color = 'warning';
      break;
    default:
      done_color = 'danger';
      break;
  }

  $: console.log($card_complete, done_color);

</script>

<style>



</style>


<div class="card mx-auto mb-2"
  style="width: {width}; 
  border-color: {$card_complete ? 'var(--' + done_color + ')' : 'rgba(0,0,0,0.125)'};
  border-width: {$card_complete ? '3px' : '1px' };">
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
