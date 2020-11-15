<script>
  import { get, post, httpDel } from './ajax.js'
  import { onMount } from 'svelte';
  import { bellName } from './helpers.js';
  import SortableTable from './SortableTable.svelte'
  import MethodAdder from './MethodAdder.svelte'


  async function getCardList(){
    console.log('getting cards')
    return await get('cards');
  }

  async function getMethodList(){
    console.log('getting methods')
    return await get('user/methods');
  }

  async function deleteMethod(event){
    httpDel('user/methods',event.detail).then(()=>refresh());
  }

  let cards_promise = getCardList();
  let methods_promise = getMethodList();

  function refresh() {
    cards_promise = getCardList();
    methods_promise = getMethodList();
  }

  let card_headers = {
    method: 'Method',
    place_bell: 'Bell',
    scheduled: 'Next Review',
    ease: 'Ease',
  }

  let method_headers = {
    method: 'Method',
    total: 'Total',
    new: 'New',
  }

  let modal_overflow = true;

</script>

<style>
  .overflow-visible {
    overflow: visible !important;
  }
</style>


<div class="modal fade" tabindex="-1" id="cardManager" class:overflow-visible="{modal_overflow}">
  <div class="modal-dialog modal-dialog-scrollable modal-xl" class:overflow-visible="{modal_overflow}">
    <div class="modal-content" class:overflow-visible="{modal_overflow}">
      <div class="modal-header">

        <h3 class="modal-title">Method Tutor </h3>

        <ul class="nav nav-pills">
          <li class="nav-item" role="presentation">
            <a class="nav-link active" href="#tabpanel-methods" id="tab-methods" data-toggle="pill" role="tab" aria-controls="methods" aria-selected="true" on:focus={refresh} on:click={()=>modal_overflow=true}>Methods</a>
          </li>
          <li class="nav-item" role="presentation">
            <a class="nav-link" href="#tabpanel-cards" id="tab-cards" data-toggle="pill" role="tab" aria-controls="cards" aria-selected="false" on:click={()=>modal_overflow=false}>Cards</a>
          </li>
          <li class="nav-item" role="presentation">
            <a class="nav-link" href="#tabpanel-settings" id="tab-settings" data-toggle="pill" role="tab" aria-controls="settings" aria-selected="false" on:click={()=>modal_overflow=false}>Settings</a>
          </li>
        </ul>


      </div>


      <div class="modal-body" class:overflow-visible="{modal_overflow}">


        <div class="tab-content" id="tabContent">

          <div class="tab-pane fade show active" id="tabpanel-methods" role="tabpanel" aria-labelledby="tab-methods">
            {#await methods_promise then all_methods}
              <SortableTable data={all_methods} headers={method_headers} remove={true}
                      on:delete_method={deleteMethod}/>
            {/await}

            <MethodAdder on:refresh={refresh}/>

          </div>

          <div class="tab-pane fade" id="tabpanel-cards" role="tabpanel" aria-labelledby="tab-cards">
            {#await cards_promise then all_cards}
              <SortableTable data={all_cards} headers={card_headers}/>
            {/await}
          </div>

          <div class="tab-pane fade" id="tabpanel-settings" role="tabpanel" aria-labelledby="tab-settings">
            settings
          </div>
        </div>


      </div>

      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
      </div>

    </div>
  </div>
</div>

