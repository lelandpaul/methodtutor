<script>
  import { onMount } from 'svelte';
  import { bellName } from './helpers.js';
  import { createEventDispatcher } from 'svelte';

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
  export let headers;
  export let remove = false;
	
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

  const dispatch = createEventDispatcher();

  function triggerDelete(method_name){
    if (confirm("This will delete all cards associated with this method. It cannot be undone. Are you sure you want to proceed?")){
      dispatch('delete_method', {
        method_name: method_name,
      });
    }
  };


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
      {#each Object.entries(headers) as [prop, header] (prop)}
      <th scope="col" class="text-left" on:click={sort(prop)}>
        {header}
        <span class:hide="{sortBy.col!==prop}">{ sortBy.ascending ? '▲' : '▼' }</span>
      </th>
      {/each}
      {#if remove}
        <th scope="col" class="text-left">
        </th>
      {/if}
    </tr>
  </thead>
  <tbody>
      {#each data as card}
        <tr>
          {#each Object.entries(headers) as [prop, header] (prop)}
            <td>
              {#if prop === 'scheduled'}
                {formatDate(card.scheduled)}
              {:else if prop ==='place_bell'}
                {bellName(card.place_bell)}
              {:else}
                {card[prop]}
              {/if}
            </td>
          {/each}
          {#if remove}
            <td class="text-right">
              <a class="delete" href="#" on:click={triggerDelete(card.method)}><i class="fas fa-minus-circle text-danger"></i></a>
            </td>
          {/if}
        </tr>
      {/each}
  </tbody>
</table>
