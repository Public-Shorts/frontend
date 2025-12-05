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
<div class="absolute w-full h-20 bottom-0 left-0 flex justify-center items-center">
  <button class:text-accent-500={i > 6} class:font-bold={i > 6} onclick={progress}>
    Datenschutz
  </button>
</div>
{/if}
