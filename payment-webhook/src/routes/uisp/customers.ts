import { FastifyInstance } from "fastify";
import { UISP, Client } from "../../lib/uisp/index.ts";
import { getCustomerOnuDetails } from '../../lib/uisp/utilities/clients.js';
import { env } from "../../lib/uisp/env.ts";

export default async function uispCustomersRoutes(fastify: FastifyInstance) {
  fastify.get("/uisp/customers/:id/onu", async (request, reply) => {
    const { id } = request.params as { id: string };
    const customerId = parseInt(id, 10);

    const baseUrl = env.UISP_URL;
    const apiKey = env.UISP_KEY;

    const uisp = new UISP(baseUrl, apiKey)

    const customer = await uisp.customers.get(customerId) as Client[]
    const customers = [customer]
    const onuDetails = getCustomerOnuDetails(customers)

    if (!onuDetails || onuDetails.length === 0) {
      return reply.status(404).send({
        message: `No ONU found for customer ${customerId}`,
      });
    }

    return {
      serial: onuDetails[0].serial,
      mac: onuDetails[0].mac
    };
  });
}
