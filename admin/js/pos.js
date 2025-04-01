// Data storage
let clients = JSON.parse(localStorage.getItem('clients')) || [];
let products = JSON.parse(localStorage.getItem('products')) || [];
let services = JSON.parse(localStorage.getItem('services')) || [];
let sales = JSON.parse(localStorage.getItem('sales')) || [];

// Sincroniza los datos entre las diferentes partes del sistema
function syncDataAcrossModules() {
    // Si hay productos actualizados en products.js, los usamos en POS
    const storedProducts = localStorage.getItem('products');
    if (storedProducts) {
        products = JSON.parse(storedProducts);
    }

    // Si hay servicios actualizados en services.js, los usamos en POS
    const storedServices = localStorage.getItem('services');
    if (storedServices) {
        services = JSON.parse(storedServices);
    }

    // Si hay clientes actualizados en clients.js, los usamos en POS
    const storedClients = localStorage.getItem('clients');
    if (storedClients) {
        clients = JSON.parse(storedClients);
    }

    // Si hay citas actualizadas en appointments.js, las usamos en POS
    const storedAppointments = localStorage.getItem('appointments');
    if (!storedAppointments) {
        // Si no hay citas almacenadas, creamos un array vacío
        localStorage.setItem('appointments', JSON.stringify([]));
    }

    // Si hay ventas, las cargamos
    const storedSales = localStorage.getItem('sales');
    if (!storedSales) {
        // Si no hay ventas almacenadas, creamos un array vacío
        localStorage.setItem('sales', JSON.stringify([]));
        sales = [];
    } else {
        sales = JSON.parse(storedSales);
    }
}

// Función para obtener citas desde localStorage
function getAppointments() {
    return JSON.parse(localStorage.getItem('appointments')) || [];
}

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

// Filter state
const filterState = {
    searchTerm: '',
    category: '',
    type: 'all' // 'all', 'products', or 'services'
};

// DOM Elements
let selectedClientInfo, selectedClientName, selectedClientDetails, clientSearchResults;
let itemsGrid, cartItemsList, emptyCartMessage, subtotalEl, taxEl, totalEl;
let paymentMethodSelect, cashPaymentFields, cardPaymentFields, transferPaymentFields;
let completePaymentBtn, amountReceivedInput, changeEl, categoryFilters;

// Initialize the POS system
function initPOS() {
    // Sincronizar datos entre módulos
    syncDataAcrossModules();

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
    categoryFilters = document.getElementById('categoryFilters');

    // Cargar datos actualizados del localStorage
    loadDataFromLocalStorage();

    // Load categories
    loadCategories();

    // Set up event listeners
    document.getElementById('clientSearch').addEventListener('input', handleClientSearch);
    document.getElementById('clearClientBtn').addEventListener('click', clearSelectedClient);
    document.getElementById('showAllBtn').addEventListener('click', () => showItems('all'));
    document.getElementById('showProductsBtn').addEventListener('click', () => showItems('products'));
    document.getElementById('showServicesBtn').addEventListener('click', () => showItems('services'));
    document.getElementById('itemSearch').addEventListener('input', filterItems);
    document.getElementById('clearCategoryFilter').addEventListener('click', clearCategoryFilter);
    document.getElementById('showSalesReportBtn').addEventListener('click', showSalesReport);
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

    // Initialize with all items view
    showItems('all');
}

// Función para cargar los datos actualizados desde localStorage
function loadDataFromLocalStorage() {
    // Cargar clientes
    clients = JSON.parse(localStorage.getItem('clients')) || [];

    // Cargar productos y servicios
    products = JSON.parse(localStorage.getItem('products')) || [];
    services = JSON.parse(localStorage.getItem('services')) || [];

    // Cargar ventas
    sales = JSON.parse(localStorage.getItem('sales')) || [];

    // Si no hay productos o servicios, llamar a setupDemoData
    if (products.length === 0 || services.length === 0) {
        setupDemoData();
    }
}

// Load categories for products and services
function loadCategories() {
    // Extract unique categories from products and services
    const productCategories = [...new Set(products.map(p => p.category))];
    const serviceCategories = [...new Set(services.map(s => s.category))];

    // Combine and remove duplicates
    const allCategories = [...new Set([...productCategories, ...serviceCategories])].sort();

    // Create category filters
    categoryFilters.innerHTML = `
        <div class="flex flex-wrap gap-2">
            ${allCategories.map(category => `
                <button
                    class="category-filter px-3 py-1 text-xs rounded-full border hover:bg-gray-100"
                    data-category="${category}"
                    onclick="filterByCategory('${category}')"
                >
                    ${capitalizeFirstLetter(category)}
                </button>
            `).join('')}
        </div>
    `;
}

// Capitalize first letter of a string
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Filter by category
function filterByCategory(category) {
    // Update active category in UI
    document.querySelectorAll('.category-filter').forEach(btn => {
        if (btn.dataset.category === category) {
            btn.classList.add('bg-blue-100', 'border-blue-300', 'text-blue-800');
            btn.classList.remove('hover:bg-gray-100', 'border-gray-300');
        } else {
            btn.classList.remove('bg-blue-100', 'border-blue-300', 'text-blue-800');
            btn.classList.add('hover:bg-gray-100', 'border-gray-300');
        }
    });

    // Update filter state
    filterState.category = category;

    // Refresh items
    applyFilters();
}

// Clear category filter
function clearCategoryFilter() {
    filterState.category = '';

    // Reset category button styles
    document.querySelectorAll('.category-filter').forEach(btn => {
        btn.classList.remove('bg-blue-100', 'border-blue-300', 'text-blue-800');
        btn.classList.add('hover:bg-gray-100', 'border-gray-300');
    });

    // Refresh items
    applyFilters();
}

// Apply all filters and show filtered items
function applyFilters() {
    let itemsToFilter = [];

    // First filter by type
    if (filterState.type === 'products') {
        itemsToFilter = products.filter(p => p.active).map(p => ({...p, type: 'products'}));
    } else if (filterState.type === 'services') {
        itemsToFilter = services.filter(s => s.active).map(s => ({...s, type: 'services'}));
    } else {
        // Combined view
        itemsToFilter = [
            ...products.filter(p => p.active).map(p => ({...p, type: 'products'})),
            ...services.filter(s => s.active).map(s => ({...s, type: 'services'}))
        ];
    }

    // Then filter by category if set
    if (filterState.category) {
        itemsToFilter = itemsToFilter.filter(item => item.category === filterState.category);
    }

    // Finally filter by search term
    if (filterState.searchTerm) {
        itemsToFilter = itemsToFilter.filter(item =>
            item.name.toLowerCase().includes(filterState.searchTerm) ||
            item.description.toLowerCase().includes(filterState.searchTerm)
        );
    }

    // Render filtered items
    renderItems(itemsToFilter, filterState.type);
}

// Show products or services in the grid
function showItems(type) {
    // Update filter state
    filterState.type = type;

    // Reset all button styles first
    document.getElementById('showAllBtn').classList.remove('bg-blue-600', 'text-white');
    document.getElementById('showAllBtn').classList.add('bg-gray-200', 'text-gray-700');
    document.getElementById('showProductsBtn').classList.remove('bg-blue-600', 'text-white');
    document.getElementById('showProductsBtn').classList.add('bg-gray-200', 'text-gray-700');
    document.getElementById('showServicesBtn').classList.remove('bg-blue-600', 'text-white');
    document.getElementById('showServicesBtn').classList.add('bg-gray-200', 'text-gray-700');

    // Set active button style based on type
    if (type === 'products') {
        document.getElementById('showProductsBtn').classList.add('bg-blue-600', 'text-white');
        document.getElementById('showProductsBtn').classList.remove('bg-gray-200', 'text-gray-700');
    } else if (type === 'services') {
        document.getElementById('showServicesBtn').classList.add('bg-blue-600', 'text-white');
        document.getElementById('showServicesBtn').classList.remove('bg-gray-200', 'text-gray-700');
    } else {
        document.getElementById('showAllBtn').classList.add('bg-blue-600', 'text-white');
        document.getElementById('showAllBtn').classList.remove('bg-gray-200', 'text-gray-700');
    }

    // Apply all filters
    applyFilters();
}

// Filter items based on search
function filterItems() {
    filterState.searchTerm = document.getElementById('itemSearch').value.toLowerCase().trim();
    applyFilters();
}

// Generate a unique transaction ID
function generateTransactionId() {
    return 'TX' + Date.now().toString();
}

// Set up demo data if none exists
function setupDemoData() {
    let needToSaveProducts = false;
    let needToSaveServices = false;

    // Verificamos si es necesario agregar productos de demostración
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
        needToSaveProducts = true;
    }

    // Verificamos si es necesario agregar servicios de demostración
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
        needToSaveServices = true;
    }

    // Verificar que todos los productos tengan la propiedad 'active'
    let productsUpdated = false;
    products.forEach(product => {
        if (product.active === undefined) {
            product.active = true;
            productsUpdated = true;
        }
    });

    // Verificar que todos los servicios tengan la propiedad 'active'
    let servicesUpdated = false;
    services.forEach(service => {
        if (service.active === undefined) {
            service.active = true;
            servicesUpdated = true;
        }
    });

    // Guardar los datos en localStorage si se modificaron
    if (needToSaveProducts || productsUpdated) {
        localStorage.setItem('products', JSON.stringify(products));
    }

    if (needToSaveServices || servicesUpdated) {
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

    // Obtenemos las citas
    const appointments = getAppointments();
    const currentDate = new Date();

    // Filtramos clientes que coinciden con el término de búsqueda
    const matchedClients = clients.filter(client => {
        const fullName = `${client.firstName} ${client.lastName}`.toLowerCase();
        return fullName.includes(searchTerm) ||
               (client.phone && client.phone.includes(searchTerm)) ||
               (client.email && client.email.toLowerCase().includes(searchTerm));
    });

    // Determinamos qué clientes tienen citas activas o recientes (en los próximos 7 días)
    const clientsWithActiveAppointments = new Set();
    appointments.forEach(appointment => {
        const appointmentDate = new Date(appointment.date);
        const timeDiff = Math.abs(appointmentDate - currentDate);
        const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

        // Si la cita es hoy o en los próximos 7 días
        if (daysDiff <= 7) {
            clientsWithActiveAppointments.add(appointment.clientId);
        }
    });

    // Ordenamos los clientes: primero los que tienen citas activas o recientes
    const sortedClients = matchedClients.sort((a, b) => {
        const aHasAppointment = clientsWithActiveAppointments.has(a.id);
        const bHasAppointment = clientsWithActiveAppointments.has(b.id);

        if (aHasAppointment && !bHasAppointment) return -1;
        if (!aHasAppointment && bHasAppointment) return 1;
        return 0;
    }).slice(0, 5); // Limitamos a 5 resultados

    if (sortedClients.length === 0) {
        clientSearchResults.innerHTML = `
            <div class="p-3 text-center text-gray-500">
                No se encontraron clientes con ese criterio
            </div>
        `;
        return;
    }

    clientSearchResults.innerHTML = sortedClients.map(client => {
        const hasActiveAppointment = clientsWithActiveAppointments.has(client.id);

        return `
        <div class="p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${hasActiveAppointment ? 'bg-blue-50' : ''}" onclick="selectClientById('${client.id}')">
            <div class="flex items-center">
                <div class="flex-shrink-0 h-10 w-10">
                    <img class="h-10 w-10 rounded-full" src="https://ui-avatars.com/api/?name=${encodeURIComponent(client.firstName + '+' + client.lastName)}&background=0D8ABC&color=fff" alt="${client.firstName}">
                </div>
                <div class="ml-4 flex-1">
                    <div class="text-sm font-medium text-gray-900">${client.firstName} ${client.lastName}</div>
                    <div class="text-xs text-gray-500">${client.phone}</div>
                </div>
                ${hasActiveAppointment ? `
                <div class="ml-2">
                    <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <svg class="mr-1 h-2 w-2 text-green-400" fill="currentColor" viewBox="0 0 8 8">
                            <circle cx="4" cy="4" r="3"></circle>
                        </svg>
                        Cita activa
                    </span>
                </div>` : ''}
            </div>
        </div>
        `;
    }).join('');
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
    // Update filter state
    filterState.type = type;

    // Reset all button styles first
    document.getElementById('showAllBtn').classList.remove('bg-blue-600', 'text-white');
    document.getElementById('showAllBtn').classList.add('bg-gray-200', 'text-gray-700');
    document.getElementById('showProductsBtn').classList.remove('bg-blue-600', 'text-white');
    document.getElementById('showProductsBtn').classList.add('bg-gray-200', 'text-gray-700');
    document.getElementById('showServicesBtn').classList.remove('bg-blue-600', 'text-white');
    document.getElementById('showServicesBtn').classList.add('bg-gray-200', 'text-gray-700');

    // Set active button style based on type
    if (type === 'products') {
        document.getElementById('showProductsBtn').classList.add('bg-blue-600', 'text-white');
        document.getElementById('showProductsBtn').classList.remove('bg-gray-200', 'text-gray-700');
    } else if (type === 'services') {
        document.getElementById('showServicesBtn').classList.add('bg-blue-600', 'text-white');
        document.getElementById('showServicesBtn').classList.remove('bg-gray-200', 'text-gray-700');
    } else {
        document.getElementById('showAllBtn').classList.add('bg-blue-600', 'text-white');
        document.getElementById('showAllBtn').classList.remove('bg-gray-200', 'text-gray-700');
    }

    // Apply all filters
    applyFilters();
}

// Handle category filter change
function handleCategoryFilterChange() {
    const selectedCategory = categoryFilters.value;
    filterState.category = selectedCategory;
    showItems(filterState.type); // Refresh items based on selected type
}

// Render items in the grid
function renderItems(items, displayType) {
    console.log(`Renderizando ${items.length} items de tipo: ${displayType}`);
    console.log('Productos en sistema:', products.length);
    console.log('Servicios en sistema:', services.length);

    if (items.length === 0) {
        let message = '';

        if (displayType === 'products') {
            message = 'No hay productos disponibles';
            if (products.length === 0) {
                message += '. No se encontraron productos en el sistema.';
            } else {
                message += ' con los filtros seleccionados.';
            }
        } else if (displayType === 'services') {
            message = 'No hay servicios disponibles';
            if (services.length === 0) {
                message += '. No se encontraron servicios en el sistema.';
            } else {
                message += ' con los filtros seleccionados.';
            }
        } else {
            message = 'No hay productos o servicios disponibles';
            if (products.length === 0 && services.length === 0) {
                message += '. El catálogo está vacío.';
            } else {
                message += ' con los filtros seleccionados.';
            }
        }

        itemsGrid.innerHTML = `
            <div class="text-center text-gray-500 col-span-full py-8">
                <p>${message}</p>
                <p class="mt-2 text-sm">
                    ${(products.length === 0 || services.length === 0) ?
                    'Para agregar productos o servicios, visite las secciones respectivas en el menú lateral.' :
                    'Intente cambiar los filtros o la búsqueda.'}
                </p>
            </div>
        `;
        return;
    }

    itemsGrid.innerHTML = items.map(item => {
        // Determine the item type - for 'all' view, use the type property we added
        const itemType = displayType === 'all' ? item.type : displayType;

        // Define badge style based on item type
        const badgeColor = itemType === 'products' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800';
        const badgeText = itemType === 'products' ? 'Producto' : 'Servicio';

        return `
        <div class="bg-white border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow relative">
            ${displayType === 'all' ?
                `<div class="absolute top-2 right-2">
                    <span class="text-xs font-medium ${badgeColor} px-2 py-0.5 rounded-full">${badgeText}</span>
                </div>` : ''}
            <div class="p-4">
                <div class="h-14 w-14 mx-auto mb-2">
                    <img src="${item.image}" alt="${item.name}" class="w-full h-full object-cover rounded-full">
                </div>
                <h3 class="text-sm font-medium text-gray-900 text-center truncate" title="${item.name}">${item.name}</h3>
                <p class="text-center text-gray-500 text-xs truncate mb-2" title="${item.description}">${item.description}</p>
                <div class="flex justify-center items-center mt-2">
                    <span class="text-md font-semibold text-gray-900">$${item.price.toFixed(2)}</span>
                    ${itemType === 'products' ?
                        `<span class="ml-2 text-xs text-gray-500">(${item.stock} en stock)</span>` :
                        `<span class="ml-2 text-xs text-gray-500">(${item.duration} min)</span>`
                    }
                </div>
                <button onclick="addToCart('${item.id}', '${itemType}')"
                        class="w-full mt-3 bg-blue-600 text-white py-1 rounded hover:bg-blue-700 text-sm flex items-center justify-center">
                    <i class="fas fa-plus mr-1"></i> Agregar
                </button>
            </div>
        </div>
        `;
    }).join('');
}

// Filter items based on search
function filterItems() {
    filterState.searchTerm = document.getElementById('itemSearch').value.toLowerCase().trim();
    applyFilters();
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

    // Separate products and services
    const productItems = sale.items.filter(item => item.type === 'products');
    const serviceItems = sale.items.filter(item => item.type === 'services');

    // Calculate subtotals
    const productSubtotal = productItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const serviceSubtotal = serviceItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

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
            ${productItems.length > 0 ? `
                <div class="mb-4">
                    <div class="flex items-center mb-2">
                        <div class="w-4 h-4 rounded-full bg-blue-100 border border-blue-300 mr-2"></div>
                        <h3 class="text-md font-medium text-blue-800">Productos</h3>
                    </div>
                    <table class="w-full text-sm">
                        <thead class="border-b border-gray-200 bg-blue-50">
                            <tr>
                                <th class="py-2 text-left text-blue-800">Descripción</th>
                                <th class="py-2 text-right text-blue-800">Cant.</th>
                                <th class="py-2 text-right text-blue-800">Precio</th>
                                <th class="py-2 text-right text-blue-800">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${productItems.map(item => `
                                <tr>
                                    <td class="py-2 text-left">${item.name}</td>
                                    <td class="py-2 text-right">${item.quantity}</td>
                                    <td class="py-2 text-right">$${item.price.toFixed(2)}</td>
                                    <td class="py-2 text-right">$${(item.price * item.quantity).toFixed(2)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colspan="3" class="py-2 text-right font-medium">Subtotal Productos:</td>
                                <td class="py-2 text-right text-blue-800 font-medium">$${productSubtotal.toFixed(2)}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            ` : ''}

            ${serviceItems.length > 0 ? `
                <div class="mb-4">
                    <div class="flex items-center mb-2">
                        <div class="w-4 h-4 rounded-full bg-purple-100 border border-purple-300 mr-2"></div>
                        <h3 class="text-md font-medium text-purple-800">Servicios</h3>
                    </div>
                    <table class="w-full text-sm">
                        <thead class="border-b border-gray-200 bg-purple-50">
                            <tr>
                                <th class="py-2 text-left text-purple-800">Descripción</th>
                                <th class="py-2 text-right text-purple-800">Cant.</th>
                                <th class="py-2 text-right text-purple-800">Precio</th>
                                <th class="py-2 text-right text-purple-800">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${serviceItems.map(item => `
                                <tr>
                                    <td class="py-2 text-left">${item.name}</td>
                                    <td class="py-2 text-right">${item.quantity}</td>
                                    <td class="py-2 text-right">$${item.price.toFixed(2)}</td>
                                    <td class="py-2 text-right">$${(item.price * item.quantity).toFixed(2)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colspan="3" class="py-2 text-right font-medium">Subtotal Servicios:</td>
                                <td class="py-2 text-right text-purple-800 font-medium">$${serviceSubtotal.toFixed(2)}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            ` : ''}

            <div class="border-t border-gray-200 pt-4 mt-4">
                <table class="w-full">
                    <tr>
                        <td class="py-1 text-right font-medium">Subtotal:</td>
                        <td class="py-1 text-right w-24">$${sale.subtotal.toFixed(2)}</td>
                    </tr>
                    <tr>
                        <td class="py-1 text-right font-medium">IVA (16%):</td>
                        <td class="py-1 text-right">$${sale.tax.toFixed(2)}</td>
                    </tr>
                    <tr class="border-t border-gray-200">
                        <td class="py-2 text-right font-bold text-lg">Total:</td>
                        <td class="py-2 text-right font-bold text-lg">$${sale.total.toFixed(2)}</td>
                    </tr>
                </table>
            </div>
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
                    .bg-blue-50 { background-color: #eff6ff; }
                    .bg-purple-50 { background-color: #f5f3ff; }
                    .text-blue-800 { color: #1e40af; }
                    .text-purple-800 { color: #6b21a8; }
                    .border-t { border-top: 1px solid #e5e7eb; }
                    .border-b { border-bottom: 1px solid #e5e7eb; }
                    .py-2 { padding-top: 8px; padding-bottom: 8px; }
                    .font-medium { font-weight: 500; }
                    .font-bold { font-weight: 700; }
                    .text-lg { font-size: 1.125rem; }
                    .text-sm { font-size: 0.875rem; }
                    .text-center { text-align: center; }
                    .mt-4 { margin-top: 1rem; }
                    .pt-4 { padding-top: 1rem; }
                    .mb-4 { margin-bottom: 1rem; }
                    .w-4 { width: 1rem; }
                    .h-4 { height: 1rem; }
                    .rounded-full { border-radius: 9999px; }
                    .inline-block { display: inline-block; }
                    .mr-2 { margin-right: 0.5rem; }
                    .flex { display: flex; }
                    .items-center { align-items: center; }
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

// Show sales report
function showSalesReport() {
    const reportContent = document.getElementById('salesReportContent');

    // Calculate basic statistics
    const totalSales = sales.length;
    if (totalSales === 0) {
        reportContent.innerHTML = `
            <div class="text-center py-8 text-gray-500">
                <i class="fas fa-exclamation-circle text-4xl mb-3"></i>
                <p>No hay ventas registradas aún.</p>
            </div>
        `;
        showModal('salesReportModal');
        return;
    }

    // Calculate revenue and item counts
    const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0);
    const productRevenue = sales.reduce((sum, sale) => {
        return sum + sale.items
            .filter(item => item.type === 'products')
            .reduce((itemSum, item) => itemSum + (item.price * item.quantity), 0);
    }, 0);
    const serviceRevenue = sales.reduce((sum, sale) => {
        return sum + sale.items
            .filter(item => item.type === 'services')
            .reduce((itemSum, item) => itemSum + (item.price * item.quantity), 0);
    }, 0);

    // Count products and services sold
    const totalProductsSold = sales.reduce((total, sale) => {
        return total + sale.items
            .filter(item => item.type === 'products')
            .reduce((sum, item) => sum + item.quantity, 0);
    }, 0);
    const totalServicesSold = sales.reduce((total, sale) => {
        return total + sale.items
            .filter(item => item.type === 'services')
            .reduce((sum, item) => sum + item.quantity, 0);
    }, 0);

    // Top selling products and services
    const productSales = {};
    const serviceSales = {};

    sales.forEach(sale => {
        sale.items.forEach(item => {
            if (item.type === 'products') {
                productSales[item.id] = (productSales[item.id] || 0) + item.quantity;
            } else {
                serviceSales[item.id] = (serviceSales[item.id] || 0) + item.quantity;
            }
        });
    });

    // Convert to arrays and sort
    const topProducts = Object.entries(productSales)
        .map(([id, quantity]) => {
            const product = products.find(p => p.id === id);
            return {
                name: product ? product.name : 'Producto desconocido',
                quantity
            };
        })
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 5);

    const topServices = Object.entries(serviceSales)
        .map(([id, quantity]) => {
            const service = services.find(s => s.id === id);
            return {
                name: service ? service.name : 'Servicio desconocido',
                quantity
            };
        })
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 5);

    // Payment method statistics
    const paymentMethods = {};
    sales.forEach(sale => {
        paymentMethods[sale.paymentMethod] = (paymentMethods[sale.paymentMethod] || 0) + 1;
    });

    // Create HTML content
    reportContent.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Sales Overview -->
            <div>
                <h3 class="text-lg font-bold mb-3">Resumen de Ventas</h3>
                <div class="bg-gray-50 rounded-lg p-4">
                    <div class="flex justify-between mb-2">
                        <span class="text-gray-700">Total de Ventas:</span>
                        <span class="font-medium">${totalSales}</span>
                    </div>
                    <div class="flex justify-between mb-2">
                        <span class="text-gray-700">Ingresos Totales:</span>
                        <span class="font-medium">$${totalRevenue.toFixed(2)}</span>
                    </div>
                </div>
            </div>

            <!-- Products vs Services -->
            <div>
                <h3 class="text-lg font-bold mb-3">Productos vs Servicios</h3>
                <div class="bg-gray-50 rounded-lg p-4">
                    <div class="mb-4">
                        <div class="flex justify-between mb-1">
                            <span class="text-blue-800 text-sm">Productos</span>
                            <span class="text-blue-800 text-sm">${Math.round((productRevenue / totalRevenue) * 100)}%</span>
                        </div>
                        <div class="w-full bg-gray-200 rounded-full h-2.5">
                            <div class="bg-blue-600 h-2.5 rounded-full" style="width: ${Math.round((productRevenue / totalRevenue) * 100)}%"></div>
                        </div>
                    </div>
                    <div>
                        <div class="flex justify-between mb-1">
                            <span class="text-purple-800 text-sm">Servicios</span>
                            <span class="text-purple-800 text-sm">${Math.round((serviceRevenue / totalRevenue) * 100)}%</span>
                        </div>
                        <div class="w-full bg-gray-200 rounded-full h-2.5">
                            <div class="bg-purple-600 h-2.5 rounded-full" style="width: ${Math.round((serviceRevenue / totalRevenue) * 100)}%"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Detailed Statistics -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <!-- Top Products -->
            <div>
                <h3 class="text-lg font-bold mb-3">Productos Más Vendidos</h3>
                <div class="bg-gray-50 rounded-lg p-4">
                    ${topProducts.length > 0 ? `
                        <ul class="divide-y divide-gray-200">
                            ${topProducts.map(product => `
                                <li class="py-2 flex justify-between">
                                    <span class="text-sm text-gray-700">${product.name}</span>
                                    <span class="text-sm font-medium">${product.quantity} uds.</span>
                                </li>
                            `).join('')}
                        </ul>
                    ` : '<p class="text-center text-gray-500">No hay datos disponibles</p>'}
                </div>
                <div class="mt-3 text-sm">
                    <div class="flex justify-between">
                        <span class="text-gray-700">Total de Productos Vendidos:</span>
                        <span class="font-semibold">${totalProductsSold} unidades</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-700">Ingresos por Productos:</span>
                        <span class="font-semibold text-blue-800">$${productRevenue.toFixed(2)}</span>
                    </div>
                </div>
            </div>

            <!-- Top Services -->
            <div>
                <h3 class="text-lg font-bold mb-3">Servicios Más Vendidos</h3>
                <div class="bg-gray-50 rounded-lg p-4">
                    ${topServices.length > 0 ? `
                        <ul class="divide-y divide-gray-200">
                            ${topServices.map(service => `
                                <li class="py-2 flex justify-between">
                                    <span class="text-sm text-gray-700">${service.name}</span>
                                    <span class="text-sm font-medium">${service.quantity} uds.</span>
                                </li>
                            `).join('')}
                        </ul>
                    ` : '<p class="text-center text-gray-500">No hay datos disponibles</p>'}
                </div>
                <div class="mt-3 text-sm">
                    <div class="flex justify-between">
                        <span class="text-gray-700">Total de Servicios Vendidos:</span>
                        <span class="font-semibold">${totalServicesSold} unidades</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-700">Ingresos por Servicios:</span>
                        <span class="font-semibold text-purple-800">$${serviceRevenue.toFixed(2)}</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Payment Methods -->
        <div class="mt-6">
            <h3 class="text-lg font-bold mb-3">Métodos de Pago</h3>
            <div class="bg-gray-50 rounded-lg p-4">
                <div class="grid grid-cols-3 gap-4">
                    ${Object.entries(paymentMethods).map(([method, count]) => `
                        <div class="text-center p-3 bg-white rounded-lg border">
                            <p class="text-2xl font-bold">${count}</p>
                            <p class="text-sm text-gray-700">${getPaymentMethodLabel(method)}</p>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;

    showModal('salesReportModal');
}

// Download sales report as CSV
function downloadSalesReport() {
    // Create CSV content
    const rows = [
        ['ID Venta', 'Fecha', 'Cliente', 'Tipo Item', 'Nombre', 'Cantidad', 'Precio', 'Subtotal', 'Total Venta', 'Método de Pago']
    ];

    sales.forEach(sale => {
        const saleDate = new Date(sale.completedAt || sale.date).toLocaleDateString('es-MX');
        const clientName = sale.client ? sale.client.name : 'Sin cliente';

        sale.items.forEach(item => {
            rows.push([
                sale.id,
                saleDate,
                clientName,
                item.type === 'products' ? 'Producto' : 'Servicio',
                item.name,
                item.quantity,
                item.price.toFixed(2),
                (item.price * item.quantity).toFixed(2),
                sale.total.toFixed(2),
                getPaymentMethodLabel(sale.paymentMethod)
            ]);
        });
    });

    // Convert to CSV string
    const csvContent = rows.map(row => row.join(',')).join('\n');

    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `ventas_dermacielo_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Initialize when the document loads
document.addEventListener('DOMContentLoaded', initPOS);
