document.addEventListener('DOMContentLoaded', () => {
    // Elementos DOM
    const calendarEl = document.getElementById('calendar');
    const appointmentsList = document.getElementById('appointmentsList');
    const timeSlotsContainer = document.getElementById('timeSlots');
    const appointmentModal = document.getElementById('appointmentModal');
    const closeModalBtn = document.getElementById('closeModal');
    const appointmentForm = document.getElementById('appointmentForm');
    const editAppointmentModal = document.getElementById('editAppointmentModal');
    const editAppointmentForm = document.getElementById('editAppointmentForm');
    const closeEditModalBtn = document.getElementById('closeEditModal');
    const selectedDateEl = document.getElementById('selectedDate');
    const searchInput = document.getElementById('searchAppointment');

    // Estado
    let currentDate = new Date();
    let selectedDate = null;
    let currentMonth = currentDate.getMonth();
    let currentYear = currentDate.getFullYear();
    let appointments = [];
    let services = [];
    let clients = [];
    let selectedAppointment = null;

    // Inicialización
    initCalendar();
    fetchAppointments();
    fetchServices();
    fetchClients();

    // Eventos
    document.getElementById('prevMonth').addEventListener('click', () => changeMonth(-1));
    document.getElementById('nextMonth').addEventListener('click', () => changeMonth(1));
    document.getElementById('newAppointmentBtn').addEventListener('click', openNewAppointmentModal);
    closeModalBtn.addEventListener('click', closeModal);
    closeEditModalBtn.addEventListener('click', closeEditModal);
    appointmentForm.addEventListener('submit', handleCreateAppointment);
    editAppointmentForm.addEventListener('submit', handleUpdateAppointment);
    searchInput.addEventListener('input', handleSearch);

    // Funciones
    function initCalendar() {
        const monthYearEl = document.getElementById('monthYear');
        monthYearEl.textContent = getMonthYearString(currentMonth, currentYear);
        renderCalendar(currentMonth, currentYear);

        // Inicializar la fecha seleccionada como hoy
        selectedDate = new Date();
        updateSelectedDate();
        renderTimeSlots();
    }

    function fetchAppointments() {
        // Intentar cargar citas desde localStorage
        let storedAppointments = localStorage.getItem('appointments');

        if (storedAppointments) {
            appointments = JSON.parse(storedAppointments);
        } else {
            // Crear datos de demostración si no existen citas en localStorage
            appointments = [
                {
                    id: 1,
                    clientId: "1", // Aseguramos que los ID sean strings para compatibilidad
                    clientName: "María García",
                    serviceId: "2",
                    serviceName: "Limpieza Facial",
                    date: "2025-04-01",
                    time: "10:00",
                    duration: 60,
                    status: "Confirmada",
                    notes: "Primera visita"
                },
                {
                    id: 2,
                    clientId: "3",
                    clientName: "Juan Pérez",
                    serviceId: "1",
                    serviceName: "Consulta Dermatológica",
                    date: "2025-04-01",
                    time: "14:30",
                    duration: 30,
                    status: "Pendiente",
                    notes: ""
                },
                {
                    id: 3,
                    clientId: "2",
                    clientName: "Ana Martínez",
                    serviceId: "3",
                    serviceName: "Tratamiento Antiacné",
                    date: "2025-04-02",
                    time: "11:00",
                    duration: 45,
                    status: "Confirmada",
                    notes: "Seguimiento mensual"
                }
            ];

            // Guardar las citas de demostración en localStorage
            localStorage.setItem('appointments', JSON.stringify(appointments));
        }

        renderAppointmentsList();
        highlightDatesWithAppointments();
    }

    function fetchServices() {
        // Simulamos los datos para demostración
        services = [
            { id: 1, name: "Consulta Dermatológica", duration: 30, price: 60 },
            { id: 2, name: "Limpieza Facial", duration: 60, price: 45 },
            { id: 3, name: "Tratamiento Antiacné", duration: 45, price: 55 },
            { id: 4, name: "Peeling Químico", duration: 30, price: 70 },
            { id: 5, name: "Aplicación de Bótox", duration: 45, price: 150 },
        ];

        // Llenar los selects de servicios
        const serviceSelect = document.getElementById('service');
        const editServiceSelect = document.getElementById('editService');

        services.forEach(service => {
            serviceSelect.innerHTML += `<option value="${service.id}">${service.name} (${service.duration} min - $${service.price})</option>`;
            editServiceSelect.innerHTML += `<option value="${service.id}">${service.name} (${service.duration} min - $${service.price})</option>`;
        });
    }

    function fetchClients() {
        // Simulamos los datos para demostración
        clients = [
            { id: 1, name: "María García", email: "maria@ejemplo.com", phone: "555-1234" },
            { id: 2, name: "Ana Martínez", email: "ana@ejemplo.com", phone: "555-5678" },
            { id: 3, name: "Juan Pérez", email: "juan@ejemplo.com", phone: "555-9012" },
            { id: 4, name: "Carlos López", email: "carlos@ejemplo.com", phone: "555-3456" },
        ];

        // Llenar los selects de clientes
        const clientSelect = document.getElementById('client');
        const editClientSelect = document.getElementById('editClient');

        clients.forEach(client => {
            clientSelect.innerHTML += `<option value="${client.id}">${client.name} (${client.phone})</option>`;
            editClientSelect.innerHTML += `<option value="${client.id}">${client.name} (${client.phone})</option>`;
        });
    }

    function renderCalendar(month, year) {
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = 32 - new Date(year, month, 32).getDate();
        const calendarDays = document.getElementById('calendarDays');

        // Limpiamos el calendario
        calendarDays.innerHTML = '';

        // Agregamos los días vacíos al inicio
        for (let i = 0; i < firstDay; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.className = 'calendar-day';
            calendarDays.appendChild(emptyDay);
        }

        // Agregamos los días del mes
        for (let i = 1; i <= daysInMonth; i++) {
            const day = document.createElement('div');
            day.className = 'calendar-day flex items-center justify-center border bg-white rounded-lg hover:bg-gray-50 cursor-pointer relative';

            // Verificar si es el día actual
            const today = new Date();
            if (year === today.getFullYear() && month === today.getMonth() && i === today.getDate()) {
                day.classList.add('bg-blue-50', 'border-blue-200');
            }

            // Verificar si es el día seleccionado
            if (selectedDate && year === selectedDate.getFullYear() &&
                month === selectedDate.getMonth() && i === selectedDate.getDate()) {
                day.classList.add('bg-blue-100', 'border-blue-300', 'font-bold');
            }

            day.innerHTML = `<span>${i}</span>`;

            // Evento al hacer clic en un día
            day.addEventListener('click', () => {
                selectedDate = new Date(year, month, i);
                updateSelectedDate();
                renderCalendar(month, year);
                renderTimeSlots();
                filterAppointmentsByDate();
            });

            calendarDays.appendChild(day);
        }
    }

    function changeMonth(delta) {
        currentMonth += delta;

        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        } else if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }

        const monthYearEl = document.getElementById('monthYear');
        monthYearEl.textContent = getMonthYearString(currentMonth, currentYear);

        renderCalendar(currentMonth, currentYear);
        highlightDatesWithAppointments();
    }

    function getMonthYearString(month, year) {
        const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                           'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        return `${monthNames[month]} ${year}`;
    }

    function updateSelectedDate() {
        if (selectedDate) {
            const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            selectedDateEl.textContent = selectedDate.toLocaleDateString('es-ES', options);
        }
    }

    function renderTimeSlots() {
        if (!selectedDate) return;

        timeSlotsContainer.innerHTML = '';

        // Horario de atención: 9:00 - 18:00
        const startHour = 9;
        const endHour = 18;
        const interval = 30; // minutos

        const selectedDateStr = formatDate(selectedDate);
        const bookedSlots = appointments
            .filter(app => app.date === selectedDateStr)
            .map(app => ({
                time: app.time,
                endTime: calculateEndTime(app.time, app.duration)
            }));

        for (let hour = startHour; hour < endHour; hour++) {
            for (let min = 0; min < 60; min += interval) {
                const timeStr = `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;

                // Verificar si el horario ya está reservado
                const isBooked = isTimeSlotBooked(timeStr, bookedSlots);

                const timeSlot = document.createElement('div');
                timeSlot.className = `time-slot p-3 border rounded-lg text-center ${isBooked ? 'bg-gray-100 disabled' : 'bg-white hover:bg-blue-50 cursor-pointer'}`;
                timeSlot.innerHTML = `
                    <span class="font-medium">${timeStr}</span>
                `;

                if (!isBooked) {
                    timeSlot.addEventListener('click', () => openNewAppointmentModal(timeStr));
                }

                timeSlotsContainer.appendChild(timeSlot);
            }
        }
    }

    function isTimeSlotBooked(timeStr, bookedSlots) {
        for (const slot of bookedSlots) {
            if (timeStr >= slot.time && timeStr < slot.endTime) {
                return true;
            }
        }
        return false;
    }

    function calculateEndTime(startTime, durationMinutes) {
        const [hours, minutes] = startTime.split(':').map(Number);
        const totalMinutes = hours * 60 + minutes + durationMinutes;
        const endHours = Math.floor(totalMinutes / 60);
        const endMinutes = totalMinutes % 60;
        return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
    }

    function formatDate(date) {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    function openNewAppointmentModal(timeStr = '') {
        if (selectedDate) {
            const dateInput = document.getElementById('appointmentDate');
            dateInput.value = formatDate(selectedDate);

            if (timeStr) {
                const timeInput = document.getElementById('appointmentTime');
                timeInput.value = timeStr;
            }

            appointmentModal.classList.remove('hidden');
        } else {
            alert('Por favor, selecciona una fecha primero');
        }
    }

    function closeModal() {
        appointmentModal.classList.add('hidden');
        appointmentForm.reset();
    }

    function closeEditModal() {
        editAppointmentModal.classList.add('hidden');
        editAppointmentForm.reset();
    }

    function handleCreateAppointment(e) {
        e.preventDefault();

        const formData = new FormData(appointmentForm);
        const clientId = parseInt(formData.get('client'));
        const serviceId = parseInt(formData.get('service'));

        // Encontrar el cliente y servicio correspondientes
        const client = clients.find(c => c.id === clientId);
        const service = services.find(s => s.id === serviceId);

        const newAppointment = {
            id: appointments.length + 1,
            clientId,
            clientName: client.name,
            serviceId,
            serviceName: service.name,
            date: formData.get('appointmentDate'),
            time: formData.get('appointmentTime'),
            duration: service.duration,
            status: formData.get('status'),
            notes: formData.get('notes')
        };

        appointments.push(newAppointment);

        // Guardar citas en localStorage
        localStorage.setItem('appointments', JSON.stringify(appointments));

        closeModal();
        renderAppointmentsList();
        renderTimeSlots();
        highlightDatesWithAppointments();

        showToast('Cita creada con éxito', 'success');
    }

    function renderAppointmentsList() {
        // Primero filtramos por la fecha seleccionada
        filterAppointmentsByDate();
    }

    function filterAppointmentsByDate() {
        appointmentsList.innerHTML = '';

        if (!selectedDate) return;

        const dateStr = formatDate(selectedDate);
        const filteredAppointments = appointments.filter(app => app.date === dateStr);

        if (filteredAppointments.length === 0) {
            appointmentsList.innerHTML = `
                <div class="text-center p-6 text-gray-500">
                    <i class="fas fa-calendar-xmark text-4xl mb-3"></i>
                    <p>No hay citas programadas para este día</p>
                </div>
            `;
            return;
        }

        // Ordenar por hora
        filteredAppointments.sort((a, b) => a.time.localeCompare(b.time));

        filteredAppointments.forEach(appointment => {
            const endTime = calculateEndTime(appointment.time, appointment.duration);

            const card = document.createElement('div');
            card.className = 'appointment-card bg-white rounded-lg border p-4 mb-3 shadow-sm';
            card.innerHTML = `
                <div class="flex justify-between items-start">
                    <div>
                        <h3 class="font-medium">${appointment.clientName}</h3>
                        <p class="text-sm text-gray-600">${appointment.serviceName}</p>
                        <div class="flex items-center mt-2">
                            <i class="far fa-clock mr-1 text-gray-500"></i>
                            <span class="text-sm">${appointment.time} - ${endTime}</span>
                        </div>
                    </div>
                    <div>
                        <span class="px-2 py-1 rounded-full text-xs ${getStatusClass(appointment.status)}">${appointment.status}</span>
                    </div>
                </div>
                <div class="mt-3 flex justify-between items-center">
                    <div class="text-xs text-gray-500">
                        ${appointment.notes ? appointment.notes : 'Sin notas'}
                    </div>
                    <div class="flex space-x-2">
                        <button data-id="${appointment.id}" class="edit-btn text-blue-600 hover:text-blue-800">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button data-id="${appointment.id}" class="delete-btn text-red-600 hover:text-red-800">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                </div>
            `;

            // Agregar eventos a los botones
            card.querySelector('.edit-btn').addEventListener('click', () => openEditModal(appointment.id));
            card.querySelector('.delete-btn').addEventListener('click', () => deleteAppointment(appointment.id));

            appointmentsList.appendChild(card);
        });
    }

    function getStatusClass(status) {
        switch (status) {
            case 'Confirmada':
                return 'bg-green-100 text-green-700';
            case 'Pendiente':
                return 'bg-yellow-100 text-yellow-700';
            case 'Cancelada':
                return 'bg-red-100 text-red-700';
            case 'Completada':
                return 'bg-blue-100 text-blue-700';
            default:
                return 'bg-gray-100 text-gray-700';
        }
    }

    function highlightDatesWithAppointments() {
        // Marcar en el calendario los días que tienen citas
        const calendarDays = document.querySelectorAll('#calendarDays .calendar-day');
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        const firstDay = new Date(currentYear, currentMonth, 1).getDay();

        // Crear un conjunto de fechas con citas
        const datesWithAppointments = new Set();
        appointments.forEach(app => {
            const [year, month, day] = app.date.split('-').map(Number);
            if (year === currentYear && month - 1 === currentMonth) {
                datesWithAppointments.add(day);
            }
        });

        // Resaltar los días con citas
        datesWithAppointments.forEach(day => {
            const dayIndex = firstDay + day - 1;
            if (dayIndex >= 0 && dayIndex < calendarDays.length && day <= daysInMonth) {
                const indicator = document.createElement('div');
                indicator.className = 'absolute bottom-1 w-1.5 h-1.5 bg-blue-500 rounded-full';

                // Verificar si ya existe un indicador
                if (!calendarDays[dayIndex].querySelector('.absolute')) {
                    calendarDays[dayIndex].appendChild(indicator);
                }
            }
        });
    }

    function openEditModal(appointmentId) {
        selectedAppointment = appointments.find(app => app.id === appointmentId);

        if (selectedAppointment) {
            document.getElementById('editAppointmentId').value = selectedAppointment.id;
            document.getElementById('editClient').value = selectedAppointment.clientId;
            document.getElementById('editService').value = selectedAppointment.serviceId;
            document.getElementById('editAppointmentDate').value = selectedAppointment.date;
            document.getElementById('editAppointmentTime').value = selectedAppointment.time;
            document.getElementById('editStatus').value = selectedAppointment.status;
            document.getElementById('editNotes').value = selectedAppointment.notes;

            editAppointmentModal.classList.remove('hidden');
        }
    }

    function handleUpdateAppointment(e) {
        e.preventDefault();

        const formData = new FormData(editAppointmentForm);
        const appointmentId = parseInt(formData.get('appointmentId'));
        const clientId = parseInt(formData.get('client'));
        const serviceId = parseInt(formData.get('service'));

        // Encontrar el cliente y servicio correspondientes
        const client = clients.find(c => c.id === clientId);
        const service = services.find(s => s.id === serviceId);

        // Actualizar la cita
        const appointmentIndex = appointments.findIndex(app => app.id === appointmentId);

        if (appointmentIndex !== -1) {
            appointments[appointmentIndex] = {
                ...appointments[appointmentIndex],
                clientId,
                clientName: client.name,
                serviceId,
                serviceName: service.name,
                date: formData.get('appointmentDate'),
                time: formData.get('appointmentTime'),
                duration: service.duration,
                status: formData.get('status'),
                notes: formData.get('notes')
            };

            // Guardar citas actualizadas en localStorage
            localStorage.setItem('appointments', JSON.stringify(appointments));

            closeEditModal();
            renderAppointmentsList();
            renderTimeSlots();
            highlightDatesWithAppointments();

            showToast('Cita actualizada con éxito', 'success');
        }
    }

    function deleteAppointment(appointmentId) {
        if (confirm('¿Estás seguro de que deseas eliminar esta cita?')) {
            const appointmentIndex = appointments.findIndex(app => app.id === appointmentId);

            if (appointmentIndex !== -1) {
                appointments.splice(appointmentIndex, 1);

                // Guardar citas actualizadas en localStorage
                localStorage.setItem('appointments', JSON.stringify(appointments));

                renderAppointmentsList();
                renderTimeSlots();
                highlightDatesWithAppointments();

                showToast('Cita eliminada con éxito', 'success');
            }
        }
    }

    function handleSearch(e) {
        const searchTerm = e.target.value.toLowerCase();

        if (!searchTerm) {
            filterAppointmentsByDate();
            return;
        }

        appointmentsList.innerHTML = '';

        const filteredAppointments = appointments.filter(app =>
            app.clientName.toLowerCase().includes(searchTerm) ||
            app.serviceName.toLowerCase().includes(searchTerm) ||
            app.status.toLowerCase().includes(searchTerm)
        );

        if (filteredAppointments.length === 0) {
            appointmentsList.innerHTML = `
                <div class="text-center p-6 text-gray-500">
                    <i class="fas fa-search text-4xl mb-3"></i>
                    <p>No se encontraron resultados para "${searchTerm}"</p>
                </div>
            `;
            return;
        }

        filteredAppointments.forEach(appointment => {
            const endTime = calculateEndTime(appointment.time, appointment.duration);

            const card = document.createElement('div');
            card.className = 'appointment-card bg-white rounded-lg border p-4 mb-3 shadow-sm';
            card.innerHTML = `
                <div class="flex justify-between items-start">
                    <div>
                        <h3 class="font-medium">${appointment.clientName}</h3>
                        <p class="text-sm text-gray-600">${appointment.serviceName}</p>
                        <div class="flex items-center mt-2">
                            <i class="far fa-clock mr-1 text-gray-500"></i>
                            <span class="text-sm">${appointment.time} - ${endTime}</span>
                        </div>
                        <div class="text-xs text-gray-500 mt-1">
                            <i class="far fa-calendar mr-1"></i>
                            ${formatReadableDate(appointment.date)}
                        </div>
                    </div>
                    <div>
                        <span class="px-2 py-1 rounded-full text-xs ${getStatusClass(appointment.status)}">${appointment.status}</span>
                    </div>
                </div>
                <div class="mt-3 flex justify-between items-center">
                    <div class="text-xs text-gray-500">
                        ${appointment.notes ? appointment.notes : 'Sin notas'}
                    </div>
                    <div class="flex space-x-2">
                        <button data-id="${appointment.id}" class="edit-btn text-blue-600 hover:text-blue-800">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button data-id="${appointment.id}" class="delete-btn text-red-600 hover:text-red-800">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                </div>
            `;

            // Agregar eventos a los botones
            card.querySelector('.edit-btn').addEventListener('click', () => openEditModal(appointment.id));
            card.querySelector('.delete-btn').addEventListener('click', () => deleteAppointment(appointment.id));

            appointmentsList.appendChild(card);
        });
    }

    function formatReadableDate(dateStr) {
        const [year, month, day] = dateStr.split('-');
        const date = new Date(year, month - 1, day);
        return date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
    }

    function showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `fixed bottom-4 right-4 p-4 rounded-lg shadow-lg text-white flex items-center space-x-2 z-50 ${type === 'success' ? 'bg-green-600' : 'bg-blue-600'}`;
        toast.innerHTML = `
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-info-circle'}"></i>
            <span>${message}</span>
        `;

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('opacity-0', 'transition-opacity', 'duration-500');
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 500);
        }, 3000);
    }
});
