<script>
  import { cards_today, mistakes, card_complete } from './stores.js';

  export let bumper_mode;

  let done_message;
  $: switch ($mistakes) {
    case 0:
      done_message = 'Easy'
      break;
    case 1:
    case 2:
      done_message = 'Good'
      break;
    case 3:
    case 4:
      done_message = 'Hard'
      break;
    default:
      done_message = 'Relearn'
      break;
  }

</script>

<style>
  .card {
    max-width: 400px;
  }

  #doneMessage {
    position: absolute;
    bottom: 50%;
    background-color: white;
    width: 440px;
    left: -5px;
  }
</style>

<div class="card mb-2">
  <div class="card-body py-0 text-center">
    <h3 class="card-title mt-3 mb-3">
      Method Tutor
    </h3>
  </div>

  <ul class="list-group list-group-flush">
    <li class="list-group-item">
      Cards remaining:<span class="float-right">{$cards_today}</span>
    </li>
  </ul>

</div>

{#if bumper_mode && !$card_complete}
  <div class="card mb-2">
    <div class="card-body">
      <h4 class="card-title">
        Bumper mode
      </h4>
      <div class="card-text">
        The card will prevent you from making mistakes this time through.
      </div>
    </div>
  </div>
{/if}


{#if $card_complete}
  <div class="card mb-2">
    <div class="card-body">
      {#if bumper_mode}
        <h4 class="card-title">
          Good
        </h4>
        <div class="card-text">
          Bumper mode will be disabled next time.
        </div>
      {:else}
        <h4 class="card-title">
          {done_message} — {$mistakes} mistakes
        </h4>
        <span class="card-subtitle">Press Enter or Up to progress.</span>
     {/if}
    </div>
  </div>
{/if}

