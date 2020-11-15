<script>
  import { onMount } from 'svelte';
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


</script>

<div class="row pt-4">

  {#if cur_card}

    <div class="col-5">
      <Metadata bumper_mode={cur_card.bumper_mode}/>
    </div>

    <div class="col-5">


      <Card method={cur_card.method} bell={cur_card.place_bell}/>

      <MethodDisplay {...cur_card} {cards_shown} 
        on:trigger_bumper={()=>{cur_card.bumper_mode = true;}}
        on:report_results={(e)=>postResults(cur_card.id, e.detail)}
        on:done={getStatus}/>



  </div>

  {/if}

  <CardManager/>

</div>
