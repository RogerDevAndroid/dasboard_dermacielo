// Service data management
let services = JSON.parse(localStorage.getItem('services')) || [];

// Service categories
const serviceCategories = [
    { id: 'facial', name: 'Tratamiento Facial' },
    { id: 'corporal', name: 'Tratamiento Corporal' },
    { id: 'depilacion', name: 'Depilación Láser' },
    { id: 'masaje', name: 'Masajes' },
    { id: 'otro', name: 'Otro' }
];

// Modal Management
function showModal(modalId, serviceId = null) {
    const modal = document.getElementById(modalId);

    if (modal) {
        modal.classList.remove('hidden');

        if (modalId === 'createServiceModal') {
            const modalTitle = document.getElementById('serviceModalTitle');
            const serviceForm = document.getElementById('serviceForm');

            // Clear form
            if (serviceForm) {
                serviceForm.reset();
                document.getElementById('serviceId').value = '';
            }

            if (serviceId) {
                // Edit mode
                const service = services.find(s => s.id === serviceId);
                if (service) {
                    modalTitle.textContent = 'Editar Servicio';
                    document.getElementById('serviceId').value = service.id;
                    document.getElementById('serviceName').value = service.name;
                    document.getElementById('serviceCategory').value = service.category;
                    document.getElementById('serviceDuration').value = service.duration;
                    document.getElementById('servicePrice').value = service.price;
                    document.getElementById('serviceDescription').value = service.description || '';
                    document.getElementById('serviceStatus').value = service.status;
                    document.getElementById('serviceRequiresRecord').checked = service.requiresRecord || false;
                }
            } else {
                // Create mode
                modalTitle.textContent = 'Nuevo Servicio';
            }
        } else if (modalId === 'deleteServiceModal' && serviceId) {
            // Delete confirmation
            document.getElementById('deleteServiceId').value = serviceId;
        }

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

// Form Submission
function handleServiceSubmit(event) {
    event.preventDefault();

    const serviceId = document.getElementById('serviceId').value;
    const formData = {
        id: serviceId || Date.now().toString(),
        name: document.getElementById('serviceName').value,
        category: document.getElementById('serviceCategory').value,
        duration: parseInt(document.getElementById('serviceDuration').value, 10),
        price: parseFloat(document.getElementById('servicePrice').value),
        description: document.getElementById('serviceDescription').value,
        status: document.getElementById('serviceStatus').value,
        requiresRecord: document.getElementById('serviceRequiresRecord').checked,
        creationDate: serviceId ? (services.find(s => s.id === serviceId)?.creationDate || new Date().toISOString()) : new Date().toISOString()
    };

    if (serviceId) {
        // Update existing service
        const index = services.findIndex(s => s.id === serviceId);
        if (index !== -1) {
            services[index] = formData;
        }
    } else {
        // Create new service
        services.push(formData);
    }

    // Save to localStorage
    localStorage.setItem('services', JSON.stringify(services));

    // Update table
    renderServicesTable();

    // Close modal
    hideModal('createServiceModal');
}

// Delete service
function deleteService() {
    const serviceId = document.getElementById('deleteServiceId').value;
    if (serviceId) {
        services = services.filter(service => service.id !== serviceId);
        localStorage.setItem('services', JSON.stringify(services));
        renderServicesTable();
        hideModal('deleteServiceModal');
    }
}

// Get category name by ID
function getCategoryName(categoryId) {
    const category = serviceCategories.find(c => c.id === categoryId);
    return category ? category.name : 'Desconocida';
}

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN'
    }).format(amount);
}

// Format duration
function formatDuration(minutes) {
    if (minutes < 60) {
        return `${minutes} min`;
    } else {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
    }
}

// Filter services based on search term and category
function filterServices() {
    const searchTerm = document.getElementById('searchService').value.toLowerCase();
    const categoryFilter = document.getElementById('categoryFilter').value;

    const filteredServices = services.filter(service => {
        const matchesSearch =
            service.name.toLowerCase().includes(searchTerm) ||
            (service.description && service.description.toLowerCase().includes(searchTerm));

        const matchesCategory = categoryFilter === '' || service.category === categoryFilter;

        return matchesSearch && matchesCategory;
    });

    renderServicesTable(filteredServices);
}

// Populate category filter
function populateCategoryFilter() {
    const select = document.getElementById('categoryFilter');
    if (select) {
        // Clear existing options except the first empty one
        while (select.options.length > 1) {
            select.remove(1);
        }

        // Add categories as options
        serviceCategories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            select.appendChild(option);
        });
    }
}

// Render services table
function renderServicesTable(servicesToRender = services) {
    const tbody = document.getElementById('servicesTableBody');
    if (tbody) {
        if (servicesToRender.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="px-6 py-4 text-center text-sm text-gray-500">
                        No hay servicios disponibles
                    </td>
                </tr>`;
            return;
        }

        tbody.innerHTML = servicesToRender.map(service => `
            <tr>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                        <div class="flex-shrink-0">
                            <i class="fas fa-${getCategoryIcon(service.category)} text-${getCategoryColor(service.category)}-600 text-xl"></i>
                        </div>
                        <div class="ml-4">
                            <div class="text-sm font-medium text-gray-900">${service.name}</div>
                            <div class="text-xs text-gray-500">
                                ${service.requiresRecord ? '<span class="text-amber-600"><i class="fas fa-folder-open mr-1"></i>Requiere expediente</span>' : ''}
                            </div>
                        </div>
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-${getCategoryColor(service.category)}-100 text-${getCategoryColor(service.category)}-800">
                        ${getCategoryName(service.category)}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${formatDuration(service.duration)}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                    ${formatCurrency(service.price)}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        service.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }">
                        ${service.status === 'active' ? 'Activo' : 'Inactivo'}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onclick="showModal('createServiceModal', '${service.id}')"
                            class="text-indigo-600 hover:text-indigo-900 mr-3">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="showModal('deleteServiceModal', '${service.id}')"
                            class="text-red-600 hover:text-red-900">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }
}

// Get category icon
function getCategoryIcon(category) {
    switch(category) {
        case 'facial':
            return 'face-smile';
        case 'corporal':
            return 'person';
        case 'depilacion':
            return 'wand-magic-sparkles';
        case 'masaje':
            return 'hand-holding-heart';
        default:
            return 'spa';
    }
}

// Get category color
function getCategoryColor(category) {
    switch(category) {
        case 'facial':
            return 'pink';
        case 'corporal':
            return 'blue';
        case 'depilacion':
            return 'purple';
        case 'masaje':
            return 'green';
        default:
            return 'gray';
    }
}

// Initialize service system
function initServices() {
    // Setup demo data if none exists
    if (services.length === 0) {
        const demoServices = [
            {
                id: 'svc1',
                name: 'Limpieza Facial Profunda',
                category: 'facial',
                duration: 60,
                price: 800,
                description: 'Limpieza facial completa con extracción de impurezas y mascarilla hidratante.',
                status: 'active',
                requiresRecord: true,
                creationDate: new Date().toISOString()
            },
            {
                id: 'svc2',
                name: 'Depilación Láser Piernas Completas',
                category: 'depilacion',
                duration: 90,
                price: 1200,
                description: 'Depilación láser para piernas completas. Se recomienda de 6 a 8 sesiones.',
                status: 'active',
                requiresRecord: true,
                creationDate: new Date().toISOString()
            },
            {
                id: 'svc3',
                name: 'Masaje Relajante',
                category: 'masaje',
                duration: 45,
                price: 650,
                description: 'Masaje corporal para aliviar tensión y estrés.',
                status: 'active',
                requiresRecord: false,
                creationDate: new Date().toISOString()
            },
            {
                id: 'svc4',
                name: 'Tratamiento Reductivo',
                category: 'corporal',
                duration: 120,
                price: 1500,
                description: 'Tratamiento para reducir medidas y combatir la celulitis.',
                status: 'active',
                requiresRecord: true,
                creationDate: new Date().toISOString()
            }
        ];

        services = demoServices;
        localStorage.setItem('services', JSON.stringify(services));
    }

    // Setup event listeners for filters
    const searchInput = document.getElementById('searchService');
    const categoryFilter = document.getElementById('categoryFilter');

    if (searchInput) searchInput.addEventListener('input', filterServices);
    if (categoryFilter) categoryFilter.addEventListener('change', filterServices);

    // Populate category filter
    populateCategoryFilter();

    // Render services table
    renderServicesTable();
}

// Initialize when document loads
document.addEventListener('DOMContentLoaded', initServices);
