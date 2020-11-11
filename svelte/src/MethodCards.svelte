<script>
  import { onMount } from 'svelte';
  import MethodDisplay from './MethodDisplay.svelte';
  import Card from './Card.svelte';
  import { cur_blueline, cur_treble, cur_bell, stage, cur_method, cards_so_far, card_complete } from './stores.js';

  let cur_card;
  let next_card;

  /* Get card */
  async function getCard(method, bell){
    const promise = await fetch('./get_next_card')
    const text = await promise.json();
    if (promise.ok) {
      return text;
    } else {
      throw new Error(text);
    }
  }

  function keyDownHandler(e){
    switch(e.key) {
      case 'Enter':
        if ($card_complete){
            cur_card = next_card;
            getNext();
        }
        break;
    }
    if (e.key === 'r'){
      cur_card = next_card;
      getNext();
    }

  }

  function keyUpHandler(e){
    return;
  }


  let promise;

  onMount(() => {

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
