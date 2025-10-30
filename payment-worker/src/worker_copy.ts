import { PrismaClient, TaskStatus } from '@prisma/client';
import { Client } from 'pg';
import { TaskManager } from './lib/taskManager.js';
import { connectionString } from './prisma.js';
import { PaymentEventPayload } from './functions/types.js';
import { env } from './lib/uisp/env.js';
import { UISP, Client as UispClient } from './lib/uisp/index.js';
import { getCustomerOnuDetails } from './lib/uisp/utilities/clients.js';
import { DeviceManager } from "./lib/device-manager/sdk/device_manager.js";
import { LabsMobile } from "./lib/labsmobile/index.js";
import { logger } from './lib/logger.js';
import { getOltByIp } from "./lib/olt_services.js";

export async function startWorker() {

	const prisma = new PrismaClient();
	const pgmq_queue: string = process.env.RECONNECTION_PGMQ_QUEUE!;
	const labsmobile_username: string = process.env.LABSMOBILE_USERNAME!;
	const labsmobile_token: string = process.env.LABSMOBILE_TOKEN!;
	const labsmobile_msg: string = process.env.LABSMOBILE_MSG!;
	const reconnection_url: string = process.env.RECONNECTION_URL!;

	function normalizePhone(phone?: string | null): string | null {
	if (!phone) return null;

	// 1️⃣ Eliminar todo lo que no sea número o +
	let cleaned = phone.replace(/[^\d+]/g, "");

	// 2️⃣ Quitar el "+" si empieza con +57
	if (cleaned.startsWith("+57")) {
	cleaned = cleaned.replace("+", "");
	}

	// 3️⃣ Si empieza con "0", quitarlo y anteponer "57"
	else if (cleaned.startsWith("0")) {
	cleaned = "57" + cleaned.slice(1);
	}

	// 4️⃣ Si empieza con "3" (número local sin prefijo)
	else if (cleaned.startsWith("3")) {
	cleaned = "57" + cleaned;
	}

	// 5️⃣ Si ya empieza con "57" lo dejamos igual
	else if (!cleaned.startsWith("57")) {
	cleaned = "57" + cleaned;
	}

	// 6️⃣ Validar longitud: después del "57", deben venir 10 dígitos exactos
	const digits = cleaned.slice(2);
	if (digits.length !== 10) {
	console.warn(`⚠️ Invalid phone number: ${phone}`);
	logger.info(`⚠️ Invalid phone number: ${phone}`);
	return null;
	}
	return cleaned;
	}

	async function main() {
	const pgClient = new Client({ connectionString });
	const taskManager = new TaskManager(pgClient, pgmq_queue);
	logger.info('🧩 Connecting to PostgreSQL and initializing TaskManager...');
	await taskManager.init();

	logger.info('👷 Worker started. Listening for tasks...');

	// Graceful shutdown
	const shutdown = async () => {
	logger.info('🛑 Shutting down worker...');
	await pgClient.end();
	await prisma.$disconnect();
	process.exit(0);
	};

	process.on('SIGINT', shutdown);
	process.on('SIGTERM', shutdown);

	while (true) {
	const task = await taskManager.getNextTask();

	if (!task) {
		await new Promise(res => setTimeout(res, 2000));
		continue;
	}

	const { msgId, payload } = task;
	const { paymentEventId } = payload;

	logger.info(`📩 Processing paymentEventId=${paymentEventId}`);

	try {
		// 1. Obtener PaymentEvent
		const event = await prisma.paymentEvent.findUnique({
		where: { id: paymentEventId },
		});

		if (!event) {
		logger.info(`❌ PaymentEvent ${paymentEventId} not found`);
		await taskManager.ackTask(msgId); // Evitar reprocesar
		continue;
		}

		// 2. Lógica de negocio
		const data = event.payload as PaymentEventPayload;

		if (!data || typeof data.clientId !== "number") {
		logger.info(`❌ Invalid payload: missing clientId`);
		throw new Error(`❌ Invalid payload: missing clientId`);
		}

		const clientId = data.clientId;
		const amount = data?.amount ?? 0;

		const baseUrl = env.UISP_URL;
		const apiKey = env.UISP_KEY;

		const uisp = new UISP(baseUrl, apiKey)
		logger.info(`Fetching customer information from UISP for client ID ${clientId}...`);
		const customer = await uisp.customers.get(clientId) as UispClient[]
		const customers = [customer]

		if (!customers || customers.length === 0) {
		throw new Error(`No customer data found in UISP for client ID ${clientId}`);
		}

		// 🔍 Buscar valores dentro de attributes
		const customerAtt = Array.isArray(customer) ? customer[0] : customer;
		const findAttr = (key: string) =>
		customerAtt.attributes?.find((a) => a.key === key)?.value ?? null;

		let status: TaskStatus;
		let message: string;

		const oltUrl = findAttr("oltIp");

		if (!oltUrl) {
		throw new Error(`Missing oltIp for client ${clientId}`);
		}

		logger.info(`🔧 OLT IP for client ${clientId}: ${oltUrl}`);

		const oltCredentials = await getOltByIp(oltUrl);
		if (
		!oltCredentials ||
		!oltCredentials.type ||
		!oltCredentials.username ||
		!oltCredentials.password ||
		oltCredentials.type.trim() === '' ||
		oltCredentials.username.trim() === '' ||
		oltCredentials.password.trim() === ''
		) {
		throw new Error("❌ OLT credentials are incomplete or invalid");
		}

		logger.info("🔧 OLT Data:", oltCredentials);

		const onuDetails = getCustomerOnuDetails(customers)

		if (!onuDetails || onuDetails.length === 0) {
		status = TaskStatus.FAILED;
		logger.info(`No ONU found for customer ${clientId}`);
		throw new Error(`No ONU found for customer ${clientId}`);
		}

		// const hasValidSerial = onuDetails.some(o => o.serial && o.serial.trim() !== "");
		const hasValidSerial = onuDetails.find(
		o => o.serial && o.serial.trim() !== "" && o.mac && o.mac.trim() !== ""
		);

		if (hasValidSerial) {

		const { serial, mac } = hasValidSerial;

		logger.info(`🔧 Technical data → MAC: ${mac}, Serial: ${serial}`);

		// Construir el body para el Device Manager
		const device = {
			id: clientId,
			name: oltCredentials.type,
			type: oltCredentials.type,
			url: oltUrl,
			username: oltCredentials.username,
			password: oltCredentials.password,
		};

		const device_test = {
			id: 1,
			name: 'UF-OLT-4',
			type: 'UF-OLT-4',
			url: 'https://10.40.3.4',
			username: 'ubnt',
			password: 'victor2030',
		}

		logger.info(`🔌 Connecting to OLT for client ${clientId}...`);
		const olt = await new DeviceManager(device_test).connect();

		if (!olt) {
			logger.info(`❌ Failed to connect to OLT for client ${clientId}`);
			throw new Error(`Could not connect to the OLT`);
		}

		logger.info(`✅ Connected to OLT. Starting service reactivation for client ${clientId} (Serial: ${serial})...`);

		const result = (await olt.onus.enable('UBNT9a060cea')) as {
			error?: number;
			statusCode?: number;
			message?: string;
			[key: string]: any;
		}

		logger.info(`📡 OLT response for client ${clientId}: ${JSON.stringify(result)}`);

		if (
			result &&
			result.error === 0 &&
			result.statusCode === 200 &&
			/success/i.test(result.message || '')
		) {

			console.log(`✅ Client ${clientId}: service activated successfully`);
			logger.info(`✅ Client ${clientId}: service activated successfully`);
			const phone =
			findAttr("telefonoSms") ||
			customerAtt.contacts?.[0]?.phone ||
			null;

			const sms_phone = normalizePhone(phone);

			logger.info(`📱 Phone → Input: ${phone} | Normalized: ${sms_phone} ✅`);
			if (sms_phone) {
			try {
				const sms_client = await new LabsMobile(labsmobile_username, labsmobile_token);
				const response = await sms_client.sendSMS(labsmobile_msg, ['573015883764']);
				logger.info(`✅ Message successfully sent to number ${sms_phone}: ${JSON.stringify(response)}`);
			} catch (err) {
				logger.error(`⚠️ Failed to send message to ${sms_phone}:`, err.message || err);
			}
			}

			status = TaskStatus.SUCCESS;
			message = `Client ${clientId}: service activated successfully`;

		} else {
			status = TaskStatus.SKIPPED;
			message = `Failed to reconnect client ${clientId}`;
		}

		await prisma.paymentTaskLog.updateMany({
			where: { paymentEventId },
			data: { status, message },
		});

		await taskManager.ackTask(msgId);

		logger.info(`✅ Task ${paymentEventId} processed: ${status}`);
		}

	} catch (err) {
		logger.error(`❌ Error processing task: ${err.message}\n${err.stack}`);

		const current = await prisma.paymentTaskLog.findFirst({ where: { paymentEventId } });
		const retries = (current?.retries ?? 0) + 1;

		await prisma.paymentTaskLog.updateMany({
		where: { paymentEventId },
		data: { retries },
		});

		if (retries < 3) {
		logger.info(`⚠️ Retrying task ${paymentEventId} (attempt ${retries} of 3)`);

		// Esperar antes de reintentar
		await new Promise(res => setTimeout(res, 5000));

		// Re-encolar el job
		// await taskManager.sendTask({ paymentEventId });
		const taskLog = await taskManager.createTask(paymentEventId);

		await prisma.paymentTaskLog.updateMany({
			where: { paymentEventId },
			data: {
			status: TaskStatus.PENDING,
			message: (err as Error).message,
			retries: retries,
			pgmqMessageId: taskLog.pgmqMessageId,
			},
		});

		} else {
		logger.error(`❌ Task ${paymentEventId} failed permanently`);
		await prisma.paymentTaskLog.updateMany({
			where: { paymentEventId },
			data: {
			status: "FAILED",
			message: (err as Error).message,
			},
		});
		}

		// try {
		//   await prisma.paymentTaskLog.updateMany({
		//     where: { paymentEventId, status: TaskStatus.PENDING },
		//     data: { status: TaskStatus.FAILED, message: (err as Error).message },
		//   });
		// } catch (dbErr) {
		//   console.error('❌ Failed to update error status:', dbErr);
		// }

		// Acknowledge para evitar reprocessar indefinidamente
		await taskManager.ackTask(msgId);
	}
	}
};

  main().catch(err => {
    console.error('Worker fatal error:', err);
    process.exit(1);
  });

}
