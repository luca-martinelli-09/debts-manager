import { renderComponent } from '$lib/components/ui/data-table';
import { checkBoxCell } from '$lib/components/ui/data-table/columns';
import DataTableSortingHeader from '$lib/components/ui/data-table/data-table-sorting-header.svelte';
import type { Tag } from '$lib/supabase/tags';
import type { ColumnDef } from '@tanstack/table-core';
import TagBadge from '../TagBadge.svelte';

export const columns: ColumnDef<Tag>[] = [
	checkBoxCell(),
	{
		accessorKey: 'name',
		header: ({ column }) =>
			renderComponent(DataTableSortingHeader<Tag>, {
				title: 'Nome',
				column
			}),
		cell: ({ row }) => renderComponent(TagBadge, { tag: row.original })
	}
];
