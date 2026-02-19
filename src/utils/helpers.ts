export function getTransactionVariant(t: any) {
    if (t.type === "INCOME") return "income"

    const mainCategoryName = t.category?.parent?.name || t.category?.name || ""

    if (mainCategoryName.includes("Survival")) return "survival"
    if (mainCategoryName.includes("Eudaimonia")) return "eudaimonia"
    if (mainCategoryName.includes("Resilience")) return "resilience"

    return "transfer"
}

export function getMonthDateInterval(
    year: number,
    month: number,
): { start: Date; end: Date } {
    const start = new Date(Date.UTC(year, month - 1, 1))
    const end = new Date(Date.UTC(year, month, 1))

    return { start, end }
}
