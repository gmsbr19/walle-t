import { prisma } from "@/lib/prisma"
import { getMonthDateInterval } from "@/utils/helpers"

export type GroupedTransactions = Record<string, Awaited<ReturnType<typeof getRawTransactions>>>

async function getRawTransactions(year: number, month: number) {
    const {start, end} = getMonthDateInterval(year, month)

    return await prisma.transaction.findMany({
        where: {
            date: { gte: start, lt: end }
        },
        include: {
            category: {
                include: { parent: true }
            }
        },
        orderBy: { date: 'desc' }
    })
}

export async function getDailyHistory(year: number, month: number) {
    const rawData = await getRawTransactions(year, month)

    const grouped = rawData.reduce((acc, transaction) => {
        const dateKey = transaction.date.toISOString().split('T')[0]
        
        if (!acc[dateKey]) {
            acc[dateKey] = []
        }
        
        acc[dateKey].push(transaction)
        return acc
    }, {} as GroupedTransactions)

    return grouped
}