<script lang="ts" generics="TData, TValue">
	import { Button } from '$lib/components/ui/button';
	import { createSvelteTable } from '$lib/components/ui/data-table/data-table.svelte.js';
	import FlexRender from '$lib/components/ui/data-table/flex-render.svelte';
	import * as TableRoot from '$lib/components/ui/table/index.js';
	import {
		getCoreRowModel,
		getFacetedRowModel,
		getFacetedUniqueValues,
		getFilteredRowModel,
		getPaginationRowModel,
		getSortedRowModel,
		type ColumnDef,
		type ColumnFiltersState,
		type GlobalFilterTableState,
		type PaginationState,
		type RowSelectionState,
		type SortingState,
		type Table,
		type VisibilityState
	} from '@tanstack/table-core';
	import type { Snippet } from 'svelte';

	type DataTableProps<TData, TValue> = {
		columns: ColumnDef<TData, TValue>[];
		data: TData[];
		filters?: Snippet<[Table<TData>]>;
		buttons?: Snippet;
	};

	let { data, columns, filters, buttons }: DataTableProps<TData, TValue> = $props();

	let rowSelection = $state<RowSelectionState>({});
	let columnVisibility = $state<VisibilityState>({});
	let columnFilters = $state<ColumnFiltersState>([]);
	let globalFilter = $state<GlobalFilterTableState>();
	let sorting = $state<SortingState>([]);
	let pagination = $state<PaginationState>({ pageIndex: 0, pageSize: 10 });

	const table = createSvelteTable({
		get data() {
			return data;
		},
		state: {
			get sorting() {
				return sorting;
			},
			get columnVisibility() {
				return columnVisibility;
			},
			get rowSelection() {
				return rowSelection;
			},
			get columnFilters() {
				return columnFilters;
			},
			get pagination() {
				return pagination;
			},
			get globalFilter() {
				return globalFilter;
			}
		},
		columns,
		enableRowSelection: true,
		onRowSelectionChange: (updater) => {
			if (typeof updater === 'function') {
				rowSelection = updater(rowSelection);
			} else {
				rowSelection = updater;
			}
		},
		onSortingChange: (updater) => {
			if (typeof updater === 'function') {
				sorting = updater(sorting);
			} else {
				sorting = updater;
			}
		},
		onColumnFiltersChange: (updater) => {
			if (typeof updater === 'function') {
				columnFilters = updater(columnFilters);
			} else {
				columnFilters = updater;
			}
		},
		onColumnVisibilityChange: (updater) => {
			if (typeof updater === 'function') {
				columnVisibility = updater(columnVisibility);
			} else {
				columnVisibility = updater;
			}
		},
		onPaginationChange: (updater) => {
			if (typeof updater === 'function') {
				pagination = updater(pagination);
			} else {
				pagination = updater;
			}
		},
		onGlobalFilterChange: (updater) => {
			if (typeof updater === 'function') {
				globalFilter = updater(globalFilter);
			} else {
				globalFilter = updater;
			}
		},
		getCoreRowModel: getCoreRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFacetedRowModel: getFacetedRowModel(),
		getFacetedUniqueValues: getFacetedUniqueValues()
	});
</script>

<div class="space-y-4">
	<div
		class="flex w-full flex-col-reverse items-end justify-between gap-3 md:flex-row md:items-center"
	>
		{#if filters}
			<div class="flex w-full flex-1 flex-row items-center gap-2">
				{@render filters?.(table)}
			</div>
		{/if}
		{#if buttons}
			<div class="flex flex-row items-center justify-end gap-2">
				{@render buttons?.()}
			</div>
		{/if}
	</div>
	<div class="rounded-md border">
		<TableRoot.Root>
			<TableRoot.Header>
				{#each table.getHeaderGroups() as headerGroup (headerGroup.id)}
					<TableRoot.Row>
						{#each headerGroup.headers as header (header.id)}
							<TableRoot.Head colspan={header.colSpan}>
								{#if !header.isPlaceholder}
									<FlexRender
										content={header.column.columnDef.header}
										context={header.getContext()}
									/>
								{/if}
							</TableRoot.Head>
						{/each}
					</TableRoot.Row>
				{/each}
			</TableRoot.Header>
			<TableRoot.Body>
				{#each table.getRowModel().rows as row (row.id)}
					<TableRoot.Row data-state={row.getIsSelected() && 'selected'}>
						{#each row.getVisibleCells() as cell (cell.id)}
							<TableRoot.Cell>
								<FlexRender content={cell.column.columnDef.cell} context={cell.getContext()} />
							</TableRoot.Cell>
						{/each}
					</TableRoot.Row>
				{:else}
					<TableRoot.Row>
						<TableRoot.Cell colspan={columns.length} class="h-24 text-center">
							Nessun elemento presente.
						</TableRoot.Cell>
					</TableRoot.Row>
				{/each}
			</TableRoot.Body>
		</TableRoot.Root>
	</div>
	<div class="flex items-center justify-end space-x-2 py-4">
		<Button
			variant="outline"
			size="sm"
			onclick={() => table.previousPage()}
			disabled={!table.getCanPreviousPage()}
		>
			Precedente
		</Button>
		<Button
			variant="outline"
			size="sm"
			onclick={() => table.nextPage()}
			disabled={!table.getCanNextPage()}
		>
			Successivo
		</Button>
	</div>
</div>
