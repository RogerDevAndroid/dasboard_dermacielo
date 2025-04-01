// Script para generar datos de prueba para el sistema POS de Dermacielo

// Función para generar un ID único
function generateId() {
  return Date.now().toString() + Math.floor(Math.random() * 1000);
}

// Función para generar una fecha aleatoria en los próximos 10 días
function generateRandomDate(daysRange = 10) {
  const today = new Date();
  const futureDate = new Date();
  futureDate.setDate(today.getDate() + Math.floor(Math.random() * daysRange));
  return futureDate.toISOString();
}

// Función para crear un cliente de prueba
function createTestClient() {
  return {
    id: generateId(),
    firstName: "Cliente" + Math.floor(Math.random() * 100),
    lastName: "Apellido" + Math.floor(Math.random() * 100),
    email: `cliente${Math.floor(Math.random() * 100)}@example.com`,
    phone: `55${Math.floor(Math.random() * 10000000).toString().padStart(8, '0')}`,
    status: 'active',
    creationDate: new Date().toISOString()
  };
}

// Función para crear una cita de prueba para un cliente
function createTestAppointment(clientId, daysFromNow = null) {
  const date = daysFromNow !== null
    ? (() => {
        const d = new Date();
        d.setDate(d.getDate() + daysFromNow);
        return d.toISOString();
      })()
    : generateRandomDate();

  return {
    id: generateId(),
    clientId: clientId,
    date: date,
    service: "Consulta Dermatológica",
    status: "confirmed",
    notes: "Cita de prueba generada automáticamente"
  };
}

// Crear o obtener los datos actuales
let clients = JSON.parse(localStorage.getItem('clients')) || [];
let appointments = JSON.parse(localStorage.getItem('appointments')) || [];

// Generar 10 clientes de prueba si no hay suficientes
if (clients.length < 10) {
  const newClients = Array(10 - clients.length).fill(null).map(() => createTestClient());
  clients = [...clients, ...newClients];
  localStorage.setItem('clients', JSON.stringify(clients));
  console.log(`Se generaron ${newClients.length} clientes de prueba`);
}

// Limpiar citas existentes y crear nuevas
appointments = [];

// Crear citas activas (próximos 7 días) para algunos clientes
const clientsWithActiveAppointments = clients.slice(0, 5); // Primeros 5 clientes tendrán citas activas

clientsWithActiveAppointments.forEach((client, index) => {
  // Cita en el día actual o en los próximos días (dentro de los 7 días)
  const daysFromNow = index; // 0, 1, 2, 3, 4 días desde hoy
  appointments.push(createTestAppointment(client.id, daysFromNow));
});

// Crear algunas citas para fechas futuras (más de 7 días)
const clientsWithFutureAppointments = clients.slice(5, 8); // Estos clientes tendrán citas futuras

clientsWithFutureAppointments.forEach((client) => {
  // Citas entre 8 y 20 días en el futuro
  const daysFromNow = 8 + Math.floor(Math.random() * 12);
  appointments.push(createTestAppointment(client.id, daysFromNow));
});

// Guardar las citas en localStorage
localStorage.setItem('appointments', JSON.stringify(appointments));
console.log(`Se generaron ${appointments.length} citas de prueba`);

// Resumen de datos generados
console.log("Resumen de datos de prueba:");
console.log(`- Total de clientes: ${clients.length}`);
console.log(`- Clientes con citas en próximos 7 días: ${clientsWithActiveAppointments.length}`);
console.log(`- Clientes con citas futuras: ${clientsWithFutureAppointments.length}`);
console.log(`- Total de citas: ${appointments.length}`);

// Mostrar los primeros 3 clientes para referencia
console.log("Ejemplos de clientes para búsqueda:");
clientsWithActiveAppointments.slice(0, 3).forEach(client => {
  console.log(`- ${client.firstName} ${client.lastName} (${client.phone}) - Tiene cita activa`);
});
