<script lang="ts" generics="TData,TValue=unknown">
	import { Button } from '$lib/components/ui/button/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import ArrowDownIcon from '@lucide/svelte/icons/arrow-down';
	import ArrowUpIcon from '@lucide/svelte/icons/arrow-up';
	import ChevronsUpDownIcon from '@lucide/svelte/icons/chevrons-up-down';
	import type { Column } from '@tanstack/table-core';
	import type { HTMLAttributes } from 'svelte/elements';

	type $Props<TData, TValue> = HTMLAttributes<HTMLElement> & {
		title: string;
		column: Column<TData, TValue>;
	};

	let { title, column, class: className, ...restProps }: $Props<TData, TValue> = $props();
</script>

{#if !column?.getCanSort()}
	<div class={className} {...restProps}>
		{title}
	</div>
{:else}
	<DropdownMenu.Root>
		<DropdownMenu.Trigger>
			{#snippet child({ props })}
				<Button {...props} variant="ghost" size="sm" class="-ml-3 h-8 data-[state=open]:bg-accent">
					<span>
						{title}
					</span>
					{#if column.getIsSorted() === 'desc'}
						<ArrowDownIcon />
					{:else if column.getIsSorted() === 'asc'}
						<ArrowUpIcon />
					{:else}
						<ChevronsUpDownIcon />
					{/if}
				</Button>
			{/snippet}
		</DropdownMenu.Trigger>
		<DropdownMenu.Content align="start">
			<DropdownMenu.Item onclick={() => column.toggleSorting(false)}>
				<ArrowUpIcon class="mr-2 size-3.5 text-muted-foreground/70" />
				Asc
			</DropdownMenu.Item>
			<DropdownMenu.Item onclick={() => column.toggleSorting(true)}>
				<ArrowDownIcon class="mr-2 size-3.5 text-muted-foreground/70" />
				Desc
			</DropdownMenu.Item>
		</DropdownMenu.Content>
	</DropdownMenu.Root>
{/if}
