import type { Database, Tables, TablesInsert, TablesUpdate } from '$lib/database.types';
import type { SupabaseClient } from '@supabase/supabase-js';

export type Contact = Tables<'contacts'> & {
	contact_tags?: Array<{
		tags: Tables<'tags'>;
	}>;
};

export type ContactInsert = TablesInsert<'contacts'>;
export type ContactUpdate = TablesUpdate<'contacts'>;

export interface ContactFilters {
	search?: string;
	tags?: string[];
}

export class ContactsService {
	constructor(private supabase: SupabaseClient<Database>) {}

	async getContacts() {
		const { data, error } = await this.supabase
			.from('contacts')
			.select(
				`
				*,
				contact_tags (
					tags (*)
				)
			`
			)
			.order('first_name', { ascending: true })
			.order('last_name', { ascending: true });

		if (error) {
			console.error('Error fetching contacts:', error);
			return { data: null, error };
		}
		return { data: data, error: null };
	}

	async getContact(id: string) {
		const { data, error } = await this.supabase
			.from('contacts')
			.select(
				`
				*,
				contact_tags (
					tags (*)
				)
			`
			)
			.eq('id', id)
			.single();

		if (error) {
			console.error('Error fetching contact:', error);
		}

		return { data, error };
	}

	async createContact(contactData: Omit<ContactInsert, 'user_id'>) {
		const {
			data: { user }
		} = await this.supabase.auth.getUser();

		if (!user) {
			return { data: null, error: { message: 'User not authenticated' } };
		}

		const { data, error } = await this.supabase
			.from('contacts')
			.insert({
				...contactData,
				user_id: user.id
			})
			.select()
			.single();

		if (error) {
			console.error('Error creating contact:', error);
		}

		return { data, error };
	}

	async updateContact(id: string, updates: ContactUpdate) {
		const { data, error } = await this.supabase
			.from('contacts')
			.update(updates)
			.eq('id', id)
			.select()
			.single();

		if (error) {
			console.error('Error updating contact:', error);
		}

		return { data, error };
	}

	async deleteContact(id: string) {
		const { data: transactions } = await this.supabase
			.from('transactions')
			.select('id')
			.eq('contact_id', id)
			.limit(1);

		if (transactions && transactions.length > 0) {
			return {
				data: null,
				error: { message: 'Cannot delete contact with existing transactions' }
			};
		}

		const { error } = await this.supabase.from('contacts').delete().eq('id', id);

		if (error) {
			console.error('Error deleting contact:', error);
		}

		return { data: null, error };
	}

	async getContactBalance(contactId: string) {
		const { data, error } = await this.supabase
			.from('transactions')
			.select('amount')
			.eq('contact_id', contactId);

		if (error) {
			console.error('Error fetching contact balance:', error);
			return { balance: 0, error };
		}

		const balance = data.reduce((sum, transaction) => sum + Number(transaction.amount), 0);
		return { balance, error: null };
	}

	async removeTagFromContact(contactId: string, tagId: string) {
		const { error } = await this.supabase
			.from('contact_tags')
			.delete()
			.eq('contact_id', contactId)
			.eq('tag_id', tagId);

		if (error) {
			console.error('Error removing tag from contact:', error);
			return { error };
		}

		return { error: null };
	}

	async addTagToContact(contactId: string, tagId: string) {
		const { error } = await this.supabase
			.from('contact_tags')
			.insert({ contact_id: contactId, tag_id: tagId });

		if (error) {
			console.error('Error adding tag to contact:', error);
			return { error };
		}

		return { error: null };
	}
}
