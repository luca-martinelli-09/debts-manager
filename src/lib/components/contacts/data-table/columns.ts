import { renderComponent } from '$lib/components/ui/data-table';
import { checkBoxCell } from '$lib/components/ui/data-table/columns';
import DataTableSortingHeader from '$lib/components/ui/data-table/data-table-sorting-header.svelte';
import { supabase } from '$lib/supabase/client';
import { ContactsService, type Contact } from '$lib/supabase/contacts';
import type { Tag } from '$lib/supabase/tags';
import type { ColumnDef } from '@tanstack/table-core';
import { toast } from 'svelte-sonner';
import DataTagSelector from './data-tag-selector.svelte';

export const columns: ColumnDef<Contact>[] = [
	checkBoxCell(),
	{
		accessorKey: 'first_name',
		header: ({ column }) =>
			renderComponent(DataTableSortingHeader<Contact>, {
				title: 'Nome',
				column
			})
	},
	{
		accessorKey: 'last_name',
		header: ({ column }) =>
			renderComponent(DataTableSortingHeader<Contact>, {
				title: 'Cognome',
				column
			})
	},
	{
		accessorKey: 'email',
		header: ({ column }) =>
			renderComponent(DataTableSortingHeader<Contact>, {
				title: 'Email',
				column
			})
	},
	{
		accessorKey: 'contact_tags',
		header: 'Tag',
		cell: ({ row }) =>
			renderComponent(DataTagSelector, {
				tags: row.original.contact_tags?.map((ct) => ct.tags),
				onRemoveTag: async (tag: Tag) => {
					const { error } = await new ContactsService(supabase).removeTagFromContact(
						row.original.id,
						tag.id
					);

					if (error) {
						toast.error(error.message);
						return;
					}

					toast.success('Tag rimosso con successo');
				},
				onAddTag: async (tag: Tag) => {
					const { error } = await new ContactsService(supabase).addTagToContact(
						row.original.id,
						tag.id
					);

					if (error) {
						toast.error(error.message);
						return;
					}

					toast.success('Tag aggiunto con successo');
				}
			}),
		filterFn: (row, _, filterValue) => {
			if (typeof filterValue === 'string') {
				return row.original.contact_tags?.some((ct) => ct.tags.name === filterValue) || false;
			} else if (Array.isArray(filterValue)) {
				return row.original.contact_tags?.some((ct) => filterValue.includes(ct.tags.name)) || false;
			}

			return false;
		}
	}
];
