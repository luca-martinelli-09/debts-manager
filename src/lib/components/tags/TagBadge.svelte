<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import type { Tag } from '$lib/supabase/tags';
	import { XIcon } from '@lucide/svelte';

	interface Props {
		tag: Tag;
		variant?: 'default' | 'secondary' | 'destructive' | 'outline';
		size?: 'sm' | 'lg';
		removable?: boolean;
		onRemove?: () => void;
	}

	let { tag, variant = 'secondary', size = 'sm', removable = false, onRemove }: Props = $props();
</script>

<Badge
	{variant}
	style="background-color: {tag.color}20; color: {tag.color}; border-color: {tag.color}40;"
>
	{tag.name}
	{#if removable && onRemove}
		<Button
			type="button"
			size="icon"
			variant="ghost"
			class="size-auto p-1"
			onclick={onRemove}
			aria-label="Remove tag"
		>
			<XIcon class="size-3" />
		</Button>
	{/if}
</Badge>
