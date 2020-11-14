<script>
  import { onMount } from 'svelte';
  import MethodDisplay from './MethodDisplay.svelte';
  import Card from './Card.svelte';
  import Metadata from './Metadata.svelte';
  import { cur_blueline, cur_treble, cur_bell, stage, cur_method, card_complete, lead_length, cards_today, mistakes } from './stores.js';
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
  async function postResults(card_id, faults){
    return await post('card/' + card_id, {card_id: card_id, faults: faults})
  }

  function keyDownHandler(e){
    switch(e.key) {
      case 'Space':
      case 'ArrowUp':
      case 'Enter':
        if ($card_complete) {
            postResults(cur_card.id, $mistakes).then((results)=>{
              $mistakes = 0;
              getStatus();
            });
        }
        break;
    }
  }

  function keyUpHandler(e){
    return;
  }


  onMount(() => {

    getStatus();

  });

  $: if ($mistakes >= 4){
    cur_card.bumper_mode = true;
  }

</script>

<svelte:window on:keydown={keyDownHandler} on:keyup={keyUpHandler}/>

<div class="row pt-4">

  {#if cur_card}

    <div class="col-5">
      <Metadata bumper_mode={cur_card.bumper_mode}/>
    </div>

    <div class="col-5">


      <Card method={cur_card.method} bell={cur_card.place_bell}/>

      <MethodDisplay {...cur_card} {cards_shown}/>



  </div>

  {/if}

</div>
