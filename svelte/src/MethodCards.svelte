<script>
  import { onMount } from 'svelte';
  import MethodDisplay from './MethodDisplay.svelte';
  import Card from './Card.svelte';
  import { cur_blueline, cur_treble, cur_bell, stage, cur_method, card_complete, lead_length, cards_today, mistakes } from './stores.js';
  import { get, post } from './ajax.js';

  let cur_card;


  /* Get scheduled cards */
  async function cardsToday(){
    return await get('today');
  }

  /* Get card */
  async function getCard(card_id){
    return await get('card/' + card_id);
  }

  /* Post results */
  async function postResults(card_id, faults){
    post('card/' + card_id, {card_id: card_id, faults: faults})
  }

  function keyDownHandler(e){
    switch(e.key) {
      case 'Enter':
        if ($card_complete) {
            postResults(cur_card.id, $mistakes);
          if ($mistakes <= 1){
            $cards_today = [...$cards_today.slice(1)]
          } else {
            $cards_today = [...$cards_today.slice(1), $cards_today[0]]
          }
            $mistakes = 0;
        }
        break;
    }
  }

  function keyUpHandler(e){
    return;
  }

  $: console.log($cards_today, $card_complete);

  $: if ($cards_today.length > 0) {
        getCard($cards_today[0].card_id).then((result)=>cur_card=result);
      } else {
        cur_card = {method: null, stage: 8};
    }

  onMount(() => {

    cardsToday().then((result) => {$cards_today = result})

  });

</script>

<svelte:window on:keydown={keyDownHandler} on:keyup={keyUpHandler}/>

<div class="row pt-4 justify-content-around">

  <div class="col-5">


    <Card method={cur_card.method} bell={cur_card.place_bell}/>


    <MethodDisplay {...cur_card}/>


  </div>

</div>
