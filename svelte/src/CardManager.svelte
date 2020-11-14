<script>
  import { get, post } from './ajax.js'
  import { onMount } from 'svelte';
  import { bellName } from './helpers.js';
  import SortableTable from './SortableTable.svelte'


  import dayjs from 'dayjs';
  import relativeTime from 'dayjs/plugin/relativeTime';
  import isToday from 'dayjs/plugin/isToday';
  dayjs.extend(relativeTime);
  dayjs.extend(isToday)


  async function getCardList(){
    return await get('cards');
  }

  let promise = getCardList();

  function formatDate(d){
    let djs = dayjs(d);
    if (djs.isToday()){
      return 'today';
    } else {
      return djs.toNow(true);
    }
  }

</script>

<div class="modal fade" tabindex="-1" id="cardManager">
  <div class="modal-dialog modal-dialog-scrollable modal-xl">
    <div class="modal-content">
      <div class="modal-body">

        <div class="container-fluid">

          <div class="row">

            <div class="col">

              {#await promise then all_cards}
                <SortableTable data={all_cards}/>
              {/await}

            </div>

          </div>

        </div>

      </div>
    </div>
  </div>
</div>

