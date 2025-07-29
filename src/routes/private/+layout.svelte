<script lang="ts">
	import AppSidebar from '$lib/components/sidebar/app-sidebar.svelte';
	import SiteHeader from '$lib/components/sidebar/site-header.svelte';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';

	import { goto } from '$app/navigation';
	import { globalStore } from '$lib/state.svelte.js';
	import Plus from '@tabler/icons-svelte/icons/plus';
	import { toast } from 'svelte-sonner';

	let { data, children } = $props();
	let { supabase } = $derived(data);

	const logout = async () => {
		const { error } = await supabase.auth.signOut();
		if (error) {
			console.error(error);
		}

		goto('/auth');
	};

	$effect(() => {
		if (data.contacts) {
			globalStore.contacts = data.contacts;
		}

		if (data.tags) {
			globalStore.tags = data.tags;
		}

		if (data.contactsError) {
			toast.error(data.contactsError.message);
		}

		if (data.tagsError) {
			toast.error(data.tagsError.message);
		}
	});
</script>

<Sidebar.Provider
	style="--sidebar-width: calc(var(--spacing) * 72); --header-height: calc(var(--spacing) * 12);"
>
	{#if data.user}
		<AppSidebar user={data.user} onlogout={logout} variant="inset">
			{#snippet mainButton()}
				<Sidebar.MenuButton
					class="min-w-8 bg-primary text-primary-foreground duration-200 ease-linear hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground"
					tooltipContent="Nuova transazione"
				>
					<Plus />
					<span>Nuova transazione</span>
				</Sidebar.MenuButton>
			{/snippet}
		</AppSidebar>
		<Sidebar.Inset>
			<SiteHeader />
			<div class="flex flex-1 flex-col">
				<div class="@container/main mx-auto flex w-full max-w-7xl flex-1 flex-col gap-2 px-5">
					<div class="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
						{@render children()}
					</div>
				</div>
			</div>
		</Sidebar.Inset>
	{/if}
</Sidebar.Provider>
