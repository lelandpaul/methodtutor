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
    margin: auto;
  }

  #doneMessage {
    position: absolute;
    bottom: 50%;
    background-color: white;
    width: 440px;
    left: -5px;
  }

  a {
    color: black;
  }

  a:hover {
    color: var(--blue);
    text-decoration: none;
  }

</style>

<div class="card mb-2">
  <div class="card-body py-0">


    <h3 class="card-title mt-3 mb-3">
      Method Tutor
    </h3>

  </div>

  <ul class="list-group list-group-flush">

    <li class="list-group-item list-group-item-action px-3 pt-3 p-lg-4">

      <h6> 
        <a href="#" data-toggle="modal" data-target="#cardManager">
          <i class="fas fa-cog"></i>
          Settings
        </a>
      </h6>

    </li>


    <li class="list-group-item p-3 p-lg-4">
      Cards remaining:<span class="float-right">{$cards_today}</span>
    </li>
  </ul>

</div>

{#if bumper_mode && !$card_complete}
  <div class="card mb-2">
    <div class="card-body">
      <h5 class="card-title">
        Bumper mode
      </h5>
      <p class="card-text">
        The card will prevent you from making mistakes this time through.
      </p>
    </div>
  </div>
{/if}


{#if $card_complete}
  <div class="card mb-2">
    <div class="card-body">
      {#if bumper_mode}
        <h5 class="card-title">
          Good
        </h5>
        <p class="card-text">
          Bumper mode will be disabled next time.
        </p>
      {:else}
        <h5 class="card-title">
          {done_message} — {$mistakes} mistakes
        </h5>
        <p class="card-text">Press Enter or Up to progress.</p>
     {/if}
    </div>
  </div>
{/if}

