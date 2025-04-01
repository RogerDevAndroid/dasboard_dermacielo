// Product data management
let products = JSON.parse(localStorage.getItem('products')) || [];

// Product categories
const productCategories = [
    { id: 'facial', name: 'Cuidado Facial' },
    { id: 'corporal', name: 'Cuidado Corporal' },
    { id: 'capilar', name: 'Cuidado Capilar' },
    { id: 'maquillaje', name: 'Maquillaje' },
    { id: 'otro', name: 'Otro' }
];

// Modal Management
function showModal(modalId, productId = null) {
    const modal = document.getElementById(modalId);

    if (modal) {
        modal.classList.remove('hidden');

        if (modalId === 'createProductModal') {
            const modalTitle = document.getElementById('productModalTitle');
            const productForm = document.getElementById('productForm');

            // Clear form
            if (productForm) {
                productForm.reset();
                document.getElementById('productId').value = '';
            }

            if (productId) {
                // Edit mode
                const product = products.find(p => p.id === productId);
                if (product) {
                    modalTitle.textContent = 'Editar Producto';
                    document.getElementById('productId').value = product.id;
                    document.getElementById('productName').value = product.name;
                    document.getElementById('productCategory').value = product.category;
                    document.getElementById('productBrand').value = product.brand;
                    document.getElementById('productPrice').value = product.price;
                    document.getElementById('productStock').value = product.stock;
                    document.getElementById('productDescription').value = product.description || '';
                    document.getElementById('productStatus').value = product.status;
                    document.getElementById('productRequiresRecord').checked = product.requiresRecord || false;
                }
            } else {
                // Create mode
                modalTitle.textContent = 'Nuevo Producto';
            }
        } else if (modalId === 'deleteProductModal' && productId) {
            // Delete confirmation
            document.getElementById('deleteProductId').value = productId;
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
function handleProductSubmit(event) {
    event.preventDefault();

    const productId = document.getElementById('productId').value;
    const formData = {
        id: productId || Date.now().toString(),
        name: document.getElementById('productName').value,
        category: document.getElementById('productCategory').value,
        brand: document.getElementById('productBrand').value,
        price: parseFloat(document.getElementById('productPrice').value),
        stock: parseInt(document.getElementById('productStock').value, 10),
        description: document.getElementById('productDescription').value,
        status: document.getElementById('productStatus').value,
        requiresRecord: document.getElementById('productRequiresRecord').checked,
        creationDate: productId ? (products.find(p => p.id === productId)?.creationDate || new Date().toISOString()) : new Date().toISOString()
    };

    if (productId) {
        // Update existing product
        const index = products.findIndex(p => p.id === productId);
        if (index !== -1) {
            products[index] = formData;
        }
    } else {
        // Create new product
        products.push(formData);
    }

    // Save to localStorage
    localStorage.setItem('products', JSON.stringify(products));

    // Update table
    renderProductsTable();

    // Close modal
    hideModal('createProductModal');
}

// Delete product
function deleteProduct() {
    const productId = document.getElementById('deleteProductId').value;
    if (productId) {
        products = products.filter(product => product.id !== productId);
        localStorage.setItem('products', JSON.stringify(products));
        renderProductsTable();
        hideModal('deleteProductModal');
    }
}

// Get category name by ID
function getCategoryName(categoryId) {
    const category = productCategories.find(c => c.id === categoryId);
    return category ? category.name : 'Desconocida';
}

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN'
    }).format(amount);
}

// Filter products based on search term and category
function filterProducts() {
    const searchTerm = document.getElementById('searchProduct').value.toLowerCase();
    const categoryFilter = document.getElementById('categoryFilter').value;

    const filteredProducts = products.filter(product => {
        const matchesSearch =
            product.name.toLowerCase().includes(searchTerm) ||
            product.brand.toLowerCase().includes(searchTerm) ||
            (product.description && product.description.toLowerCase().includes(searchTerm));

        const matchesCategory = categoryFilter === '' || product.category === categoryFilter;

        return matchesSearch && matchesCategory;
    });

    renderProductsTable(filteredProducts);
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
        productCategories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            select.appendChild(option);
        });
    }
}

// Render products table
function renderProductsTable(productsToRender = products) {
    const tbody = document.getElementById('productsTableBody');
    if (tbody) {
        if (productsToRender.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="px-6 py-4 text-center text-sm text-gray-500">
                        No hay productos disponibles
                    </td>
                </tr>`;
            return;
        }

        tbody.innerHTML = productsToRender.map(product => `
            <tr>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                        <div class="flex-shrink-0">
                            <i class="fas fa-${getCategoryIcon(product.category)} text-${getCategoryColor(product.category)}-600 text-xl"></i>
                        </div>
                        <div class="ml-4">
                            <div class="text-sm font-medium text-gray-900">${product.name}</div>
                            <div class="text-xs text-gray-500">
                                ${product.brand}
                                ${product.requiresRecord ? ' <span class="text-amber-600 ml-2"><i class="fas fa-folder-open mr-1"></i>Requiere expediente</span>' : ''}
                            </div>
                        </div>
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-${getCategoryColor(product.category)}-100 text-${getCategoryColor(product.category)}-800">
                        ${getCategoryName(product.category)}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                    ${formatCurrency(product.price)}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span class="${getStockStatusClass(product.stock)}">
                        ${product.stock} unidades
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        product.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }">
                        ${product.status === 'active' ? 'Activo' : 'Inactivo'}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onclick="showModal('createProductModal', '${product.id}')"
                            class="text-indigo-600 hover:text-indigo-900 mr-3">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="showModal('deleteProductModal', '${product.id}')"
                            class="text-red-600 hover:text-red-900">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }
}

// Get stock status class
function getStockStatusClass(stock) {
    if (stock <= 0) return 'text-red-500 font-medium';
    if (stock <= 5) return 'text-amber-500 font-medium';
    return 'text-green-500 font-medium';
}

// Get category icon
function getCategoryIcon(category) {
    switch(category) {
        case 'facial':
            return 'face-smile';
        case 'corporal':
            return 'person';
        case 'capilar':
            return 'pump-soap';
        case 'maquillaje':
            return 'palette';
        default:
            return 'box';
    }
}

// Get category color
function getCategoryColor(category) {
    switch(category) {
        case 'facial':
            return 'pink';
        case 'corporal':
            return 'blue';
        case 'capilar':
            return 'purple';
        case 'maquillaje':
            return 'indigo';
        default:
            return 'gray';
    }
}

// Initialize product system
function initProducts() {
    // Setup demo data if none exists
    if (products.length === 0) {
        const demoProducts = [
            {
                id: 'prod1',
                name: 'Crema Hidratante Anti-edad',
                category: 'facial',
                brand: 'Natura Derm',
                price: 580,
                stock: 15,
                description: 'Crema facial hidratante con propiedades anti-edad y protección solar.',
                status: 'active',
                requiresRecord: false,
                creationDate: new Date().toISOString()
            },
            {
                id: 'prod2',
                name: 'Serum con Ácido Hialurónico',
                category: 'facial',
                brand: 'SkinCeuticals',
                price: 850,
                stock: 8,
                description: 'Serum concentrado con ácido hialurónico para hidratación profunda.',
                status: 'active',
                requiresRecord: true,
                creationDate: new Date().toISOString()
            },
            {
                id: 'prod3',
                name: 'Gel Post-Depilación',
                category: 'corporal',
                brand: 'Derma Cool',
                price: 320,
                stock: 12,
                description: 'Gel calmante para aplicar después de la depilación láser.',
                status: 'active',
                requiresRecord: false,
                creationDate: new Date().toISOString()
            },
            {
                id: 'prod4',
                name: 'Loción Tonificante',
                category: 'capilar',
                brand: 'Hair Plus',
                price: 450,
                stock: 5,
                description: 'Loción tonificante para fortalecer el cuero cabelludo.',
                status: 'active',
                requiresRecord: false,
                creationDate: new Date().toISOString()
            }
        ];

        products = demoProducts;
        localStorage.setItem('products', JSON.stringify(products));
    }

    // Setup event listeners for filters
    const searchInput = document.getElementById('searchProduct');
    const categoryFilter = document.getElementById('categoryFilter');

    if (searchInput) searchInput.addEventListener('input', filterProducts);
    if (categoryFilter) categoryFilter.addEventListener('change', filterProducts);

    // Populate category filter
    populateCategoryFilter();

    // Render products table
    renderProductsTable();
}

// Initialize when document loads
document.addEventListener('DOMContentLoaded', initProducts);
