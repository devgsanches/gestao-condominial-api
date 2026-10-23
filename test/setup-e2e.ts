import 'dotenv/config'

import { execSync } from 'node:child_process'
import { randomUUID } from 'node:crypto'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../generated/prisma/client'

function generateUniqueDatabaseURL(schemaId: string) {
	if (!process.env.DATABASE_URL) {
		throw new Error('Please provide a DATABASE_URL environment variable.')
	}

	const url = new URL(process.env.DATABASE_URL)

	url.searchParams.set('schema', schemaId)

	return url.toString()
}

function createPrismaClient(connectionString: string) {
	const schema = new URL(connectionString).searchParams.get('schema')

	return new PrismaClient({
		adapter: new PrismaPg(
			{ connectionString },
			{ schema: schema ?? undefined },
		),
	})
}

const originalDatabaseURL = process.env.DATABASE_URL
const schemaId = randomUUID()
const databaseURL = generateUniqueDatabaseURL(schemaId)

// Precisa ser no carregamento do módulo: o ConfigModule.forRoot do AppModule
// captura o DATABASE_URL no import, antes dos hooks beforeAll.
process.env.DATABASE_URL = databaseURL

async function dropTestSchema() {
	if (!originalDatabaseURL) {
		return
	}

	const adminUrl = new URL(originalDatabaseURL)
	adminUrl.searchParams.set('schema', 'public')

	const admin = createPrismaClient(adminUrl.toString())

	try {
		await admin.$executeRawUnsafe(`DROP SCHEMA IF EXISTS "${schemaId}" CASCADE`)
	} finally {
		await admin.$disconnect()
	}
}

beforeAll(async () => {
	try {
		execSync('pnpm prisma db push --config prisma7.config.ts', {
			env: process.env,
			stdio: 'pipe',
		})
	} catch (error) {
		await dropTestSchema()
		throw error
	}
})

afterAll(async () => {
	await dropTestSchema()
})
