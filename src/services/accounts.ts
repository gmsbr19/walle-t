'use server'
import { prisma } from "@/lib/prisma"

export const getAccountsNamesAndIds = async () => {
    return await prisma.account.findMany({
        select: {
            id: true,
            name: true
        },
    })
}