// Data storage
let clients = JSON.parse(localStorage.getItem('clients')) || [];
let products = JSON.parse(localStorage.getItem('products')) || [];
let services = JSON.parse(localStorage.getItem('services')) || [];
let sales = JSON.parse(localStorage.getItem('sales')) || [];

// Current POS state
const currentSale = {
    id: generateTransactionId(),
    date: new Date().toISOString(),
    client: null,
    items: [],
    subtotal: 0,
    tax: 0,
    total: 0,
    paymentMethod: 'cash',
    paymentDetails: {},
    notes: '',
    status: 'pending'
};

// DOM Elements
let selectedClientInfo, selectedClientName, selectedClientDetails, clientSearchResults;
let itemsGrid, cartItemsList, emptyCartMessage, subtotalEl, taxEl, totalEl;
let paymentMethodSelect, cashPaymentFields, cardPaymentFields, transferPaymentFields;
let completePaymentBtn, amountReceivedInput, changeEl;

// Initialize the POS system
function initPOS() {
    // Get DOM elements
    selectedClientInfo = document.getElementById('selectedClientInfo');
    selectedClientName = document.getElementById('selectedClientName');
    selectedClientDetails = document.getElementById('selectedClientDetails');
    clientSearchResults = document.getElementById('clientSearchResults');
    itemsGrid = document.getElementById('itemsGrid');
    cartItemsList = document.getElementById('cartItemsList');
    emptyCartMessage = document.getElementById('emptyCartMessage');
    subtotalEl = document.getElementById('subtotal');
    taxEl = document.getElementById('tax');
    totalEl = document.getElementById('total');
    paymentMethodSelect = document.getElementById('paymentMethod');
    cashPaymentFields = document.getElementById('cashPaymentFields');
    cardPaymentFields = document.getElementById('cardPaymentFields');
    transferPaymentFields = document.getElementById('transferPaymentFields');
    completePaymentBtn = document.getElementById('completePaymentBtn');
    amountReceivedInput = document.getElementById('amountReceived');
    changeEl = document.getElementById('change');

    // Setup demo data if not available
    setupDemoData();

    // Set up event listeners
    document.getElementById('clientSearch').addEventListener('input', handleClientSearch);
    document.getElementById('clearClientBtn').addEventListener('click', clearSelectedClient);
    document.getElementById('showProductsBtn').addEventListener('click', () => showItems('products'));
    document.getElementById('showServicesBtn').addEventListener('click', () => showItems('services'));
    document.getElementById('itemSearch').addEventListener('input', filterItems);
    paymentMethodSelect.addEventListener('change', handlePaymentMethodChange);
    amountReceivedInput.addEventListener('input', calculateChange);
    completePaymentBtn.addEventListener('click', completeSale);

    // Check if a client was selected from another page
    const selectedClientId = sessionStorage.getItem('selectedClientId');
    if (selectedClientId) {
        const client = clients.find(c => c.id === selectedClientId);
        if (client) {
            selectClient(client);
        }
        sessionStorage.removeItem('selectedClientId');
    }

    // Initialize with products view
    showItems('products');
}

// Generate a unique transaction ID
function generateTransactionId() {
    return 'TX' + Date.now().toString();
}

// Set up demo data if none exists
function setupDemoData() {
    // Check if we need to create demo products
    if (products.length === 0) {
        products = [
            {
                id: 'prod1',
                name: 'Crema Hidratante Facial',
                description: 'Crema hidratante para todo tipo de piel',
                category: 'facial',
                price: 450,
                cost: 250,
                stock: 20,
                image: 'https://ui-avatars.com/api/?name=CH&background=5F9EA0&color=fff',
                active: true
            },
            {
                id: 'prod2',
                name: 'Gel Post-Depilación',
                description: 'Gel calmante para después de tratamientos láser',
                category: 'corporal',
                price: 380,
                cost: 200,
                stock: 15,
                image: 'https://ui-avatars.com/api/?name=GP&background=87CEEB&color=fff',
                active: true
            },
            {
                id: 'prod3',
                name: 'Protector Solar SPF 50+',
                description: 'Protección solar alta para piel sensible',
                category: 'protección',
                price: 520,
                cost: 280,
                stock: 25,
                image: 'https://ui-avatars.com/api/?name=PS&background=F4A460&color=fff',
                active: true
            },
            {
                id: 'prod4',
                name: 'Tónico Facial',
                description: 'Tónico refrescante para limpiar e hidratar',
                category: 'facial',
                price: 280,
                cost: 150,
                stock: 18,
                image: 'https://ui-avatars.com/api/?name=TF&background=9370DB&color=fff',
                active: true
            },
            {
                id: 'prod5',
                name: 'Mascarilla Exfoliante',
                description: 'Exfoliante suave para rostro',
                category: 'facial',
                price: 350,
                cost: 180,
                stock: 12,
                image: 'https://ui-avatars.com/api/?name=ME&background=DDA0DD&color=fff',
                active: true
            },
            {
                id: 'prod6',
                name: 'Serum Vitamina C',
                description: 'Serum antioxidante con vitamina C',
                category: 'facial',
                price: 650,
                cost: 350,
                stock: 10,
                image: 'https://ui-avatars.com/api/?name=SV&background=FF7F50&color=fff',
                active: true
            }
        ];
        localStorage.setItem('products', JSON.stringify(products));
    }

    // Check if we need to create demo services
    if (services.length === 0) {
        services = [
            {
                id: 'serv1',
                name: 'Depilación Láser - Piernas Completas',
                description: 'Tratamiento de depilación láser para piernas completas',
                category: 'depilación',
                duration: 60,
                price: 1800,
                cost: 600,
                image: 'https://ui-avatars.com/api/?name=DP&background=6495ED&color=fff',
                active: true
            },
            {
                id: 'serv2',
                name: 'Depilación Láser - Axilas',
                description: 'Tratamiento de depilación láser para axilas',
                category: 'depilación',
                duration: 20,
                price: 650,
                cost: 200,
                image: 'https://ui-avatars.com/api/?name=DA&background=4682B4&color=fff',
                active: true
            },
            {
                id: 'serv3',
                name: 'Limpieza Facial Profunda',
                description: 'Limpieza facial con extracción y mascarilla',
                category: 'facial',
                duration: 60,
                price: 980,
                cost: 350,
                image: 'https://ui-avatars.com/api/?name=LF&background=20B2AA&color=fff',
                active: true
            },
            {
                id: 'serv4',
                name: 'Tratamiento Anti-Acné',
                description: 'Tratamiento especializado para pieles con acné',
                category: 'facial',
                duration: 45,
                price: 1200,
                cost: 400,
                image: 'https://ui-avatars.com/api/?name=TA&background=3CB371&color=fff',
                active: true
            },
            {
                id: 'serv5',
                name: 'Depilación Láser - Línea Alba',
                description: 'Tratamiento de depilación láser para línea alba',
                category: 'depilación',
                duration: 15,
                price: 450,
                cost: 150,
                image: 'https://ui-avatars.com/api/?name=DL&background=1E90FF&color=fff',
                active: true
            },
            {
                id: 'serv6',
                name: 'Rejuvenecimiento Facial',
                description: 'Tratamiento para reducir arrugas y líneas de expresión',
                category: 'facial',
                duration: 75,
                price: 1500,
                cost: 500,
                image: 'https://ui-avatars.com/api/?name=RF&background=FF69B4&color=fff',
                active: true
            }
        ];
        localStorage.setItem('services', JSON.stringify(services));
    }
}

// Show/Hide modals
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('hidden');

        // Add event listener to close modal when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                hideModal(modalId);
            }
        });
    }
}

function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('hidden');
    }
}

// Client search and selection
function handleClientSearch(e) {
    const searchTerm = e.target.value.toLowerCase().trim();

    if (searchTerm.length < 2) {
        clientSearchResults.innerHTML = '';
        return;
    }

    const matchedClients = clients.filter(client => {
        const fullName = `${client.firstName} ${client.lastName}`.toLowerCase();
        return fullName.includes(searchTerm) ||
               (client.phone && client.phone.includes(searchTerm)) ||
               (client.email && client.email.toLowerCase().includes(searchTerm));
    }).slice(0, 5); // Limit to 5 results

    if (matchedClients.length === 0) {
        clientSearchResults.innerHTML = `
            <div class="p-3 text-center text-gray-500">
                No se encontraron clientes con ese criterio
            </div>
        `;
        return;
    }

    clientSearchResults.innerHTML = matchedClients.map(client => `
        <div class="p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer" onclick="selectClientById('${client.id}')">
            <div class="flex items-center">
                <div class="flex-shrink-0 h-10 w-10">
                    <img class="h-10 w-10 rounded-full" src="https://ui-avatars.com/api/?name=${encodeURIComponent(client.firstName + '+' + client.lastName)}&background=0D8ABC&color=fff" alt="${client.firstName}">
                </div>
                <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900">${client.firstName} ${client.lastName}</div>
                    <div class="text-xs text-gray-500">${client.phone}</div>
                </div>
            </div>
        </div>
    `).join('');
}

// Select client by ID (for use in onclick handlers)
function selectClientById(clientId) {
    const client = clients.find(c => c.id === clientId);
    if (client) {
        selectClient(client);
    }
}

// Select a client for the current sale
function selectClient(client) {
    // Update current sale
    currentSale.client = {
        id: client.id,
        name: `${client.firstName} ${client.lastName}`
    };

    // Update UI
    selectedClientInfo.classList.remove('hidden');
    selectedClientName.textContent = `${client.firstName} ${client.lastName}`;
    selectedClientDetails.textContent = `${client.phone} | ${client.email || 'No email'}`;

    // Clear search results and input
    clientSearchResults.innerHTML = '';
    document.getElementById('clientSearch').value = '';
}

// Clear selected client
function clearSelectedClient() {
    currentSale.client = null;
    selectedClientInfo.classList.add('hidden');
    selectedClientName.textContent = '';
    selectedClientDetails.textContent = '';
}

// Create a new client quickly from the POS
function handleQuickClientSubmit(event) {
    event.preventDefault();

    const formData = {
        id: Date.now().toString(),
        firstName: document.getElementById('quickFirstName').value,
        lastName: document.getElementById('quickLastName').value,
        email: document.getElementById('quickEmail').value || '',
        phone: document.getElementById('quickPhone').value,
        status: 'active',
        creationDate: new Date().toISOString()
    };

    // Add to clients array
    clients.push(formData);
    localStorage.setItem('clients', JSON.stringify(clients));

    // Select this client
    selectClient(formData);

    // Close modal
    hideModal('createClientModal');
}

// Show products or services in the grid
function showItems(type) {
    let items;
    if (type === 'products') {
        items = products.filter(p => p.active);
        document.getElementById('showProductsBtn').classList.add('bg-blue-600', 'text-white');
        document.getElementById('showProductsBtn').classList.remove('bg-gray-200', 'text-gray-700');
        document.getElementById('showServicesBtn').classList.add('bg-gray-200', 'text-gray-700');
        document.getElementById('showServicesBtn').classList.remove('bg-blue-600', 'text-white');
    } else {
        items = services.filter(s => s.active);
        document.getElementById('showServicesBtn').classList.add('bg-blue-600', 'text-white');
        document.getElementById('showServicesBtn').classList.remove('bg-gray-200', 'text-gray-700');
        document.getElementById('showProductsBtn').classList.add('bg-gray-200', 'text-gray-700');
        document.getElementById('showProductsBtn').classList.remove('bg-blue-600', 'text-white');
    }

    renderItems(items, type);
}

// Render items in the grid
function renderItems(items, type) {
    if (items.length === 0) {
        itemsGrid.innerHTML = `
            <div class="text-center text-gray-500 col-span-full py-8">
                No hay ${type === 'products' ? 'productos' : 'servicios'} disponibles
            </div>
        `;
        return;
    }

    itemsGrid.innerHTML = items.map(item => `
        <div class="bg-white border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div class="p-4">
                <div class="h-14 w-14 mx-auto mb-2">
                    <img src="${item.image}" alt="${item.name}" class="w-full h-full object-cover rounded-full">
                </div>
                <h3 class="text-sm font-medium text-gray-900 text-center truncate" title="${item.name}">${item.name}</h3>
                <p class="text-center text-gray-500 text-xs truncate mb-2" title="${item.description}">${item.description}</p>
                <div class="flex justify-center items-center mt-2">
                    <span class="text-md font-semibold text-gray-900">$${item.price.toFixed(2)}</span>
                    ${type === 'products' ?
                        `<span class="ml-2 text-xs text-gray-500">(${item.stock} en stock)</span>` :
                        `<span class="ml-2 text-xs text-gray-500">(${item.duration} min)</span>`
                    }
                </div>
                <button onclick="addToCart('${item.id}', '${type}')"
                        class="w-full mt-3 bg-blue-600 text-white py-1 rounded hover:bg-blue-700 text-sm flex items-center justify-center">
                    <i class="fas fa-plus mr-1"></i> Agregar
                </button>
            </div>
        </div>
    `).join('');
}

// Filter items based on search
function filterItems() {
    const searchTerm = document.getElementById('itemSearch').value.toLowerCase().trim();
    const activeTab = document.getElementById('showProductsBtn').classList.contains('bg-blue-600') ?
                       'products' : 'services';

    const items = activeTab === 'products' ? products : services;

    if (searchTerm === '') {
        renderItems(items.filter(item => item.active), activeTab);
        return;
    }

    const filteredItems = items.filter(item => {
        return (item.active && (
            item.name.toLowerCase().includes(searchTerm) ||
            item.description.toLowerCase().includes(searchTerm) ||
            item.category.toLowerCase().includes(searchTerm)
        ));
    });

    renderItems(filteredItems, activeTab);
}

// Add item to cart
function addToCart(itemId, type) {
    let itemToAdd;
    if (type === 'products') {
        itemToAdd = products.find(p => p.id === itemId);
        // Check stock
        if (itemToAdd.stock <= 0) {
            alert('Este producto está fuera de stock.');
            return;
        }
    } else {
        itemToAdd = services.find(s => s.id === itemId);
    }

    if (!itemToAdd) return;

    // Check if item already in cart
    const existingItemIndex = currentSale.items.findIndex(
        item => item.id === itemId && item.type === type
    );

    if (existingItemIndex !== -1) {
        // Increment quantity if already in cart
        currentSale.items[existingItemIndex].quantity++;
    } else {
        // Add new item to cart
        currentSale.items.push({
            id: itemToAdd.id,
            type: type,
            name: itemToAdd.name,
            price: itemToAdd.price,
            cost: itemToAdd.cost,
            quantity: 1
        });
    }

    // Update UI
    updateCart();
}

// Remove item from cart
function removeFromCart(index) {
    if (index >= 0 && index < currentSale.items.length) {
        currentSale.items.splice(index, 1);
        updateCart();
    }
}

// Update quantity of item in cart
function updateQuantity(index, change) {
    if (index >= 0 && index < currentSale.items.length) {
        const item = currentSale.items[index];
        const newQuantity = item.quantity + change;

        if (newQuantity <= 0) {
            // Remove item if quantity becomes 0 or negative
            removeFromCart(index);
            return;
        }

        // For products, check stock
        if (item.type === 'products') {
            const product = products.find(p => p.id === item.id);
            if (product && newQuantity > product.stock) {
                alert(`Solo hay ${product.stock} unidades disponibles de este producto.`);
                return;
            }
        }

        item.quantity = newQuantity;
        updateCart();
    }
}

// Update cart UI and calculations
function updateCart() {
    if (currentSale.items.length === 0) {
        // Cart is empty
        emptyCartMessage.classList.remove('hidden');
        cartItemsList.classList.add('hidden');
        cartItemsList.innerHTML = '';

        // Reset totals
        currentSale.subtotal = 0;
        currentSale.tax = 0;
        currentSale.total = 0;
    } else {
        // Cart has items
        emptyCartMessage.classList.add('hidden');
        cartItemsList.classList.remove('hidden');

        // Render cart items
        cartItemsList.innerHTML = currentSale.items.map((item, index) => `
            <li class="py-3">
                <div class="flex justify-between items-start">
                    <div class="flex-1">
                        <p class="text-sm font-medium text-gray-900">${item.name}</p>
                        <p class="text-xs text-gray-500">${item.type === 'products' ? 'Producto' : 'Servicio'}</p>
                        <div class="flex items-center mt-1">
                            <button onclick="updateQuantity(${index}, -1)"
                                    class="text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 h-6 w-6 rounded flex items-center justify-center">
                                <i class="fas fa-minus text-xs"></i>
                            </button>
                            <span class="mx-2 text-sm">${item.quantity}</span>
                            <button onclick="updateQuantity(${index}, 1)"
                                    class="text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 h-6 w-6 rounded flex items-center justify-center">
                                <i class="fas fa-plus text-xs"></i>
                            </button>
                        </div>
                    </div>
                    <div class="text-right">
                        <p class="text-sm font-medium text-gray-900">$${(item.price * item.quantity).toFixed(2)}</p>
                        <p class="text-xs text-gray-500">$${item.price.toFixed(2)} c/u</p>
                        <button onclick="removeFromCart(${index})" class="text-red-500 hover:text-red-700 text-xs mt-1">
                            <i class="fas fa-trash"></i> Eliminar
                        </button>
                    </div>
                </div>
            </li>
        `).join('');

        // Calculate totals
        calculateTotals();
    }

    // Update totals in UI
    subtotalEl.textContent = `$${currentSale.subtotal.toFixed(2)}`;
    taxEl.textContent = `$${currentSale.tax.toFixed(2)}`;
    totalEl.textContent = `$${currentSale.total.toFixed(2)}`;

    // Update amount received field max value
    if (amountReceivedInput) {
        amountReceivedInput.min = currentSale.total;
        calculateChange();
    }
}

// Calculate sale totals
function calculateTotals() {
    // Calculate subtotal (sum of all items price * quantity)
    currentSale.subtotal = currentSale.items.reduce(
        (sum, item) => sum + (item.price * item.quantity), 0
    );

    // Calculate tax (16% of subtotal)
    currentSale.tax = currentSale.subtotal * 0.16;

    // Calculate total (subtotal + tax)
    currentSale.total = currentSale.subtotal + currentSale.tax;
}

// Handle payment method change
function handlePaymentMethodChange() {
    const method = paymentMethodSelect.value;

    // Hide all payment fields first
    cashPaymentFields.classList.add('hidden');
    cardPaymentFields.classList.add('hidden');
    transferPaymentFields.classList.add('hidden');

    // Show relevant fields based on selected method
    if (method === 'cash') {
        cashPaymentFields.classList.remove('hidden');
    } else if (method === 'card') {
        cardPaymentFields.classList.remove('hidden');
    } else if (method === 'transfer') {
        transferPaymentFields.classList.remove('hidden');
    }

    // Update current sale payment method
    currentSale.paymentMethod = method;
}

// Calculate change based on amount received
function calculateChange() {
    const amountReceived = parseFloat(amountReceivedInput.value) || 0;
    const change = amountReceived - currentSale.total;

    changeEl.value = change > 0 ? `$${change.toFixed(2)}` : '$0.00';
}

// Complete the sale
function completeSale() {
    // Validate client selection
    if (!currentSale.client) {
        alert('Por favor seleccione un cliente antes de completar la venta.');
        return;
    }

    // Validate cart has items
    if (currentSale.items.length === 0) {
        alert('El carrito está vacío. Agregue productos o servicios para completar la venta.');
        return;
    }

    // Validate payment details
    const paymentMethod = currentSale.paymentMethod;
    let paymentDetails = {};
    let validPayment = false;

    if (paymentMethod === 'cash') {
        const amountReceived = parseFloat(amountReceivedInput.value) || 0;
        if (amountReceived < currentSale.total) {
            alert('El monto recibido debe ser igual o mayor al total de la venta.');
            return;
        }

        paymentDetails = {
            amountReceived: amountReceived,
            change: amountReceived - currentSale.total
        };
        validPayment = true;
    } else if (paymentMethod === 'card') {
        const lastDigits = document.getElementById('cardLastDigits').value;
        if (lastDigits.length !== 4 || !/^\d+$/.test(lastDigits)) {
            alert('Por favor ingrese los últimos 4 dígitos de la tarjeta.');
            return;
        }

        paymentDetails = { lastDigits };
        validPayment = true;
    } else if (paymentMethod === 'transfer') {
        const reference = document.getElementById('transferReference').value;
        if (!reference) {
            alert('Por favor ingrese la referencia de la transferencia.');
            return;
        }

        paymentDetails = { reference };
        validPayment = true;
    }

    if (validPayment) {
        // Complete the sale
        const completedSale = {
            ...currentSale,
            paymentDetails,
            notes: document.getElementById('saleNotes').value,
            status: 'completed',
            completedAt: new Date().toISOString()
        };

        // Update inventory for product items
        completedSale.items.forEach(item => {
            if (item.type === 'products') {
                const productIndex = products.findIndex(p => p.id === item.id);
                if (productIndex !== -1) {
                    products[productIndex].stock -= item.quantity;
                }
            }
        });

        // Save updated products to localStorage
        localStorage.setItem('products', JSON.stringify(products));

        // Add to sales history
        sales.push(completedSale);
        localStorage.setItem('sales', JSON.stringify(sales));

        // Show receipt
        showReceipt(completedSale);
    }
}

// Show receipt in modal
function showReceipt(sale) {
    const receiptContent = document.getElementById('receiptContent');
    const clientInfo = clients.find(c => c.id === sale.client.id);

    const formattedDate = new Date(sale.completedAt).toLocaleString('es-MX', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });

    let paymentDetails = '';
    if (sale.paymentMethod === 'cash') {
        paymentDetails = `
            <p class="text-sm"><span class="font-medium">Efectivo recibido:</span> $${sale.paymentDetails.amountReceived.toFixed(2)}</p>
            <p class="text-sm"><span class="font-medium">Cambio:</span> $${sale.paymentDetails.change.toFixed(2)}</p>
        `;
    } else if (sale.paymentMethod === 'card') {
        paymentDetails = `
            <p class="text-sm"><span class="font-medium">Tarjeta terminación:</span> ${sale.paymentDetails.lastDigits}</p>
        `;
    } else if (sale.paymentMethod === 'transfer') {
        paymentDetails = `
            <p class="text-sm"><span class="font-medium">Referencia:</span> ${sale.paymentDetails.reference}</p>
        `;
    }

    receiptContent.innerHTML = `
        <div class="text-center mb-4">
            <h4 class="text-xl font-bold text-gray-900">Dermacielo</h4>
            <p class="text-sm text-gray-600">Recibo de Venta</p>
        </div>

        <div class="border-t border-b border-gray-200 py-4 my-4">
            <div class="flex justify-between">
                <div>
                    <p class="text-sm"><span class="font-medium">Folio:</span> ${sale.id}</p>
                    <p class="text-sm"><span class="font-medium">Fecha:</span> ${formattedDate}</p>
                </div>
                <div>
                    <p class="text-sm"><span class="font-medium">Cliente:</span> ${sale.client.name}</p>
                    <p class="text-sm"><span class="font-medium">Teléfono:</span> ${clientInfo?.phone || 'N/A'}</p>
                </div>
            </div>
        </div>

        <div class="my-4">
            <table class="w-full text-sm">
                <thead class="border-b border-gray-200">
                    <tr>
                        <th class="py-2 text-left">Descripción</th>
                        <th class="py-2 text-right">Cant.</th>
                        <th class="py-2 text-right">Precio</th>
                        <th class="py-2 text-right">Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${sale.items.map(item => `
                        <tr>
                            <td class="py-2 text-left">${item.name}</td>
                            <td class="py-2 text-right">${item.quantity}</td>
                            <td class="py-2 text-right">$${item.price.toFixed(2)}</td>
                            <td class="py-2 text-right">$${(item.price * item.quantity).toFixed(2)}</td>
                        </tr>
                    `).join('')}
                </tbody>
                <tfoot class="border-t border-gray-200">
                    <tr>
                        <td colspan="3" class="py-2 text-right font-medium">Subtotal:</td>
                        <td class="py-2 text-right">$${sale.subtotal.toFixed(2)}</td>
                    </tr>
                    <tr>
                        <td colspan="3" class="py-2 text-right font-medium">IVA (16%):</td>
                        <td class="py-2 text-right">$${sale.tax.toFixed(2)}</td>
                    </tr>
                    <tr>
                        <td colspan="3" class="py-2 text-right font-medium text-lg">Total:</td>
                        <td class="py-2 text-right font-bold text-lg">$${sale.total.toFixed(2)}</td>
                    </tr>
                </tfoot>
            </table>
        </div>

        <div class="border-t border-gray-200 pt-4 mt-4">
            <p class="text-sm"><span class="font-medium">Método de Pago:</span> ${getPaymentMethodLabel(sale.paymentMethod)}</p>
            ${paymentDetails}
        </div>

        ${sale.notes ? `
            <div class="mt-4 pt-4 border-t border-gray-200">
                <p class="text-sm font-medium">Notas:</p>
                <p class="text-sm mt-1">${sale.notes}</p>
            </div>
        ` : ''}

        <div class="mt-6 text-center text-sm text-gray-500">
            <p>¡Gracias por su preferencia!</p>
            <p>www.dermacielo.com</p>
        </div>
    `;

    showModal('receiptModal');
}

// Get payment method label
function getPaymentMethodLabel(method) {
    switch(method) {
        case 'cash': return 'Efectivo';
        case 'card': return 'Tarjeta de Crédito/Débito';
        case 'transfer': return 'Transferencia Bancaria';
        default: return method;
    }
}

// Print receipt
function printReceipt() {
    const receiptContent = document.getElementById('receiptContent').innerHTML;
    const printWindow = window.open('', '_blank');

    printWindow.document.write(`
        <html>
            <head>
                <title>Recibo de Venta - Dermacielo</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    table { width: 100%; border-collapse: collapse; }
                    th, td { padding: 5px; }
                    th { text-align: left; }
                    .text-right { text-align: right; }
                </style>
            </head>
            <body>
                ${receiptContent}
            </body>
        </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
}

// Start a new sale
function startNewSale() {
    // Reset the current sale object
    Object.assign(currentSale, {
        id: generateTransactionId(),
        date: new Date().toISOString(),
        client: null,
        items: [],
        subtotal: 0,
        tax: 0,
        total: 0,
        paymentMethod: 'cash',
        paymentDetails: {},
        notes: '',
        status: 'pending'
    });

    // Reset UI elements
    clearSelectedClient();
    document.getElementById('saleNotes').value = '';
    document.getElementById('paymentMethod').value = 'cash';
    document.getElementById('amountReceived').value = '';
    document.getElementById('change').value = '';
    document.getElementById('cardLastDigits').value = '';
    document.getElementById('transferReference').value = '';

    // Handle payment method change to show/hide fields
    handlePaymentMethodChange();

    // Update cart UI
    updateCart();

    // Hide receipt modal
    hideModal('receiptModal');
}

// Initialize when the document loads
document.addEventListener('DOMContentLoaded', initPOS);
