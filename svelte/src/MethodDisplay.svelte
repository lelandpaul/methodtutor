<svelte:window on:keydown={keyDownHandler} on:keyup={keyUpHandler}/>

<svg xmlns="http://www.w3.org/2000/svg" 
     style="width:{canvas_width}; height: {canvas_height};"
     viewBox="0 0 {canvas_width} {canvas_height}">
  {#each Array($stage) as _, i}
    <line x1="{$stage, calcH(i+0.5)}" y1="-10" 
          x2="{$stage, calcH(i+0.5)}" y2="910" 
          style="stroke:rgb(255,255,255); stroke-width: 4"/>
  {/each}

  {#if mistake}
    <rect x="0" y="-10" width="400" height="920" fill="rgba(0,0,0,0.5)"
          transition:fade="{{duration: 100, easing: sineInOut}}"/>
  {/if}

  {#if $cards_remaining > 0}

    {#if $cur_blueline.length != 0}

      <circle cx="{calcH($cur_blueline[cur_row])}" cy="{calcV(cur_row)}"
              r="8" fill="{line_color}" class="blueline"/>

      {#each Array(cur_row) as _, i}
        <line x1="{calcH($cur_blueline[i])}" y1="{calcV(i)}"
              x2="{calcH($cur_blueline[i+1])}" y2="{calcV(i+1)}"
              stroke="{line_color}" stroke-width="4" stroke-linecap="round" class="blueline"/>
      {/each}

    {/if}

    {#if $cur_treble.length != 0}

      <circle cx="{calcH($cur_treble[cur_row])}" cy="{calcV(cur_row)}"
              r="5" fill="red" class="treble"/>

        {#each Array(cur_row) as _, i}

          <line x1="{calcH($cur_treble[i])}" y1="{calcV(i)}"
                x2="{calcH($cur_treble[i+1])}" y2="{calcV(i+1)}"
                style="stroke: red; stroke-width: 2; stroke-linecap=round;" class="treble"/>
        {/each}

    {/if}

  {/if}

</svg>

<style>

  svg {
    background: #f5f5f5; 
    border-style: solid;
    border-width: 3px;
    border-color: black;
  }

  :global(body) {
    background: #d3d1dc;
  }

</style>


<script>

  import { sineInOut } from 'svelte/easing';
  import { fade } from 'svelte/transition';
  import { cur_blueline, cur_treble, stage, cur_bell, cards_so_far, card_complete, lead_length, cards_remaining } from './stores.js';

  let debounce = false;
  let input_dir;
  let canvas_width = 400;
  let canvas_height = 900;
  let mistake;

  var treble_pos = 1
  var cur_row = 0;
  var cur_pos = 8;
  var prev_pos = cur_pos;
  var grid_color = '#fff';
  var line_color = '#05a';
  var vertical_offset = 20;

  function calcH(place){
    var place_width = canvas_width / $stage;
    return (place - 0.5) * place_width;
  }

  function calcV(row) {
    var row_height = (canvas_height - 2*vertical_offset) / $lead_length;
    return row * row_height + vertical_offset
  }

  function resetAll() {
    cur_row = 0;
    cur_pos = cur_bell;
    treble_pos = 1;
  }

  $: $cards_so_far, resetAll();
  $: $card_complete = cur_row >= $lead_length;

  function keyDownHandler(e) {
    if (debounce) { return }
    switch(e.key) {
      case "ArrowLeft":
        input_dir = -1;
        break;
      case "ArrowDown":
        input_dir = 0;
        break;
      case "ArrowRight":
        input_dir = 1;
        break;
      case "Enter":
        resetAll();
        return;
        break;
      default:
        return;
        break;
    }
    if ($card_complete) { return };
    if ($cur_blueline[cur_row] + input_dir == $cur_blueline[cur_row+1]){
      cur_row += 1;
    } else {
      mistake = true;
      setTimeout(()=>{mistake = false;},100);
    }

  }

  function keyUpHandler(e) {
    debounce = false;
  }

</script>
