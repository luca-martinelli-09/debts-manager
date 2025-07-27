# Analisi Funzionale e Tecnica - App Gestione Spese e Contatti

## 1. ANALISI FUNZIONALE

### 1.1 Panoramica del Sistema
L'applicazione è un sistema di gestione spese personali che permette di tracciare debiti e crediti con i propri contatti, organizzandoli tramite tag e offrendo diverse modalità di suddivisione delle spese.

### 1.2 Attori del Sistema
- **Utente Principale**: Proprietario dell'account che gestisce contatti e spese
- **Contatti**: Persone fisiche che possono essere o meno registrate sulla piattaforma

### 1.3 Funzionalità Dettagliate

#### 1.3.1 Autenticazione e Sicurezza
**RF001 - Login/Registrazione**
- Registrazione con email e password
- Login con credenziali
- Recupero password tramite email
- Sessione persistente con logout manuale

**RF002 - Gestione Profilo**
- Modifica dati personali
- Cambio password
- Eliminazione account (con conferma)

#### 1.3.2 Gestione Contatti
**RF003 - CRUD Contatti**
- **Creazione**: Aggiunta nuovo contatto con nome, cognome, email (opzionale), telefono (opzionale), note
- **Visualizzazione**: Lista paginata con ricerca per nome/cognome
- **Modifica**: Aggiornamento dati contatto
- **Eliminazione**: Rimozione contatto (solo se non ha transazioni attive)

#### 1.3.3 Sistema di Tag
**RF004 - Gestione Tag**
- Creazione tag personalizzati (es. "Famiglia", "Lavoro", "Amici", "Palestra")
- Colori personalizzabili per ogni tag
- Modifica/eliminazione tag (con controllo dipendenze)

**RF005 - Associazione Tag-Contatti**
- Assegnazione multipla di tag per contatto
- Visualizzazione tag in lista contatti
- Filtri per tag nella selezione contatti

#### 1.3.4 Gestione Spese
**RF006 - Creazione Spesa**
- **Dati Obbligatori**: Descrizione, importo totale, data
- **Dati Opzionali**: Categoria, note, foto scontrino
- **Selezione Beneficiari**: Multi-selezione contatti con filtri per tag
- **Modalità di Suddivisione**:
  - *Parti Uguali*: Importo diviso equamente tra tutti i beneficiari
  - *Percentuali Custom*: Assegnazione percentuale per ogni beneficiario (totale 100%)
  - *Importi Custom*: Assegnazione importo specifico per beneficiario (somma = totale)
- **Validazioni**: Controllo coerenza importi/percentuali

**RF007 - Tipologie di Transazione**
- **Spesa Anticipata** (+): L'utente anticipa denaro per altri
- **Rimborso Ricevuto** (-): L'utente riceve un rimborso
- **Pagamento Debito** (-): L'utente salda un debito precedente

**RF008 - Gestione Lista Spese**
- Visualizzazione cronologica delle spese
- Filtri per: data, contatti, importo, categoria
- Ricerca testuale nella descrizione
- Modifica/eliminazione spese (con ricalcolo automatico saldi)

#### 1.3.5 Calcolo Saldi e Reportistca
**RF009 - Saldi per Contatto**
- **Saldo Positivo**: Il contatto deve denaro all'utente
- **Saldo Negativo**: L'utente deve denaro al contatto
- **Saldo Zero**: Situazione in pari
- Storico transazioni per ogni contatto

**RF010 - Dashboard Riepilogativa**
- Totale crediti verso tutti i contatti
- Totale debiti verso tutti i contatti
- Saldo netto complessivo
- Lista contatti con maggiori debiti/crediti
- Grafici statistiche mensili/annuali

**RF011 - Notifiche e Promemoria**
- Notifiche di saldo per contatti registrati
- Promemoria per solleciti di pagamento
- Storico comunicazioni inviate

### 1.4 Requisiti Non Funzionali
- **Usabilità**: Interfaccia intuitiva e responsive
- **Performance**: Caricamento pagine < 2 secondi
- **Sicurezza**: Crittografia dati sensibili, validazione input
- **Backup**: Esportazione dati in formato JSON/CSV

---

## 2. ANALISI TECNICA

### 2.1 Architettura del Sistema

#### 2.1.1 Stack Tecnologico
- **Frontend**: SvelteKit + Svelte 5
- **Backend**: Supabase (Database + Auth + Storage + Edge Functions)
- **Database**: PostgreSQL (Supabase)
- **Autenticazione**: Supabase Auth
- **Styling**: Tailwind CSS v4
- **Componenti UI**: Bits-UI
- **Client Database**: Supabase JavaScript Client

#### 2.1.2 Struttura del Progetto
```
src/
├── lib/
│   ├── components/          # Componenti riusabili
│   │   ├── ui/             # Wrapper Bits-UI
│   │   ├── forms/          # Form componenti
│   │   └── layout/         # Layout componenti
│   ├── supabase/           # Configurazione Supabase
│   │   ├── database.ts     # Client e queries
│   │   ├── auth.ts         # Gestione autenticazione
│   │   ├── types.ts        # Tipi database generati
│   │   └── storage.ts      # File storage
│   ├── stores/             # Svelte stores
│   ├── utils/              # Utilities e helpers
│   └── types/              # TypeScript definitions
├── routes/
│   ├── (auth)/            # Route autenticazione
│   ├── (app)/             # Route app principale
│   │   ├── dashboard/
│   │   ├── contacts/
│   │   ├── expenses/
│   │   └── settings/
│   └── api/               # API endpoints (Edge Functions mirror)
├── supabase/
│   ├── migrations/         # Database migrations
│   ├── functions/          # Edge Functions
│   └── config.toml         # Configurazione progetto
└── app.html
```

### 2.2 Modello Dati

#### 2.2.1 Schema Database (Supabase SQL)

```sql
-- Estensione per UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Utenti (gestiti da Supabase Auth)
-- La tabella auth.users è già presente, creiamo solo il profilo
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  first_name VARCHAR,
  last_name VARCHAR,
  avatar_url VARCHAR,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Contatti
CREATE TABLE public.contacts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  first_name VARCHAR NOT NULL,
  last_name VARCHAR NOT NULL,
  email VARCHAR,
  phone VARCHAR,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS per contatti
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own contacts" ON public.contacts
  FOR ALL USING (auth.uid() = user_id);

-- Tag
CREATE TABLE public.tags (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  name VARCHAR NOT NULL,
  color VARCHAR DEFAULT '#3B82F6',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS per tag
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own tags" ON public.tags
  FOR ALL USING (auth.uid() = user_id);

-- Relazione Contatti-Tag
CREATE TABLE public.contact_tags (
  contact_id UUID REFERENCES public.contacts(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES public.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (contact_id, tag_id)
);

-- RLS per contact_tags (controllo tramite contatto)
ALTER TABLE public.contact_tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own contact tags" ON public.contact_tags
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.contacts 
      WHERE contacts.id = contact_tags.contact_id 
      AND contacts.user_id = auth.uid()
    )
  );

-- Spese
CREATE TABLE public.expenses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  description VARCHAR NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  expense_date DATE NOT NULL,
  category VARCHAR,
  notes TEXT,
  receipt_url VARCHAR,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS per spese
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own expenses" ON public.expenses
  FOR ALL USING (auth.uid() = user_id);

-- Partecipazioni alle spese
CREATE TABLE public.expense_participants (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  expense_id UUID REFERENCES public.expenses(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES public.contacts(id),
  amount DECIMAL(10,2) NOT NULL,
  percentage DECIMAL(5,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS per partecipazioni (controllo tramite spesa)
ALTER TABLE public.expense_participants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own expense participants" ON public.expense_participants
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.expenses 
      WHERE expenses.id = expense_participants.expense_id 
      AND expenses.user_id = auth.uid()
    )
  );

-- Transazioni (per tracking completo)
CREATE TYPE transaction_type AS ENUM ('expense', 'payment', 'refund');

CREATE TABLE public.transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  contact_id UUID REFERENCES public.contacts(id),
  expense_id UUID REFERENCES public.expenses(id),
  amount DECIMAL(10,2) NOT NULL, -- Positivo = credito, Negativo = debito
  transaction_type transaction_type NOT NULL,
  description VARCHAR,
  transaction_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS per transazioni
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own transactions" ON public.transactions
  FOR ALL USING (auth.uid() = user_id);

-- Indici per performance
CREATE INDEX idx_contacts_user_id ON public.contacts(user_id);
CREATE INDEX idx_tags_user_id ON public.tags(user_id);
CREATE INDEX idx_expenses_user_id ON public.expenses(user_id);
CREATE INDEX idx_expenses_date ON public.expenses(expense_date);
CREATE INDEX idx_transactions_user_contact ON public.transactions(user_id, contact_id);
CREATE INDEX idx_transactions_date ON public.transactions(transaction_date);

-- Trigger per updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_contacts_updated_at BEFORE UPDATE ON public.contacts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON public.expenses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

#### 2.1.3 Vantaggi dell'Architettura Supabase

**Backend-as-a-Service completo:**
- Database PostgreSQL gestito con backup automatici
- Autenticazione pronta all'uso con provider multipli
- Storage per file con CDN integrato
- Real-time subscriptions per aggiornamenti live
- Edge Functions per logica server-side custom

**Sviluppo accelerato:**
- Riduzione drastica del boilerplate per auth e database
- Auto-generazione tipi TypeScript dal schema database
- Dashboard web per gestione dati e monitoraggio
- CLI per migrations e deployment automatizzato

**Sicurezza integrata:**
- Row Level Security nativo per multi-tenancy
- JWT handling automatico
- HTTPS e sicurezza a livello infrastrutturale
- Audit logging e monitoring integrati

#### 2.3.1 Configurazione Client

```typescript
// lib/supabase/database.ts
import { createClient } from '@supabase/supabase-js'
import type { Database } from './types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient<Database>(supabaseUrl, supabaseKey)

// Helper per gestione sessione
export const getSession = () => supabase.auth.getSession()
export const getUser = () => supabase.auth.getUser()
```

#### 2.3.2 Autenticazione Supabase

```typescript
// lib/supabase/auth.ts
import { supabase } from './database'

export const authService = {
  // Registrazione
  async signUp(email: string, password: string, userData?: any) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    })
    return { data, error }
  },

  // Login
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { data, error }
  },

  // Logout
  async signOut() {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  // Reset password
  async resetPassword(email: string) {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email)
    return { data, error }
  }
}
```

#### 2.3.3 Database Queries

```typescript
// lib/supabase/queries/contacts.ts
import { supabase } from '../database'

export const contactsService = {
  // Recupera tutti i contatti con tag
  async getContacts(filters?: ContactFilters) {
    let query = supabase
      .from('contacts')
      .select(`
        *,
        contact_tags (
          tags (*)
        )
      `)
      .order('created_at', { ascending: false })

    if (filters?.search) {
      query = query.or(`first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%`)
    }

    return await query
  },

  // Crea nuovo contatto
  async createContact(contactData: Omit<Contact, 'id' | 'created_at' | 'updated_at'>) {
    return await supabase
      .from('contacts')
      .insert(contactData)
      .select()
      .single()
  },

  // Calcola saldo per contatto
  async getContactBalance(contactId: string) {
    const { data, error } = await supabase
      .from('transactions')
      .select('amount')
      .eq('contact_id', contactId)

    if (error) return { balance: 0, error }

    const balance = data.reduce((sum, transaction) => sum + Number(transaction.amount), 0)
    return { balance, error: null }
  }
}
```

#### 2.3.4 Real-time Subscriptions

```typescript
// lib/supabase/realtime.ts
import { supabase } from './database'

export const subscribeToContacts = (userId: string, callback: (payload: any) => void) => {
  return supabase
    .channel('contacts-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'contacts',
        filter: `user_id=eq.${userId}`
      },
      callback
    )
    .subscribe()
}

export const subscribeToExpenses = (userId: string, callback: (payload: any) => void) => {
  return supabase
    .channel('expenses-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'expenses',
        filter: `user_id=eq.${userId}`
      },
      callback
    )
    .subscribe()
}
```

### 2.4 Stato Management

#### 2.4.1 Svelte Stores con Supabase

```typescript
// stores/auth.ts
import { writable, derived } from 'svelte/stores'
import { supabase } from '$lib/supabase/database'
import type { User, Session } from '@supabase/supabase-js'

export const session = writable<Session | null>(null)
export const user = derived(session, $session => $session?.user ?? null)
export const isAuthenticated = derived(user, $user => !!$user)

// Inizializza store auth
export const initAuth = () => {
  supabase.auth.getSession().then(({ data: { session } }) => {
    session.set(session)
  })

  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, _session) => {
    session.set(_session)
  })

  return () => subscription.unsubscribe()
}

// stores/contacts.ts
import { writable, derived } from 'svelte/stores'
import { contactsService } from '$lib/supabase/queries/contacts'
import type { Contact } from '$lib/types'

export const contacts = writable<Contact[]>([])
export const selectedContacts = writable<Set<string>>(new Set())
export const contactFilters = writable<ContactFilters>({})

// Store derivato per contatti filtrati
export const filteredContacts = derived(
  [contacts, contactFilters],
  ([$contacts, $filters]) => {
    let filtered = $contacts

    if ($filters.search) {
      const search = $filters.search.toLowerCase()
      filtered = filtered.filter(contact => 
        contact.first_name.toLowerCase().includes(search) ||
        contact.last_name.toLowerCase().includes(search)
      )
    }

    if ($filters.tags?.length) {
      filtered = filtered.filter(contact =>
        contact.contact_tags?.some(ct => 
          $filters.tags?.includes(ct.tags.id)
        )
      )
    }

    return filtered
  }
)

// Azioni per contatti
export const contactActions = {
  async loadContacts() {
    const { data, error } = await contactsService.getContacts()
    if (data) contacts.set(data)
    return { data, error }
  },

  async createContact(contactData: CreateContactData) {
    const { data, error } = await contactsService.createContact(contactData)
    if (data) {
      contacts.update(list => [...list, data])
    }
    return { data, error }
  }
}

// stores/expenses.ts
import { writable, derived, get } from 'svelte/stores'
import { expensesService } from '$lib/supabase/queries/expenses'
import type { Expense, ExpenseForm } from '$lib/types'

export const expenses = writable<Expense[]>([])
export const expenseForm = writable<ExpenseForm>({
  description: '',
  total_amount: 0,
  expense_date: new Date().toISOString().split('T')[0],
  participants: [],
  split_type: 'equal'
})

// Calcoli derivati per form spese
export const expenseCalculations = derived(
  expenseForm,
  $form => {
    const { total_amount, participants, split_type } = $form
    
    let calculations = {
      totalAssigned: 0,
      isValid: false,
      participantAmounts: new Map<string, number>()
    }

    if (split_type === 'equal' && participants.length > 0) {
      const amountPerPerson = total_amount / participants.length
      participants.forEach(p => {
        calculations.participantAmounts.set(p.contact_id, amountPerPerson)
      })
      calculations.totalAssigned = total_amount
      calculations.isValid = true
    }
    
    // Altri calcoli per percentuali e importi custom...
    
    return calculations
  }
)

// stores/ui.ts
import { writable } from 'svelte/stores'

export const loading = writable<boolean>(false)
export const notifications = writable<Notification[]>([])
export const sidebarOpen = writable<boolean>(false)

export const addNotification = (notification: Omit<Notification, 'id'>) => {
  const id = crypto.randomUUID()
  notifications.update(list => [...list, { ...notification, id }])
  
  // Auto-remove dopo 5 secondi
  setTimeout(() => {
    notifications.update(list => list.filter(n => n.id !== id))
  }, 5000)
}
```

### 2.5 Componenti Chiave

#### 2.5.1 Struttura Componenti UI

**Layout**
- `AppShell.svelte` - Shell principale
- `Sidebar.svelte` - Navigazione laterale
- `Header.svelte` - Header con user menu

**Forms**
- `ContactForm.svelte` - Form gestione contatti
- `ExpenseForm.svelte` - Form creazione spese
- `ExpenseSplitSelector.svelte` - Selezione modalità split

**Lists & Tables**
- `ContactList.svelte` - Lista contatti con filtri
- `ExpenseList.svelte` - Lista spese
- `BalanceTable.svelte` - Tabella saldi per contatto

**UI Components**
- `TagBadge.svelte` - Badge per tag
- `AmountDisplay.svelte` - Visualizzazione importi
- `ContactSelector.svelte` - Multi-select contatti

### 2.6 Sicurezza e Performance

#### 2.6.1 Misure di Sicurezza con Supabase
- **Row Level Security (RLS)**: Implementato nativamente su tutte le tabelle
- **Autenticazione JWT**: Gestita automaticamente da Supabase Auth
- **Validazione input**: Client-side con Zod + server-side con RLS
- **Rate limiting**: Configurabile tramite Supabase dashboard
- **HTTPS**: Forzato di default su Supabase
- **Backup automatici**: Gestiti da Supabase
- **Audit logs**: Disponibili per tracking accessi

#### 2.6.2 Ottimizzazioni Performance con Supabase
- **Edge Functions**: Per logica di business complessa
- **Real-time subscriptions**: Solo quando necessario per evitare overhead
- **Caching intelligente**: Con stale-while-revalidate pattern
- **Lazy loading**: Route-based code splitting
- **Database indexes**: Su campi frequentemente utilizzati per query
- **Connection pooling**: Gestito automaticamente da Supabase
- **CDN**: Supabase Storage per file statici (receipt images)

### 2.7 Deployment e DevOps

#### 2.7.1 Ambiente di Sviluppo
- Docker per database locale
- Hot reloading con Vite
- TypeScript strict mode
- ESLint + Prettier
- Testing con Vitest + Playwright

#### 2.7.2 Deployment con Supabase
- **Frontend**: Vercel o Netlify per SvelteKit app
- **Backend**: Supabase (Database + Auth + Storage + Edge Functions)
- **Database**: PostgreSQL su Supabase
- **File Storage**: Supabase Storage per receipt images
- **Edge Functions**: Per business logic complessa server-side
- **Monitoring**: Supabase Dashboard + Sentry per frontend errors
- **Environment**: Supabase CLI per gestione environment multipli

### 2.8 Roadmap Sviluppo

#### Fase 1 (MVP - 4-6 settimane)
- Autenticazione base
- CRUD contatti e tag
- Creazione spese semplici
- Calcolo saldi base

#### Fase 2 (Feature Complete - 2-3 settimane)
- Modalità split avanzate
- Dashboard con statistiche
- Filtri e ricerca avanzata
- UI/UX refinements

#### Fase 3 (Enhancement - 2-4 settimane)
- Upload receipt
- Notifiche e promemoria
- Export dati
- Mobile optimizations

---

## 3. CONSIDERAZIONI AGGIUNTIVE

### 3.1 Possibili Estensioni Future
- App mobile con Capacitor
- Integrazione pagamenti (Stripe)
- Condivisione spese tra utenti registrati
- API pubblica per integrazioni
- Multi-currency support

### 3.2 Rischi e Mitigazioni
- **Complessità calcoli**: Unit testing estensivo per logica business
- **Performance con molti dati**: Implementare paginazione e filtri efficaci
- **Privacy**: Crittografia dati sensibili, compliance GDPR
- **Usabilità mobile**: Design mobile-first, test su dispositivi reali