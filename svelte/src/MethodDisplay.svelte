<svelte:window bind:innerWidth={innerWidth} bind:innerHeight={innerHeight}
               on:keydown={keyDownHandler} on:keyup={keyUpHandler}/>


{#if innerWidth}

<Card method={method} bell={place_bell} width={canvas_width} small={cardtext_small}/>


<svg xmlns="http://www.w3.org/2000/svg" 
    class:bumper_mode
    style="width:{canvas_width};
           height: {canvas_height};"
          viewBox="0 0 {canvas_width} {canvas_height}"
        >
  {#each Array(stage-1) as _, i}
    <line x1="{stage, calcH(i+1.5)}" y1="-10" 
          x2="{stage, calcH(i+1.5)}" y2="910" 
          style="stroke: rgba(0,0,0, 0.125);
                 stroke-width: 2"
          stroke-dasharray="{i % 2 == 0 ? '4,4' : '0'}"/>
  {/each}

  {#each Array(stage) as _, i}
    <text x="{stage, calcH(i+1)}" y="20" text-anchor="middle">
      { bellName(i+1) }
    </text>
    <text x="{stage, calcH(i+1)}" y="{canvas_height - 10}" text-anchor="middle">
      { bellName(i+1) }
    </text>
  {/each}

  {#if mistake}
    <rect x="0" y="-10" width="400" height="920" fill="rgba(0,0,0,0.5)"
          transition:fade="{{duration: 100, easing: sineInOut}}"/>
  {/if}


  {#if blueline.length != 0}

    <circle cx="{calcH(bumper_mode ? blueline[cur_row] : free_blueline[cur_row])}" cy="{calcV(cur_row)}"
            r="8" fill="{line_color}" class="blueline"/>

    <path fill="transparent" stroke="{line_color}" stroke-width="4" stroke-linecap="round"
      d="{getPathString(cur_row, bumper_mode ? blueline : free_blueline)}"/>

  {/if}

  {#if treble_path.length != 0}

    <circle cx="{calcH(treble_path[cur_row])}" cy="{calcV(cur_row)}"
            r="5" fill="red" class="treble"/>

    <path fill="transparent" stroke="red" stroke-width="2" stroke-linecap="round"
      d="{getPathString(cur_row, treble_path)}"/>

  {/if}

  {#if $card_complete && mistakes > 0 }

    {#each Array(cur_row) as _, i}

    <circle cx="{calcH(blueline[cur_row])}" cy="{calcV(cur_row)}"
            r="8" fill="{$card_complete ? faded_color : line_color}" class="correction"/>

        <line x1="{calcH(blueline[i])}" y1="{calcV(i)}"
              x2="{calcH(blueline[i+1])}" y2="{calcV(i+1)}"
              style="stroke: {$card_complete ? faded_color : line_color};"
              stroke-width="4" 
              stroke-linecap="round" 
              class="correction"/>

    {/each}
  {/if}

</svg>
{/if}

{#if detectMob()}
  <TouchHandler width={innerWidth}
                on:touch={(e)=>handleInput(e.detail.dir)}
                on:done={(e)=>{resetAll(); dispatch('done')}}/>

<div class="row">
  <div class="col">
    <i id="leftArrow" class="fas fa-arrow-alt-circle-left"></i>
  </div>
  <div class="col">
    <i id="downArrow" class="fas fa-arrow-alt-circle-down"></i>
  </div>
  <div class="col">
    <i id="rightArrow" class="fas fa-arrow-alt-circle-right"></i>
  </div>
</div>
{/if}

<style>

  svg {
    background: #fff;
    border: 1px solid rgba(0,0,0,.125);
    border-radius: 0.25em;
  }

  svg.bumper_mode {
    background: #eee;
    border-color: black;
    border-width: 2px;
  }

  :global(body) {
    background: #d3d1dc;
  }

  .row {
    padding-top: 3px;
    font-size: 1.25rem;
  }

  #leftArrow {
    transform: rotate(-45deg);
  }

  #rightArrow {
    transform: rotate(45deg);
  }



</style>


<script>

  import { sineInOut } from 'svelte/easing';
  import { fade } from 'svelte/transition';
  import { onMount, createEventDispatcher } from 'svelte';
  import { card_complete, cards_today, mistakes } from './stores.js';
  import { bellName, detectMob } from './helpers.js';
  import Card from './Card.svelte';
  import TouchHandler from './TouchHandler.svelte';

  const dispatch = createEventDispatcher();

  export let id = null;
  export let method = null;
  export let stage = 8;
  export let treble_path = [];
  export let place_bell = 1;
  export let blueline = [];
  export let lead_length = 32;
  export let cards_shown;
  export let bumper_mode;

  let debounce = false;
  let input_dir;
  let mistake;
  let free_blueline = [place_bell];

  let innerWidth;
  let innerHeight;
  $: canvas_width = Math.min(400, innerWidth - 25);
  $: canvas_height = Math.min(900,innerHeight - 150);

  let cardtext_small = false;
  $: cardtext_small = canvas_width < 400;

  var treble_pos = 1
  var cur_row = 0;
  var cur_pos = place_bell;
  var prev_pos = cur_pos;
  var grid_color = '#fff';
  var line_color = '#05a';
  var faded_color = '#6bf';
  var vertical_offset = 40;

  function calcH(place){
    var place_width = canvas_width / stage;
    return (place - 0.5) * place_width;
  }

  function calcV(row) {
    var row_height = (canvas_height - 2*vertical_offset) / lead_length;
    return row * row_height + vertical_offset
  }

  function getPathString(row, positions){
    let path_string = "M" + calcH(positions[0]) + ' ' + calcV(0)
    for (let i = 1; i <= row; i++){
      path_string += 'L' + calcH(positions[i]) + ' ' + calcV(i)
    }
    return path_string
  }

  function resetAll() {
    cur_row = 0;
    cur_pos = place_bell;
    treble_pos = 1;
    free_blueline = [place_bell];
    gave_up = false;
  }

  /* $: $cards_so_far, resetAll(); */
  $: $card_complete = cur_row >= lead_length;
  $: cards_shown, resetAll()

  function calcLineDiff(){
    let diff_array = [];
    let local_mistakes = 0;
    for (let i = 0; i < free_blueline.length; i++){
      diff_array.push(blueline[i] - free_blueline[i]);
    }
    for (let i = 1; i < diff_array.length; i++){
      if (diff_array[i] != diff_array[i-1] && diff_array[i] != 0){
        local_mistakes += 1;
      }
    }
    return local_mistakes;
  }

  let gave_up = false;
  function reportResults(){
    if (!bumper_mode) {
      $mistakes = calcLineDiff()
      } else {
      $mistakes = 0;
    }
    dispatch('report_results',{
      mistakes: $mistakes,
      gave_up: gave_up,
      bumper_mode: bumper_mode,
    });
  }

  function updateBumper(dir){
    if (blueline[cur_row] + dir == blueline[cur_row+1]){
      cur_row += 1;
    } else {
      mistake = true;
      setTimeout(()=>{mistake = false;},100);
    }
  }

  function updateFree(dir) {
    if (cur_pos + dir == treble_path[cur_row+1]) { 
      mistake = true;
      setTimeout(()=>{mistake = false;},100);
      return
    }
    if (cur_pos == 1 && dir == -1) {
      return;
    }
    if (cur_pos == stage && dir == 1){
      return;
    }
    cur_row += 1;
    cur_pos += dir;
    free_blueline.push(cur_pos);
  }

  $: if ($card_complete) {
      reportResults()
  }

  function handleInput(dir){
    if ($card_complete){
      return;
    }
    let el;
    if (detectMob()) {
      switch(dir){
        case -1:
          el = document.getElementById('leftArrow')
          break;
        case 0:
          el = document.getElementById('downArrow')
        case 1:
          el = document.getElementById('rightArrow')
      } 
      el.style.color = 'red';
      setTimeout(()=>el.style.color = 'black', 100);
    }
    if (bumper_mode) { updateBumper(dir) }
    else { updateFree(dir) };
  }

  function keyDownHandler(e) {
    if (debounce) { return }
    switch(e.key) {
      case "ArrowLeft":
        handleInput(-1)
        break;
      case "ArrowDown":
        handleInput(0)
        break;
      case "ArrowRight":
        handleInput(1)
        break;
      case "Escape":
        resetAll()
        if (!bumper_mode) {
          dispatch('trigger_bumper');
          gave_up = true;
        }
        return;
        break;
      case "Space":
      case "ArrowUp":
      case "Enter":
        resetAll()
        if ($card_complete) {
          dispatch('done');
        }
        return;
        break;
      default:
        return;
        break;
    }
  }

  function keyUpHandler(e) {
    debounce = false;
  }

</script>
