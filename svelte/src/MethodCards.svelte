<script>
  import { onMount } from 'svelte';
  import { slide } from 'svelte/transition';
  import { flip } from 'svelte/animate';
  import MethodDisplay from './MethodDisplay.svelte';
  import Card from './Card.svelte';
  import Metadata from './Metadata.svelte';
  import CardManager from './CardManager.svelte';
  import { cur_blueline, cur_treble, cur_bell, stage, cur_method, card_complete, lead_length, cards_today } from './stores.js';
  import { get, post } from './ajax.js';

  let cur_card;
  let cards_shown = 0;

  /* Get status, including next card if applicable */
  async function getStatus(){
    get('next').then((state)=>{
      cur_card = state.card;
      $cards_today = state.cards_remaining;
      cards_shown++;
    });
  }

  /* Post results */
  async function postResults(card_id, details){
    let faults = details.mistakes;
    if (details.bumper_mode) {
      /* don't report faults in bumper mode... */
      faults = 0
    }
    if (details.gave_up) {
      /* ...unless we're there because the user gave up */
      faults = 5;
    }
    return await post('card/' + card_id, {card_id: card_id, faults: faults})
  }


  onMount(() => {

    getStatus();

  });

  let show_sidebar = false;
  let window_width;
  let no_cards_left = false;
  $: if (cur_card) { no_cards_left = cur_card.id == null }
  $: if (window_width > 992 || no_cards_left) { show_sidebar = true };
  $: if (window_width < 992 && !no_cards_left) { show_sidebar = false };


</script>

<style>
  #opener {
    width: 100%;
    margin: auto;
    height: 30px;
  }

</style>

<svelte:window bind:innerWidth={window_width}/>

<div class="row pt-4 justify-content-center">

  {#if cur_card}

    <div class="col-12 col-lg-5">


      {#if show_sidebar}
        <div transition:slide>
          <Metadata bumper_mode={cur_card.bumper_mode}/>
        </div>
      {/if}

      <button class="d-lg-none d-block mb-2 p-0 btn btn-outline-secondary"
              id="opener"
              style="width: {Math.min(400, window_width - 25)}px"
              on:click|preventDefault={()=>show_sidebar=!show_sidebar}>
              <i class="fas"
                 class:fa-chevron-up={show_sidebar}
                 class:fa-chevron-down={!show_sidebar}></i>
      </button>

    </div>

    {#if cur_card.id}
    <div class="col-12 col-lg-5 text-center">


        <MethodDisplay {...cur_card} {cards_shown} 
          on:trigger_bumper={()=>{cur_card.bumper_mode = true;}}
          on:report_results={(e)=>postResults(cur_card.id, e.detail)}
          on:done={getStatus}/>

    </div>

      {/if}

  {/if}

  <CardManager/>


</div>
