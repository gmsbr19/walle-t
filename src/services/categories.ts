'use server'
import { prisma } from "@/lib/prisma"
import { getMonthDateInterval } from "@/utils/helpers"
import { $Enums } from "@/generated"

export async function getTransferTypeTotals(
    year: number,
    month: number,
    type: $Enums.TransactionType,
): Promise<{ settled: number; expected: number }> {
    const { start, end } = getMonthDateInterval(year, month)

    const transactionsByStatus = await prisma.transaction.groupBy({
        by: "isPaid",
        _sum: {
            amount: true,
        },
        where: {
            date: {
                gte: start,
                lt: end,
            },
            type,
        },
    })

    const totalGrouped = transactionsByStatus.reduce<Record<string, number>>(
        (acc, current) => {
            const chave = String(current.isPaid)
            const valor = current._sum.amount?.toNumber() ?? 0

            acc[chave] += valor

            return acc
        },
        { true: 0, false: 0 },
    )

    const settled = totalGrouped.true
    const expected = totalGrouped.true + totalGrouped.false

    return { settled, expected }
}

export async function getCategories(year: number, month: number) {
    const { start, end } = getMonthDateInterval(year, month)

    const transactions = await prisma.transaction.findMany({
        where: {
            date: { gte: start, lt: end },
            type: "EXPENSE",
            categoryId: { not: null }
        },
        select: {
            categoryId: true,
            amount: true,
        }
    })

    const spendingMap = transactions.reduce<Record<number, number>>((acc, curr) => {
        const id = curr.categoryId as number;
        
        // Aqui temos controle total da precisão
        const amount = curr.amount?.toNumber() ?? 0;
        
        acc[id] = (acc[id] || 0) + amount;
        return acc;
    }, {})

    const categories = await prisma.category.findMany({
        select: {
            id: true,
            parentId: true,
            name: true,
            monthlyBudget: true,
            color: true,
            parent: {
                select: { name: true, monthlyBudget: true, color: true },
            },
        },
    })

    type CategorySummary = {
        name: string
        available: number
        spent: number
        budget: number
        color: string
        status: "normal" | "warning" | "danger"
    }

    const report: Record<string, CategorySummary> = {}

    for (const cat of categories) {
        const targetData = cat.parent ?? cat
        const targetName = targetData.name

        if (!report[targetName]) {
            report[targetName] = {
                name: targetName,
                available: Number(targetData.monthlyBudget || 0),
                spent: 0,
                budget: Number(targetData.monthlyBudget || 0),
                color: targetData.color || "#ccc",
                status: "normal"
            }
        }

        const spentInCategory = spendingMap[cat.id] || 0;

        if (spentInCategory > 0) {
            report[targetName].spent += spentInCategory;
            report[targetName].available -= spentInCategory;
        }
    }

    return report
}

export async function getCategoriesNamesAndIds() {
    return await prisma.category.findMany({
        select: {
            id: true,
            name: true
        },
        where: {
            parentId: {
                not: null
            }
        }
    })
}