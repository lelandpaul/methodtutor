<script>
  import MethodDisplay from './MethodDisplay.svelte';
  import { cur_blueline, cur_treble, cur_bell, stage, cur_method } from './stores.js';

  /* Get path */
  async function getPath(method, bell){
    const promise = await fetch('./get_line/' + method + '/' + bell)
    const text = await promise.json();
    if (promise.ok) {
        return text;
    } else {
        throw new Error(text);
    }
  }
  let blueline_promise;
  let treble_promise;
  $: {
      blueline_promise = getPath($cur_method, $cur_bell);
      treble_promise = getPath($cur_method, 1);
      blueline_promise.then((result)=>{$cur_blueline = result;});
      treble_promise.then((result)=>{$cur_treble = result;});
  }


</script>

<MethodDisplay/>
