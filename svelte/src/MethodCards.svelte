<script>
  import { onMount } from 'svelte';
  import MethodDisplay from './MethodDisplay.svelte';
  import Card from './Card.svelte';
  import { cur_blueline, cur_treble, cur_bell, stage, cur_method, cards_so_far, card_complete, lead_length, cards_remaining, mistakes } from './stores.js';

  let cur_card;
  let next_card;

  /* Get card */
  async function getCard(method, bell){
    const promise = await fetch('./api/0/card')
    const text = await promise.json();
    if (promise.ok) {
      return text;
    } else {
      throw new Error(text);
    }
  }

  /* Mark card as done */
  async function markCard(id){
    console.log('marking', id);
    $cards_remaining -= 1;
    const response = await fetch('./api/0/card',{
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          card_id: id,
          done: true,
          mistakes: $mistakes,
        }),
    });
  }

  /* Get cards remaining */
  async function cardsRemaining(){
    const response = await fetch('./api/0/today');
    const text = await response.json();
    if (response.ok) {
      return text.cards_remaining;
    } else {
      throw new Error(text);
    }
  }


  function keyDownHandler(e){
    switch(e.key) {
      case 'Enter':
        console.log('mistakes: ', $mistakes);
        if ($card_complete && $mistakes == 0) {
            console.log('no mistakes')
            markCard(cur_card.id);
            cur_card = next_card;
            getNext();
        } else if ($card_complete) {
          console.log('mistakes were made');
          $card_complete = false;
          $mistakes = 0;
        }
        break;
    }
  }

  function keyUpHandler(e){
    return;
  }


  let promise;

  $: console.log($cards_remaining);

  onMount(() => {


    cardsRemaining().then((result)=> $cards_remaining = result);

    promise = getCard()
    promise.then((result)=>{cur_card = result; getNext();});

    window.getNext = function (){
      var next_card_promise = getCard();
      next_card_promise.then((result) => {
        next_card = result;
        $cards_so_far++;

        cur_bell.set(cur_card.place_bell);
        cur_blueline.set(cur_card.blueline);
        cur_treble.set(cur_card.treble_path);
        stage.set(cur_card.stage);
        cur_method.set(cur_card.method);
        lead_length.set(cur_card.lead_length);
      });
    }


  });

</script>

<svelte:window on:keydown={keyDownHandler} on:keyup={keyUpHandler}/>

<div class="row pt-4 justify-content-around">

  <div class="col-5">

    {#await promise then promise}

      <Card/>

      <MethodDisplay/>

    {/await}

  </div>

</div>
