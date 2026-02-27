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

type RawYearMonth = { year: number | bigint; month: number | bigint };

export async function getTransactionYearMonths(
  useCompetenceDate = false
) {
  const rows = useCompetenceDate
    ? await prisma.$queryRaw<RawYearMonth[]>`
        SELECT DISTINCT
          CAST(strftime('%Y', "competenceDate") AS INTEGER) AS year,
          CAST(strftime('%m', "competenceDate") AS INTEGER) AS month
        FROM "Transaction"
        ORDER BY year DESC, month DESC
      `
    : await prisma.$queryRaw<RawYearMonth[]>`
        SELECT DISTINCT
          CAST(strftime('%Y', "date") AS INTEGER) AS year,
          CAST(strftime('%m', "date") AS INTEGER) AS month
        FROM "Transaction"
        ORDER BY year DESC, month DESC
      `;

  const grouped = new Map<number, number[]>();

  for (const row of rows) {
    const year = Number(row.year);
    const month = Number(row.month);

    const months = grouped.get(year) ?? [];
    months.push(month);
    grouped.set(year, months);
  }

  return [...grouped.entries()].map(([year, months]) => ({
    year,
    months: [...new Set(months)].sort((a, b) => a - b),
  }));
}