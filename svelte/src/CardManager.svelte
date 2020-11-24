<script>
  import { get, post, httpDel } from './ajax.js'
  import { onMount } from 'svelte';
  import { bellName } from './helpers.js';
  import SortableTable from './SortableTable.svelte'
  import MethodAdder from './MethodAdder.svelte'


  async function getCardList(){
    return await get('cards');
  }

  async function getMethodList(){
    return await get('user/methods');
  }

  async function getSettings(){
    return await get('user/settings');
  }

  async function deleteMethod(event){
    httpDel('user/methods',event.detail).then(()=>refresh());
  }

  async function logout(){
    post('logout').then((resp) => window.location.href="/");
  }

  async function sendSettings(){
    setTimeout(()=>{
      post('user/settings',
        { max_reviews: max_reviews,
          unlimited_reviews: unlimited_reviews,
          max_new: max_new,
          unlimited_new: unlimited_new,
        }
      )
    }, 50); // Wait for other values to update
  }

  let modal_overflow = true;
  let unlimited_reviews = true;
  let unlimited_new = false;
  let max_reviews = 0;
  let max_new = 0;


  getSettings().then((resp)=>{
    console.log('got settings:', resp);
    unlimited_reviews = resp.unlimited_reviews
    unlimited_new = resp.unlimited_new
    max_reviews = resp.max_reviews
    max_new = resp.max_new
  });

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
  }




</script>

<style>
  .overflow-visible {
    overflow: visible !important;
  }

  .form-row > label {
    font-weight: bold;
  }

</style>


<div class="modal fade" tabindex="-1" id="cardManager" class:overflow-visible="{modal_overflow}">
  <div class="modal-dialog modal-dialog-scrollable modal-lg" class:overflow-visible="{modal_overflow}">
    <div class="modal-content" class:overflow-visible="{modal_overflow}">
      <div class="modal-header border-bottom-0">

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

          <div class="tab-pane fade px-3" id="tabpanel-settings" role="tabpanel" aria-labelledby="tab-settings">

            <form>

              <div class="form-row mb-4">


                <div class="col-12 col-lg-5">

                  <label for="user_email" class="pr-5 font-weight-bold">
                    Currently logged in as:
                  </label>

                </div>

                <div class="col-auto col-lg-2">

                  <input type="text" readonly id="user_email" 
                         value="{window.user_email}"
                         class="align-baseline form-control-plaintext mt-n1"/>

                </div>

                <div class="col-2 text-right p-0">

                  <button class="btn btn-sm btn-danger"
                          on:click|preventDefault={logout}>Log Out</button>

                </div>

              </div>


              <div class="form-row mb-4">


                <div class="col-12 col-lg-5">

                  <label for="maxReviews" class="pr-5 font-weight-bold">
                    Maximum reviews per day:
                  </label>

                </div>

                <div class="col-2">

                  <input type="number" id="maxReviews" 
                         bind:value={max_reviews}
                         disabled={unlimited_reviews}
                         on:blur={sendSettings}
                         class="align-baseline form-control form-control-sm"/>

                </div>

                <div class="col-2">

                  <div class="custom-control custom-checkbox pl-5">

                    <input type="checkbox" class="custom-control-input" id="maxReviewsUnlimited"
                           on:click={sendSettings}
                           bind:checked={unlimited_reviews}/>

                    <label class="custom-control-label" for="maxReviewsUnlimited">
                      Unlimited
                    </label>

                  </div>

                </div>

              </div>

              <div class="form-row mb-4">


                <div class="col-12 col-lg-5">

                  <label for="maxNew" class="pr-5 font-weight-bold">
                    Maximum new cards per day:
                  </label>

                </div>

                <div class="col-2">

                  <input type="number" id="maxNew" 
                         bind:value={max_new}
                         disabled={unlimited_new}
                         on:blur={sendSettings}
                         class="align-baseline form-control form-control-sm"/>

                </div>

                <div class="col-2">

                  <div class="custom-control custom-checkbox pl-5">

                    <input type="checkbox" class="custom-control-input" id="maxNewUnlimited"
                           on:click={sendSettings}
                           bind:checked={unlimited_new}/>

                    <label class="custom-control-label" for="maxNewUnlimited">
                      Unlimited
                    </label>

                  </div>

                </div>

              </div>


            </form>


          </div>

        </div>


      </div>

      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
      </div>

    </div>
  </div>
</div>

