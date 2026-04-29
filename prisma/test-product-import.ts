import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const productData = {
        "id": "38ef3f26-5f44-4540-bf4c-48a86a8c0e00",
        "name": "ADFD5448AT.ASTESNA",
        "width": 705,
        "depth": 705,
        "height": 860,
        "weight": 43,
        "cbm": 0.427442,
        "division": "",
        "notes": "",
        "categoryId": "9350f885-c0f0-4f45-9b67-e55dd3bb8d75",
        "authorId": "719db27f-f349-4d22-a036-b9c1c1fcb753",
        "createdAt": new Date("2025-12-01T16:59:51.075Z"),
        "updatedAt": new Date("2025-12-01T16:59:51.075Z")
    }

    console.log('Attempting to create product:', productData)

    try {
        const result = await prisma.product.create({
            data: productData
        })
        console.log('Success:', result)
    } catch (e) {
        console.error('Error:', e)
    } finally {
        await prisma.$disconnect()
    }
}

main()
