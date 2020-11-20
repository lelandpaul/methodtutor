<svelte:window on:keydown={keyDownHandler}/>

<script>
  import { get, post } from './ajax.js';
  import { createEventDispatcher } from 'svelte';
  import AutoComplete from 'simple-svelte-autocomplete';


  let input;
  let selected;
  let form;

  const dispatch = createEventDispatcher();

  async function addMethod(){
    
    return await post('user/methods', {
      method_name: input,
    }).then(()=>dispatch('refresh'));
  };

  async function getMethods(keyword){
    const promise = await post('methods', {keyword: keyword})
    const json = await promise.results;
    return json;
  }

  function keyDownHandler(e) {
    if (e.key === 'Enter' && input){
      addMethod();
    }
  }

</script>

<form id="addMethodForm" class="form mt-5" on:submit|preventDefault={addMethod}>

    <AutoComplete searchFunction={getMethods} 
                  labelFieldName="method_name"
                  valueFieldName="method_name"
                  minCharactersToSearch="3"
                  placeholder="Add method..."
                  hideArrow
                  className="form-group special-wtf"
                  inputClassName="form-control"
                  bind:selectedItem={selected}
                  bind:value={input}
                  />

    <button type="submit" class="btn btn-primary">Add</button>
</form>

<style>
  :global(#addMethodForm > .autocomplete) {
    width: 90%;
  }

  button {
    height: 2.25em;
    float: right;
  }
</style>


