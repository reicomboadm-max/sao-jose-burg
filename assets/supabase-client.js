/**
 * =========================================================================
 * SÃO JOSÉ BURGUER - SUPABASE CLIENT & CLOUD SYNC
 * Conexão de alta performance com PostgreSQL na nuvem (Supabase)
 * Inclui fallback automático para LocalStorage caso offline ou não configurado.
 * =========================================================================
 */

const DEFAULT_SUPABASE_CONFIG = {
  url: "https://encdcavjjtjihyoonpcz.supabase.co",
  key: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVuY2RjYXZqanRqaWh5b29vcGN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc5NTQ0MjIsImV4cCI6MjEwMzUzMDQyMn0.E-x6vacMWg38mk8xegmHqDhsEOfwSbq-Y9jiV8Ck1rE"
};

const SAO_JOSE_SUPABASE = {
  client: null,
  isReady: false,

  // Chaves salvas no código para segurança
  getConfig() {
    return {
      url: localStorage.getItem('SAO_JOSE_SUPABASE_URL') || DEFAULT_SUPABASE_CONFIG.url,
      key: localStorage.getItem('SAO_JOSE_SUPABASE_KEY') || DEFAULT_SUPABASE_CONFIG.key
    };
  },

  init() {
    const { url, key } = this.getConfig();
    if (url && key && window.supabase && window.supabase.createClient) {
      try {
        this.client = window.supabase.createClient(url, key);
        this.isReady = true;
        console.log('✅ Supabase conectado com sucesso no São José Burguer!');
        return true;
      } catch (err) {
        console.warn('⚠️ Erro ao inicializar Supabase:', err);
        this.isReady = false;
      }
    } else {
      this.isReady = false;
    }
    return false;
  },

  // Salvar ou Atualizar Cliente
  async saveCustomer(customer) {
    if (!customer || !customer.phone) return null;
    const phoneClean = customer.phone.replace(/\D/g, '');

    // Fallback Local
    let localCustomers = [];
    try {
      localCustomers = JSON.parse(localStorage.getItem('SAO_JOSE_CUSTOMERS') || '[]');
    } catch (e) {}

    const existingIdx = localCustomers.findIndex(c => c.phone.replace(/\D/g, '') === phoneClean);
    const customerObj = {
      name: customer.name || 'Cliente',
      phone: customer.phone,
      email: customer.email || '',
      address: customer.address || '',
      neighborhood: customer.neighborhood || '',
      city: customer.city || 'Pedreiras',
      last_order_at: new Date().toISOString()
    };

    if (existingIdx >= 0) {
      localCustomers[existingIdx] = { ...localCustomers[existingIdx], ...customerObj, total_orders: (localCustomers[existingIdx].total_orders || 1) + 1 };
    } else {
      localCustomers.unshift({ ...customerObj, total_orders: 1, created_at: new Date().toISOString() });
    }
    // Manter no máximo 500 clientes no cache local para não pesar
    if (localCustomers.length > 500) localCustomers = localCustomers.slice(0, 500);
    localStorage.setItem('SAO_JOSE_CUSTOMERS', JSON.stringify(localCustomers));

    // Salvar no Supabase se ativo
    if (this.isReady && this.client) {
      try {
        const { data, error } = await this.client
          .from('customers')
          .upsert({
            phone: phoneClean,
            name: customer.name,
            email: customer.email || null,
            address: customer.address || null,
            neighborhood: customer.neighborhood || null,
            city: customer.city || 'Pedreiras',
            last_order_at: new Date().toISOString()
          }, { onConflict: 'phone' })
          .select()
          .single();

        if (error) throw error;
        return data;
      } catch (err) {
        console.warn('⚠️ Erro ao salvar cliente no Supabase (usando local):', err.message);
      }
    }
    return customerObj;
  },

  // Salvar Pedido
  async saveOrder(order) {
    if (!order || !order.id) return false;

    // 1. Sempre salvar no cache local com limite seguro de 150 pedidos
    let localOrders = [];
    try {
      localOrders = JSON.parse(localStorage.getItem('SAO_JOSE_ORDERS') || '[]');
    } catch (e) {}

    if (!localOrders.some(o => o.id === order.id)) {
      localOrders.unshift(order);
      if (localOrders.length > 200) localOrders = localOrders.slice(0, 200); // Impede travamento de memória
      localStorage.setItem('SAO_JOSE_ORDERS', JSON.stringify(localOrders));
    }

    // 2. Salvar no Supabase
    if (this.isReady && this.client) {
      try {
        const payload = {
          id: order.id,
          customer_name: order.customer?.name || 'Cliente',
          customer_phone: order.customer?.phone || '',
          customer_address: order.address || '',
          neighborhood: order.neighborhood || '',
          mode: order.mode || 'delivery',
          table_number: order.table || null,
          payment_method: order.payment || 'PIX',
          is_paid: !!order.isPaid,
          items: order.items || [],
          subtotal: order.subtotal || order.total || 0,
          delivery_fee: order.deliveryFee || 0,
          discount: order.discount || 0,
          total: order.total || 0,
          status: order.status || 'pending',
          notes: order.notes || '',
          created_at: order.date || new Date().toISOString()
        };

        const { error } = await this.client
          .from('orders')
          .upsert(payload, { onConflict: 'id' });

        if (error) throw error;
        console.log(`✅ Pedido #${order.id} salvo no Supabase!`);
        return true;
      } catch (err) {
        console.warn('⚠️ Erro ao salvar pedido no Supabase:', err.message);
      }
    }
    return true;
  },

  // Buscar Pedidos com Paginação (para o Painel Admin não travar)
  async fetchOrders(page = 1, limit = 50, statusFilter = 'all') {
    if (this.isReady && this.client) {
      try {
        const from = (page - 1) * limit;
        const to = from + limit - 1;

        let query = this.client
          .from('orders')
          .select('*', { count: 'exact' })
          .order('created_at', { ascending: false })
          .range(from, to);

        if (statusFilter && statusFilter !== 'all') {
          query = query.eq('status', statusFilter);
        }

        const { data, count, error } = await query;
        if (error) throw error;

        // Converter formato do banco para o formato do admin
        const formatted = (data || []).map(row => ({
          id: row.id,
          date: row.created_at,
          customer: { name: row.customer_name, phone: row.customer_phone },
          address: row.customer_address,
          neighborhood: row.neighborhood,
          mode: row.mode,
          table: row.table_number,
          payment: row.payment_method,
          isPaid: row.is_paid,
          items: row.items || [],
          total: parseFloat(row.total) || 0,
          status: row.status,
          notes: row.notes
        }));

        return { orders: formatted, totalCount: count || formatted.length };
      } catch (err) {
        console.warn('⚠️ Erro ao buscar pedidos no Supabase, usando local:', err.message);
      }
    }

    // Fallback Local
    let local = [];
    try {
      local = JSON.parse(localStorage.getItem('SAO_JOSE_ORDERS') || '[]');
    } catch (e) {}
    if (statusFilter && statusFilter !== 'all') {
      local = local.filter(o => o.status === statusFilter);
    }
    return { orders: local.slice((page - 1) * limit, page * limit), totalCount: local.length };
  },

  // Atualizar Status do Pedido
  async updateOrderStatus(orderId, status, isPaid = null) {
    // 1. Atualizar Local
    try {
      let local = JSON.parse(localStorage.getItem('SAO_JOSE_ORDERS') || '[]');
      const item = local.find(o => o.id === orderId);
      if (item) {
        if (status) item.status = status;
        if (isPaid !== null) item.isPaid = isPaid;
        localStorage.setItem('SAO_JOSE_ORDERS', JSON.stringify(local));
      }
    } catch (e) {}

    // 2. Atualizar no Supabase
    if (this.isReady && this.client) {
      try {
        const updateData = { updated_at: new Date().toISOString() };
        if (status) updateData.status = status;
        if (isPaid !== null) updateData.is_paid = isPaid;

        const { error } = await this.client
          .from('orders')
          .update(updateData)
          .eq('id', orderId);

        if (error) throw error;
      } catch (err) {
        console.warn('⚠️ Erro ao atualizar status no Supabase:', err.message);
      }
    }
  },

  // Escutar Novos Pedidos em Tempo Real via WebSocket
  subscribeToOrders(onNewOrder, onUpdateOrder) {
    if (!this.isReady || !this.client) return null;

    try {
      const channel = this.client
        .channel('realtime_sao_jose_orders')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, payload => {
          const row = payload.new;
          if (row && onNewOrder) {
            const formatted = {
              id: row.id,
              date: row.created_at,
              customer: { name: row.customer_name, phone: row.customer_phone },
              address: row.customer_address,
              neighborhood: row.neighborhood,
              mode: row.mode,
              table: row.table_number,
              payment: row.payment_method,
              isPaid: row.is_paid,
              items: row.items || [],
              total: parseFloat(row.total) || 0,
              status: row.status,
              notes: row.notes
            };
            onNewOrder(formatted);
          }
        })
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders' }, payload => {
          const row = payload.new;
          if (row && onUpdateOrder) {
            onUpdateOrder(row);
          }
        })
        .subscribe();

      return channel;
    } catch (err) {
      console.warn('⚠️ Erro ao assinar canal realtime do Supabase:', err);
      return null;
    }
  }
};

// Auto-inicializar quando a página carregar
if (typeof window !== 'undefined') {
  window.SAO_JOSE_SUPABASE = SAO_JOSE_SUPABASE;
  window.addEventListener('DOMContentLoaded', () => {
    SAO_JOSE_SUPABASE.init();
  });
}
