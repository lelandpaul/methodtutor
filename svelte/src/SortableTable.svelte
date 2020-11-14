<script>
  import { onMount } from 'svelte';
  import { bellName } from './helpers.js';

  import dayjs from 'dayjs';
  import relativeTime from 'dayjs/plugin/relativeTime';
  import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
  import isTomorrow from 'dayjs/plugin/isTomorrow';
  import Timezone from 'dayjs/plugin/Timezone';
  import utc from 'dayjs/plugin/utc';
  dayjs.extend(relativeTime);
  dayjs.extend(isSameOrAfter)
  dayjs.extend(isTomorrow)
  dayjs.extend(utc)
  dayjs.extend(Timezone)

  function formatDate(d){
    let djs = dayjs.tz(d);
    if (dayjs().isSameOrAfter(djs, 'day')){
      return 'today';
    } else if (dayjs().add(1,'day').isSameOrAfter(djs, 'day')){

      return 'tomorrow';
    } else {
      return djs.toNow(true);
    }
  }


  export let data;
	
	// Holds table sort state.  Initialized to reflect table sorted by id column ascending.
	let sortBy = {col: "scheduled", ascending: false};
	
	$: sort = (column) => {

		if (sortBy.col == column) {
			sortBy.ascending = !sortBy.ascending
		} else {
			sortBy.col = column
			sortBy.ascending = true
		}
		
		// Modifier to sorting function for ascending or descending
		let sortModifier = (sortBy.ascending) ? 1 : -1;
		
		let sort = (a, b) => 
			(a[column] < b[column]) 
			? -1 * sortModifier 
			: (a[column] > b[column]) 
			? 1 * sortModifier 
			: 0;
		
		data = data.sort(sort);
	}

  onMount(()=>{
    sort('scheduled');
  });



</script>

<style>
.arrow-up {
  width: 0; 
  height: 0; 
  border-left: 10px solid transparent;
  border-right: 10px solid transparent;
  border-bottom: 10px solid black;
}

.arrow-down {
  width: 0; 
  height: 0; 
  border-left: 10px solid transparent;
  border-right: 10px solid transparent;
  border-top: 10px solid #000;
}

.hide {
  opacity: 0;
}

</style>

<table class="table table-sm table-striped">
  <thead>
    <tr>
      <th scope="col" class="text-left" on:click={sort("method")}>
        Method
        <span class:hide="{sortBy.col!=='method'}">{ sortBy.ascending ? '▲' : '▼' }</span>
      </th>
      <th scope="col" class="text-left" on:click={sort("place_bell")}>
        Bell
        <span class:hide="{sortBy.col!=='place_bell'}">{ sortBy.ascending ? '▲' : '▼' }</span>
      </th>
      <th scope="col" class="text-left" on:click={sort("scheduled")}>
        Next Review
        <span class:hide="{sortBy.col!=='scheduled'}">{ sortBy.ascending ? '▲' : '▼' }</span>
      </th>
      <th scope="col" class="text-left" on:click={sort("ease")}>
        Ease
        <span class:hide="{sortBy.col!=='ease'}">{ sortBy.ascending ? '▲' : '▼' }</span>
      </th>
    </tr>
  </thead>
  <tbody>
      {#each data as card}
        <tr>
          <td>{card.method}</td>
          <td>{bellName(card.place_bell)}</td>
          <td>{formatDate(card.scheduled)}</td>
          <td>{card.ease}</td>
        </tr>
      {/each}
  </tbody>
</table>
