<svelte:window on:keydown={keyDownHandler} on:keyup={keyUpHandler}/>

<svg xmlns="http://www.w3.org/2000/svg" 
     style="width:{canvas_width}; height: {canvas_height};"
     viewBox="0 0 {canvas_width} {canvas_height}">
  {#each Array(stage) as _, i}
    <line x1="{stage, calcH(i+0.5)}" y1="-10" 
          x2="{stage, calcH(i+0.5)}" y2="910" 
          style="stroke:rgb(255,255,255); stroke-width: 4"/>
  {/each}

  {#if mistake}
    <rect x="0" y="-10" width="400" height="920" fill="rgba(0,0,0,0.5)"
          transition:fade="{{duration: 100, easing: sineInOut}}"/>
  {/if}

  {#if $cards_today.length > 0}

    {#if blueline.length != 0}

      <circle cx="{calcH(blueline[cur_row])}" cy="{calcV(cur_row)}"
              r="8" fill="{line_color}" class="blueline"/>

      {#each Array(cur_row) as _, i}
        <line x1="{calcH(blueline[i])}" y1="{calcV(i)}"
              x2="{calcH(blueline[i+1])}" y2="{calcV(i+1)}"
              stroke="{line_color}" stroke-width="4" stroke-linecap="round" class="blueline"/>
      {/each}

    {/if}

    {#if treble_path.length != 0}

      <circle cx="{calcH(treble_path[cur_row])}" cy="{calcV(cur_row)}"
              r="5" fill="red" class="treble"/>

        {#each Array(cur_row) as _, i}

          <line x1="{calcH(treble_path[i])}" y1="{calcV(i)}"
                x2="{calcH(treble_path[i+1])}" y2="{calcV(i+1)}"
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
  import { card_complete, mistakes, cards_today } from './stores.js';

  export let id = null;
  export let method = null;
  export let stage = 8;
  export let treble_path = [];
  export let place_bell = 1;
  export let blueline = [];
  export let lead_length = 32;

  let debounce = false;
  let input_dir;
  let canvas_width = 400;
  let canvas_height = 900;
  let mistake;

  var treble_pos = 1
  var cur_row = 0;
  var cur_pos = place_bell;
  var prev_pos = cur_pos;
  var grid_color = '#fff';
  var line_color = '#05a';
  var vertical_offset = 20;

  function calcH(place){
    var place_width = canvas_width / stage;
    return (place - 0.5) * place_width;
  }

  function calcV(row) {
    var row_height = (canvas_height - 2*vertical_offset) / lead_length;
    return row * row_height + vertical_offset
  }

  function resetAll() {
    cur_row = 0;
    cur_pos = place_bell;
    treble_pos = 1;
    $card_complete = false;
  }

  /* $: $cards_so_far, resetAll(); */
  $: $card_complete = cur_row >= lead_length;
  $: method, place_bell, resetAll()


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
        return;
        break;
      default:
        return;
        break;
    }
    if ($card_complete) { return };
    if (blueline[cur_row] + input_dir == blueline[cur_row+1]){
      cur_row += 1;
    } else {
      mistake = true;
      $mistakes += 1;
      setTimeout(()=>{mistake = false;},100);
    }

  }

  function keyUpHandler(e) {
    debounce = false;
  }

</script>
