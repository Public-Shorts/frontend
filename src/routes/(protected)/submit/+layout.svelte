<script lang="ts">
  import '../../../app.css';

  let { children } = $props()

  let i = $state(0)

  const progress = () => i++

  let unlocked = $derived(i > 7)
</script>

{#if unlocked}
  {@render children()}
{:else}
<div class="relative">
  <button class="" onclick={progress}>
    Datenschutz
  </button>
</div>
{/if}
