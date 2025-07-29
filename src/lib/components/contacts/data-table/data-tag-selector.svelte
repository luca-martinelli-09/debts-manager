<script lang="ts" generics="TData, TValue">
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Command from '$lib/components/ui/command/index.js';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import Separator from '$lib/components/ui/separator/separator.svelte';
	import { globalStore } from '$lib/state.svelte';
	import type { Tag } from '$lib/supabase/tags';
	import { cn } from '$lib/utils.js';
	import { PlusIcon } from '@lucide/svelte';
	import CheckIcon from '@lucide/svelte/icons/check';
	import TagBadge from '$lib/components/tags/TagBadge.svelte';

	type $Props = {
		tags?: Tag[];
		onRemoveTag?: (tag: Tag) => void;
		onAddTag?: (tag: Tag) => void;
	};

	let { tags: contactTags = $bindable(), onRemoveTag, onAddTag }: $Props = $props();
</script>

<Popover.Root>
	<Popover.Trigger>
		{#snippet child({ props })}
			<Button {...props} variant="ghost" size="sm">
				{#if contactTags && contactTags.length > 0}
					<div class="hidden space-x-1 md:flex">
						{#each contactTags as tag (tag.id)}
							<TagBadge {tag} />
						{/each}
					</div>
					<Separator orientation="vertical" class="mx-1" />
				{/if}
				<PlusIcon />
			</Button>
		{/snippet}
	</Popover.Trigger>
	<Popover.Content class="p-0" align="start">
		<Command.Root>
			<Command.List>
				<Command.Empty>Nessun risultato trovato</Command.Empty>
				<Command.Group>
					{#each globalStore.tags as tag (tag.id)}
						{@const isSelected = (contactTags || []).some((ct) => ct.id === tag.id)}
						<Command.Item
							onSelect={() => {
								if (isSelected) {
									onRemoveTag?.(tag);
									contactTags = contactTags?.filter((ct) => ct.id !== tag.id) || [];
								} else {
									onAddTag?.(tag);
									contactTags = [...(contactTags || []), tag];
								}
							}}
						>
							<div
								class={cn(
									'mr-2 flex size-4 items-center justify-center rounded-sm border border-primary',
									isSelected ? 'bg-primary text-primary-foreground' : 'opacity-50 [&_svg]:invisible'
								)}
							>
								<CheckIcon class="size-4" />
							</div>

							<span>{tag.name}</span>
						</Command.Item>
					{/each}
				</Command.Group>
			</Command.List>
		</Command.Root>
	</Popover.Content>
</Popover.Root>
