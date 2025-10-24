import Fastify from "fastify";
import { DeviceManager } from "./sdk/device_manager.js";
const fastify = Fastify({ logger: true });
fastify.post("/reconnect", async (request, reply) => {
    try {
        const { device, mac } = request.body;
        if (!device || !mac) {
            return reply.status(400).send({ error: "device y mac son requeridos" });
        }
        const olt = await new DeviceManager(device).connect();
        if (!olt) {
            return reply.status(500).send({ error: "No se pudo conectar al OLT" });
        }
        const result = await olt.onus.enable(mac);
        return { success: true, mac, result };
    }
    catch (err) {
        request.log.error(err);
        return reply.status(500).send({ error: "Error al reconectar usuario" });
    }
});
const start = async () => {
    try {
        await fastify.listen({ port: 3000, host: "0.0.0.0" });
        console.log("Reconnect API escuchando en puerto 3000");
    }
    catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};
start();
//# sourceMappingURL=index.js.map