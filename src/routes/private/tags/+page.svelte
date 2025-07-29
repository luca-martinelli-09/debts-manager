<script lang="ts">
	import { columns as tagsColumns } from '$lib/components/tags/data-table/columns';
	import * as AlertDialog from '$lib/components/ui/alert-dialog/index.js';
	import Button from '$lib/components/ui/button/button.svelte';
	import DataTableActions from '$lib/components/ui/data-table/data-table-actions.svelte';
	import DataTable from '$lib/components/ui/data-table/data-table.svelte';
	import { renderComponent } from '$lib/components/ui/data-table/render-helpers.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import * as Form from '$lib/components/ui/form/index.js';
	import { Input } from '$lib/components/ui/input/';
	import { globalStore } from '$lib/state.svelte.js';
	import { TagsService, type Tag } from '$lib/supabase/tags.js';
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

	const columns: ColumnDef<Tag>[] = [
		...tagsColumns,
		{
			id: 'actions',
			cell: ({ row }) => {
				return renderComponent(DataTableActions, {
					onEdit: () => {
						const { id, created_at, user_id, ...rest } = row.original;

						editCreateForm.id = id;
						formData.set(rest);

						editCreateForm.open = true;
					},
					onDelete: () => ((deleteForm.id = row.original.id), (deleteForm.open = true))
				});
			}
		}
	];

	const deleteTag = async (id: string | null) => {
		if (!id) return;

		deleteForm.loading = true;

		const { error } = await new TagsService(supabase).deleteTag(id);

		if (error) {
			toast.error(error.message);
		} else {
			toast.success('Tag rimosso con successo');
		}

		globalStore.tags = globalStore.tags.filter((tag) => tag.id !== id);

		deleteForm.id = null;
		deleteForm.loading = false;
		deleteForm.open = false;
	};

	const formSchema = z.object({
		name: z.string().min(2),
		color: z
			.string()
			.regex(/^#[0-9a-fA-F]{6}$/, {
				message: 'Invalid color format. Must be a 7-character hex code (e.g., #RRGGBB).'
			})
			.nullable()
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

			const tagService = new TagsService(supabase);

			const { data, error } =
				editCreateForm.id !== null
					? await tagService.updateTag(editCreateForm.id, f.data)
					: await tagService.createTag(f.data);

			if (error || !data) {
				toast.error(error?.message || 'Si è verificato un errore');
				editCreateForm.open = false;
				editCreateForm.loading = false;
				editCreateForm.id = null;

				return;
			}

			if (editCreateForm.id !== null) {
				const index = globalStore.tags.findIndex((tag) => tag.id === editCreateForm.id);
				globalStore.tags[index] = data;
			} else {
				globalStore.tags = [data, ...globalStore.tags];
			}

			toast.success(`Tag ${editCreateForm.id !== null ? 'modificato' : 'creato'} con successo`);

			editCreateForm.open = false;
			editCreateForm.loading = false;
			editCreateForm.id = null;
		}
	});

	const { form: formData, enhance } = form;
</script>

<h1 class="font-serif text-5xl">Tag</h1>

<div>
	<DataTable data={globalStore.tags} {columns}>
		{#snippet filters(table)}
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
			<Form.Field {form} name="name">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Nome</Form.Label>
						<Input {...props} bind:value={$formData.name} />
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
			<Form.Field {form} name="color">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Colore</Form.Label>
						<Input type="color" {...props} bind:value={$formData.color} />
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
			<AlertDialog.Title>Sicuro di voler eliminare il tag?</AlertDialog.Title>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel>Annulla</AlertDialog.Cancel>
			<AlertDialog.Action onclick={() => deleteTag(deleteForm.id)}>
				{#if deleteForm.loading}
					<LoaderCircle class="animate-spin" />
				{:else}
					Elimina
				{/if}
			</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
