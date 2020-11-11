<svelte:window on:keydown={keyDownHandler} on:keyup={keyUpHandler}/>

<canvas
  id='base'
  bind:this={canvas}
  width={400}
  height={900}
></canvas>

<canvas
  id='cover'
  bind:this={cover}
  width={400}
  height={900}
></canvas>


<style>

  :global(body) {
    background: #d3d1dc;
  }

  canvas { 
    background: #f5f5f5; 
    margin: 1em;
    border-style: solid;
    border-width: 3px;
    border-color: black;
    position: absolute;
  }

  #cover {
    background: rgba(255,255,255,0);
  }

</style>


<script>

  import { onMount } from 'svelte';

  let cover;

  let canvas;
  let place_width;
  let row_height;


  var debounce = false;
  let drawBells;
  let drawSegment;
  let drawTreble;


  var stage = 8;
  var rows = 32;
  var treble_pos = 1
  var cur_row = 0;
  var cur_place = 8;
  var grid_color = '#fff';
  var line_color = '#05a';
  var vertical_offset = 20;


  function calcH(place){
    place_width = canvas.width / stage;
    return (place - 0.5) * place_width;
  }

  function calcV(row) {
    row_height = (canvas.height - 2*vertical_offset) / rows;
    return row * row_height + vertical_offset
  }


  onMount(() => {
    const ctx = canvas.getContext('2d');
    const cvr = cover.getContext('2d');

    function drawGrid(){
      for (var l=1; l<stage; l++){
        ctx.lineWidth = 4;
        ctx.strokeStyle = grid_color;
        ctx.beginPath();
        ctx.moveTo(l*place_width, 0);
        ctx.lineTo(l*place_width, canvas.height);
        ctx.closePath();
        ctx.stroke();
      }

    }

    drawSegment = function (place, dir, width, color){
      ctx.lineWidth = width;
      ctx.strokeStyle = color;
      ctx.beginPath()
      ctx.moveTo(calcH(place), calcV(cur_row));
      ctx.lineTo(calcH(place+dir), calcV(cur_row+1));
      ctx.closePath()
      ctx.stroke();

    }

    drawTreble = function() {
      var dir;
      if (cur_row == 15 || cur_row == 31){
        dir = 0;
      } else if (Math.floor(cur_row/15) == 0 && cur_row % 4 == 1){
        dir = -1;
      } else if (Math.floor(cur_row/15) == 0 && cur_row % 4 != 1){
        dir = 1;
      } else if (Math.floor(cur_row/15) > 0 && cur_row % 4 == 1){
        dir = 1;
      } else if (Math.floor(cur_row/15) > 0 && cur_row % 4 != 1){
        dir = -1
      }
      drawSegment(treble_pos, dir, 1, 'red');
      treble_pos += dir;
    }


    drawBells = function () {
      cvr.clearRect(0, 0, canvas.width, canvas.height);
      cvr.fillStyle = 'red';
      cvr.beginPath();
      cvr.arc(calcH(treble_pos), calcV(cur_row), 5, 0, 2*Math.PI);
      cvr.closePath();
      cvr.fill();

      cvr.fillStyle = line_color;
      cvr.beginPath();
      cvr.arc(calcH(cur_place), calcV(cur_row), 8, 0, 2*Math.PI);
      cvr.closePath();
      cvr.fill();
    }
      
    drawBells();
    drawGrid();

  });

  function drawNextSeg(dir){
    drawTreble();
    drawSegment(cur_place, dir, 3, line_color);
    cur_place += dir;
    cur_row += 1;
    drawBells();
  }

  function keyDownHandler(e) {
    if (debounce) { return }
    if (cur_row >= 32) { return }
    if (e.keyCode == 37 && cur_place != 1) {
      drawNextSeg(-1);
    }
    if (e.keyCode == 39 && cur_place != stage) {
      drawNextSeg(1);
    }
    if (e.keyCode == 40){
      drawNextSeg(0);
    }
  }

  function keyUpHandler(e) {
    debounce = false;
  }

</script>
