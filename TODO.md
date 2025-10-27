## Correcciones (prioritarias)

1) workers: usar la VPN en docker-compose
   - Problema: El servicio de workers no tiene `network_mode: service:wireguard`, por lo que no sale por la VPN y no puede alcanzar la red interna para activar/desactivar servicios.
   - Impacto: Imposibilidad de gestionar dispositivos remotos cuando el infra/servicio requiere la VPN.
   - Paso de corrección sugerido:

     - En `docker-compose.yml`, para el servicio `workers` añadir:

       ```yaml
       services:
         workers:
           # ...existing config...
           network_mode: "service:wireguard"
       ```

     - Validación: el contenedor `workers` debe mostrar la misma IP/ruta que el servicio `wireguard` y poder alcanzar recursos internos.
   - Prioridad: Alta

2) Separar responsabilidad del worker (SOLID)
   - Problema: El worker depende del servicio `payment-webhook` y de la flag `WORKER_ENABLED=true`. Esto viola SRP y complica despliegue y testing.
   - Recomendación: Extraer la lógica del worker a un paquete/servicio independiente (npm package en otra carpeta). El proceso de worker debe consumir sólo del PGMQ/DB y exponer métricas/logging.
   - Pasos prácticos:
     - Extraer `src/lib/worker.ts` y módulos dependientes a un paquete independiente (por ejemplo `@widelink/pg-worker`).
     - Eliminar `WORKER_ENABLED` como mecanismo de acoplamiento.
   - Prioridad: Media-Alta

3) Imagen de Postgres / PGMQ: clarificar la elección
   - Observación: se está usando `public.ecr.aws/supabase/postgres:17.4.1.074` en lugar de `ghcr.io/pgmq/pg18-pgmq:v1.7.0` (recomendada por la documentación de PGMQ).
   - Recomendación: evaluar compatibilidad de extensiones (pgmq), versiones y soporte. Si no hay una razón explícita para usar la imagen de supabase, preferir la imagen recomendada por PGMQ para evitar incompatibilidades.
   - Acción sugerida: añadir una nota en el repo que explique la decisión en caso de usar la imagen de supabase.


## Recomendaciones (opcionales pero recomendadas)

1) Reducir polling usando LISTEN/NOTIFY de Postgres
   - Problema: `worker.ts` hace polling constante sobre la tabla de tareas, lo que genera muchas consultas y carga en la DB.
   - Beneficio: LISTEN/NOTIFY permite reaccionar a nuevos mensajes sin polling agresivo.
   - Ejemplo de listener en Node.js (usando `pg`):

     ```js
     // listener.js
     const { Client } = require('pg');

     async function setupListener() {
       const client = new Client({ connectionString: process.env.DATABASE_URL });
       await client.connect();
       await client.query('LISTEN pgmq_new_message');

       client.on('notification', (msg) => {
         // msg.channel === 'pgmq_new_message'
         // msg.payload puede contener el queue_name o el id del mensaje
         console.log('Received notification:', msg.channel, msg.payload);
         // disparar la lógica para procesar la cola
       });

       console.log('Listening for notifications on pgmq_new_message...');
     }

     setupListener().catch(console.error);
     ```

     Y el trigger/función SQL en Postgres:

     ```sql
     CREATE OR REPLACE FUNCTION notify_pgmq_enqueue()
     RETURNS TRIGGER AS $$
     BEGIN
       PERFORM pg_notify('pgmq_new_message', NEW.queue_name::text);
       RETURN NEW;
     END;
     $$ LANGUAGE plpgsql;

     CREATE TRIGGER pgmq_enqueue_trigger
     AFTER INSERT ON pgmq.queue_messages
     FOR EACH ROW EXECUTE FUNCTION notify_pgmq_enqueue();
     ```

   - Integración: `taskManager` usa `pg` — añadir la lógica de LISTEN/NOTIFY allí para despertar al worker. Mantener un fallback con polling lento por resiliencia.
   - Nota operativa: si se mantiene polling, restringirlo a una ventana y cadencia razonable (por ejemplo, cada 15 minutos entre 08:00–18:00) para evitar costes.

2) Usar librerías existentes para simplificar PGMQ
   - Ejemplo: `https://github.com/dvlkv/prisma-pgmq` puede reducir el código custom y los errores.
   - Recomendación: evaluar la librería en un branch experimental y validar compatibilidad con la versión de Postgres que usamos.


## Criterios de aceptación (DoD)

- Para la corrección de la VPN: `workers` en docker-compose debe poder alcanzar direcciones internas y se debe documentar el cambio en `README.md`.
- Para separar el worker: existir un paquete/repo o al menos una carpeta con package.json, y Dockerfile; despliegue independiente en compose.
- Para LISTEN/NOTIFY: listener en `taskManager` que recibe notificaciones, y la DB tiene trigger/función creada en staging; pruebas manuales donde una inserción provoca el procesamiento inmediato.


## Siguientes pasos (recomendado)

1. Aplicar el cambio mínimo en `docker-compose.yml` para `network_mode` y validar conectividad (responsable: devops / quien maneja compose). Tiempo estimado: 15-30 min.
2. Crear carpeta `wl-workers` y comenzar a extraer la lógica del worker a un paquete independiente.
3. Probar LISTEN/NOTIFY en un entorno de staging: añadir trigger en DB y listener en `taskManager`. Validar que reduce consultas.


## Recursos y referencias

- PGMQ / recomendaciones de imagen: revisar `https://github.com/pgmq/pgmq` y la documentación de la imagen `ghcr.io/pgmq/pg18-pgmq`.
- Ejemplo de librería: `https://github.com/dvlkv/prisma-pgmq`
- Conversación de referencia: `https://chatgpt.com/share/68ff8e0a-fd84-8001-8de9-bc1d1afe655c`
