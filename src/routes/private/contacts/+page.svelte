<script lang="ts">
	import { columns as contactColumns } from '$lib/components/contacts/data-table/columns';
	import DataTableActions from '$lib/components/ui/data-table/data-table-actions.svelte';
	import * as AlertDialog from '$lib/components/ui/alert-dialog/index.js';
	import Button from '$lib/components/ui/button/button.svelte';
	import DataTableFacetedFilter from '$lib/components/ui/data-table/data-table-faceted-filter.svelte';
	import DataTable from '$lib/components/ui/data-table/data-table.svelte';
	import { renderComponent } from '$lib/components/ui/data-table/render-helpers.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import * as Form from '$lib/components/ui/form/index.js';
	import { Input } from '$lib/components/ui/input/';
	import { Textarea } from '$lib/components/ui/textarea/index.js';
	import { globalStore } from '$lib/state.svelte.js';
	import { ContactsService, type Contact } from '$lib/supabase/contacts.js';
	import { LoaderCircle, PlusIcon } from '@lucide/svelte';
	import type { ColumnDef } from '@tanstack/table-core';
	import { toast } from 'svelte-sonner';
	import { defaults, superForm } from 'sveltekit-superforms';
	import { zod4 } from 'sveltekit-superforms/adapters';
	import { z } from 'zod/v4';

	let { data } = $props();
	let { supabase } = $derived(data);

	const deleteForm: {
		open: boolean;
		loading: boolean;
		id: string | null;
	} = $state({
		open: false,
		loading: false,
		id: null
	});

	const editCreateForm: {
		open: boolean;
		loading: boolean;
		id: string | null;
	} = $state({
		loading: false,
		open: false,
		id: null
	});

	const columns: ColumnDef<Contact>[] = [
		...contactColumns,
		{
			id: 'actions',
			cell: ({ row }) => {
				return renderComponent(DataTableActions, {
					onEdit: () => {
						const { id, contact_tags, created_at, updated_at, user_id, ...rest } = row.original;

						editCreateForm.id = id;
						formData.set(rest);

						editCreateForm.open = true;
					},
					onDelete: () => ((deleteForm.id = row.original.id), (deleteForm.open = true))
				});
			}
		}
	];

	const deleteContact = async (id: string | null) => {
		if (!id) return;

		deleteForm.loading = true;

		const { error } = await new ContactsService(supabase).deleteContact(id);

		if (error) {
			toast.error(error.message);
		} else {
			toast.success('Contatto rimosso con successo');
		}

		globalStore.contacts = globalStore.contacts.filter((contact) => contact.id !== id);

		deleteForm.id = null;
		deleteForm.loading = false;
		deleteForm.open = false;
	};

	const formSchema = z.object({
		first_name: z.string().min(2),
		last_name: z.string().min(2),
		email: z.email().nullable(),
		phone: z.string().nullable(),
		notes: z.string().nullable()
	});

	const form = superForm(defaults(zod4(formSchema)), {
		validators: zod4(formSchema),
		SPA: true,
		onUpdate: async ({ form: f }) => {
			editCreateForm.loading = true;

			if (!f.valid) {
				toast.error('Attenzione, ci sono degli errori');
				editCreateForm.loading = false;

				return;
			}

			const contactService = new ContactsService(supabase);

			const { data, error } =
				editCreateForm.id !== null
					? await contactService.updateContact(editCreateForm.id, f.data)
					: await contactService.createContact(f.data);

			if (error || !data) {
				toast.error(error?.message || 'Si è verificato un errore');
				editCreateForm.open = false;
				editCreateForm.loading = false;
				editCreateForm.id = null;

				return;
			}

			if (editCreateForm.id !== null) {
				const index = globalStore.contacts.findIndex((contact) => contact.id === editCreateForm.id);
				globalStore.contacts[index] = data;
			} else {
				globalStore.contacts = [data, ...globalStore.contacts];
			}

			toast.success(
				`Contatto ${editCreateForm.id !== null ? 'modificato' : 'creato'} con successo`
			);

			editCreateForm.open = false;
			editCreateForm.loading = false;
			editCreateForm.id = null;
		}
	});

	const { form: formData, enhance } = form;
</script>

<h1 class="font-serif text-5xl">Contatti</h1>

<div>
	<DataTable data={globalStore.contacts} {columns}>
		{#snippet filters(table)}
			{@const tagsColumn = table.getColumn('contact_tags')}

			<Input
				placeholder="Cerca..."
				value={table.getState().globalFilter ?? ''}
				onchange={(e) => {
					table.setGlobalFilter(e.currentTarget.value);
				}}
				oninput={(e) => {
					table.setGlobalFilter(e.currentTarget.value);
				}}
				class="max-w-md"
			/>
			{#if tagsColumn}
				<DataTableFacetedFilter
					column={tagsColumn}
					title="Tag"
					options={globalStore.tags.map((tag) => ({ label: tag.name, value: tag.name }))}
				/>
			{/if}
		{/snippet}
		{#snippet buttons()}
			<Button
				onclick={() => {
					((editCreateForm.open = true), (editCreateForm.id = null));
				}}
			>
				<PlusIcon />
				Nuovo
			</Button>
		{/snippet}
	</DataTable>
</div>

<Dialog.Root bind:open={editCreateForm.open}>
	<Dialog.Content class="sm:max-w-xl">
		<Dialog.Header>
			<Dialog.Title>
				{editCreateForm.id !== '' ? 'Modifica contatto' : 'Crea contatto'}
			</Dialog.Title>
			<Dialog.Description>Inserisci le informazioni richieste</Dialog.Description>
		</Dialog.Header>
		<form method="POST" class="space-y-6" use:enhance>
			<Form.Field {form} name="first_name">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Nome</Form.Label>
						<Input {...props} bind:value={$formData.first_name} />
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
			<Form.Field {form} name="last_name">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Cognome</Form.Label>
						<Input {...props} bind:value={$formData.last_name} />
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
			<Form.Field {form} name="email">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Email</Form.Label>
						<Input {...props} bind:value={$formData.email} />
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
			<Form.Field {form} name="phone">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Telefono</Form.Label>
						<Input {...props} bind:value={$formData.phone} />
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
			<Form.Field {form} name="notes">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Note</Form.Label>
						<Textarea {...props} bind:value={$formData.notes} />
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
			<Dialog.Footer>
				<Form.Button type="submit">
					{#if editCreateForm.loading}
						<LoaderCircle class="animate-spin" />
					{:else}
						Salva
					{/if}
				</Form.Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>

<AlertDialog.Root bind:open={deleteForm.open}>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>Sicuro di voler eliminare il contatto?</AlertDialog.Title>
			<AlertDialog.Description>
				Verranno eliminate anche tutte le transazioni associate.
			</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel>Annulla</AlertDialog.Cancel>
			<AlertDialog.Action onclick={() => deleteContact(deleteForm.id)}>
				{#if deleteForm.loading}
					<LoaderCircle class="animate-spin" />
				{:else}
					Elimina
				{/if}
			</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
