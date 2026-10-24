const budgetInput = document.getElementById("budget");
const saveBudgetButton = document.getElementById("saveBudget");
const totalBudgetElement = document.getElementById("totalBudget");
const totalSpentElement = document.getElementById("totalSpent");
const remainingElement = document.getElementById("remaining");
const budgetAlert = document.getElementById("budgetAlert");

const expenseForm = document.getElementById("expenseForm");
const titleInput = document.getElementById("title");
const categoryInput = document.getElementById("category");
const amountInput = document.getElementById("amount");
const dateInput = document.getElementById("expenseDate");
const formMessage = document.getElementById("formMessage");

const expenseList = document.getElementById("expenseList");
const emptyMessage = document.getElementById("emptyMessage");
const savingsTip = document.getElementById("savingsTip");

let expenses = [];
let expenseChart = null;
let monthlyBudget = Number(localStorage.getItem("studentBudget")) || 0;

// Set today's date automatically.
const today = new Date();
dateInput.value = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0")
].join("-");

// Display the saved budget.
budgetInput.value = monthlyBudget || "";
totalBudgetElement.textContent = formatMoney(monthlyBudget);

function formatMoney(amount) {
    return "₹" + Number(amount).toLocaleString("en-IN", {
        maximumFractionDigits: 2
    });
}

// Save the monthly budget.
saveBudgetButton.addEventListener("click", function () {
    const budget = Number(budgetInput.value);

    if (!Number.isFinite(budget) || budget <= 0) {
        budgetAlert.textContent = "Please enter a valid budget greater than zero.";
        return;
    }

    monthlyBudget = budget;
    localStorage.setItem("studentBudget", String(monthlyBudget));

    totalBudgetElement.textContent = formatMoney(monthlyBudget);
    budgetAlert.textContent = "Monthly budget saved successfully!";

    updateDashboard();
});

// Add a new expense.
expenseForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const expense = {
        title: titleInput.value.trim(),
        category: categoryInput.value,
        amount: Number(amountInput.value),
        expense_date: dateInput.value
    };

    if (
        !expense.title ||
        !expense.category ||
        !Number.isFinite(expense.amount) ||
        expense.amount <= 0 ||
        !expense.expense_date
    ) {
        formMessage.textContent = "Please enter valid expense details.";
        return;
    }

    try {
        const response = await fetch("/api/expenses", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(expense)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || "Could not add expense.");
        }

        formMessage.textContent = "Expense added successfully!";
        expenseForm.reset();

        // Restore today's date after resetting the form.
        dateInput.value = [
            today.getFullYear(),
            String(today.getMonth() + 1).padStart(2, "0"),
            String(today.getDate()).padStart(2, "0")
        ].join("-");

 await loadExpenses();

const monthlyExpenses = getMonthlyExpenses();

const totalSpent = monthlyExpenses.reduce(
    (sum, expense) => sum + Number(expense.amount),
    0
);

if (monthlyBudget > 0 && totalSpent > monthlyBudget) {
    showPersonalPopup(
        "⚠️ Hey! You've exceeded your monthly budget. Try to reduce unnecessary expenses!"
    );
} else if (monthlyBudget > 0 && totalSpent >= monthlyBudget * 0.8) {
    showPersonalPopup(
        "⚠️ Careful! You've used 80% of your monthly budget. Spend wisely!"
    );
} else {
    showPersonalPopup(
        "💚 Great job! Your expense has been added. Keep tracking your spending!"
    );
}
    } catch (error) {
        formMessage.textContent =
            error.message || "Could not connect to the server.";
    }
});

// Load expenses from the Flask backend.
async function loadExpenses() {
    try {
        const response = await fetch("/api/expenses");

        if (!response.ok) {
            throw new Error("Unable to load expenses.");
        }

        expenses = await response.json();
        displayExpenses();
updateDashboard();
updateChart();
updateSavingsTip();
updateMonthlyComparison();
updateWeeklyReport();
updateBudgetAlert();
updateDailySummary();
updateMonthlyReportCard();
    } catch (error) {
        formMessage.textContent =
            "Could not load expenses. Please check that Flask is running.";
    }
}
function displayExpenses() {
    const searchText = document
        .getElementById("searchExpense")
        .value.trim().toLowerCase();

    const selectedCategory =
        document.getElementById("filterCategory").value;

    const filteredExpenses = expenses.filter(function (expense) {
        return (
            expense.title.toLowerCase().includes(searchText) &&
            (
                selectedCategory === "" ||
                expense.category === selectedCategory
            )
        );
    });

    expenseList.replaceChildren();

    emptyMessage.style.display =
        filteredExpenses.length === 0 ? "block" : "none";

    filteredExpenses.forEach(function (expense) {
        const row = document.createElement("tr");

        [expense.title, expense.category, formatMoney(expense.amount),
            expense.expense_date].forEach(function (value) {
            const cell = document.createElement("td");
            cell.textContent = value;
            row.appendChild(cell);
        });

        const actionCell = document.createElement("td");
        const deleteButton = document.createElement("button");

        deleteButton.textContent = "Delete";
        deleteButton.type = "button";

        deleteButton.addEventListener("click", function () {
            deleteExpense(expense.id);
        });

        actionCell.appendChild(deleteButton);
        row.appendChild(actionCell);
        expenseList.appendChild(row);
    });
}

async function deleteExpense(id) {
    if (!confirm("Are you sure you want to delete this expense?")) {
        return;
    }

    try {
        const response = await fetch(`/api/expenses/${id}`, {
            method: "DELETE"
        });

        const result = await response.json();

        if (!response.ok) {
            alert(result.error || "Failed to delete expense");
            return;
        }

        alert("Expense deleted successfully!");

        // Refresh expense history
        await loadExpenses();

    } catch (error) {
        console.error("Delete error:", error);
        alert("Unable to delete expense. Please try again.");
    }
}

async function deleteExpense(id) {
    if (!confirm("Are you sure you want to delete this expense?")) {
        return;
    }

    try {
        const response = await fetch(`/api/expenses/${id}`, {
            method: "DELETE"
        });

        const result = await response.json();

        if (!response.ok) {
            alert(result.error || "Failed to delete expense");
            return;
        }

        alert("Expense deleted successfully!");

        // Refresh expense history
        await loadExpenses();

    } catch (error) {
        console.error("Delete error:", error);
        alert("Unable to delete expense. Please try again.");
    }
}

// Calculate this month's spending.
function getMonthlyExpenses() {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return expenses.filter(function (expense) {
        const expenseDate = new Date(
            expense.expense_date + "T00:00:00"
        );

        return (
            expenseDate.getMonth() === currentMonth &&
            expenseDate.getFullYear() === currentYear
        );
    });
}

// Update budget, spending and remaining balance.
function updateDashboard() {
    const monthlyExpenses = getMonthlyExpenses();

    const totalSpent = monthlyExpenses.reduce(function (sum, expense) {
        return sum + Number(expense.amount || 0);
    }, 0);

    const remaining = monthlyBudget - totalSpent;

    totalBudgetElement.textContent = formatMoney(monthlyBudget);
    totalSpentElement.textContent = formatMoney(totalSpent);
    remainingElement.textContent = formatMoney(remaining);

    updateBudgetAlert();
}

// Draw a chart showing spending by category this month.
function updateChart() {
    const canvas = document.getElementById("expenseChart");

    if (typeof Chart === "undefined") {
        savingsTip.textContent =
            "The chart library did not load. Check your internet connection.";
        return;
    }

    const monthlyExpenses = getMonthlyExpenses();
    const categoryTotals = {};

    monthlyExpenses.forEach(function (expense) {
        categoryTotals[expense.category] =
            (categoryTotals[expense.category] || 0) +
            Number(expense.amount);
    });

    const labels = Object.keys(categoryTotals);
    const values = Object.values(categoryTotals);

    if (expenseChart) {
        expenseChart.destroy();
    }

    expenseChart = new Chart(canvas, {
        type: "doughnut",
        data: {
            labels: labels.length ? labels : ["No expenses yet"],
            datasets: [{
                data: values.length ? values : [1]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: "bottom"
                }
            }
        }
    });
}

// Give simple, rule-based savings suggestions.
function updateSavingsTip() {
    const monthlyExpenses = getMonthlyExpenses();

    if (monthlyExpenses.length === 0) {
        savingsTip.textContent =
            "Tip: Add your first expense to receive a spending suggestion.";
        return;
    }

    const categoryTotals = {};

    monthlyExpenses.forEach(function (expense) {
        categoryTotals[expense.category] =
            (categoryTotals[expense.category] || 0) +
            Number(expense.amount);
    });

    const highestCategory = Object.keys(categoryTotals).reduce(
        function (highest, category) {
            return categoryTotals[category] > categoryTotals[highest]
                ? category
                : highest;
        },
        Object.keys(categoryTotals)[0]
    );

    savingsTip.textContent =
        "Your highest-spending category this month is " +
        highestCategory +
        " (" + formatMoney(categoryTotals[highestCategory]) +
        "). Review this category to find possible savings.";
}

// Load saved expenses when the page opens.
loadExpenses();
const downloadCsvButton = document.getElementById("downloadCsv");

downloadCsvButton.addEventListener("click", function () {
    window.location.href = "/api/expenses/export";
});
const searchExpense = document.getElementById("searchExpense");
const filterCategory = document.getElementById("filterCategory");

// Search by expense name
searchExpense.addEventListener("input", function () {
    displayExpenses();
});

// Filter by category
filterCategory.addEventListener("change", function () {
    displayExpenses();
});

// Show only matching expenses
function displayExpenses() {
    const searchText = searchExpense.value.trim().toLowerCase();
    const selectedCategory = filterCategory.value;

    const filteredExpenses = expenses.filter(function (expense) {
        const matchesName = expense.title
            .toLowerCase()
            .includes(searchText);

        const matchesCategory =
            selectedCategory === "" ||
            expense.category === selectedCategory;

        return matchesName && matchesCategory;
    });

    expenseList.replaceChildren();

    emptyMessage.style.display =
        filteredExpenses.length === 0 ? "block" : "none";

    filteredExpenses.forEach(function (expense) {
        const row = document.createElement("tr");

        const titleCell = document.createElement("td");
        titleCell.textContent = expense.title;

        const categoryCell = document.createElement("td");
        categoryCell.textContent = expense.category;

        const amountCell = document.createElement("td");
        amountCell.textContent = formatMoney(expense.amount);

        const dateCell = document.createElement("td");
        dateCell.textContent = expense.expense_date;

        const actionCell = document.createElement("td");
        const deleteButton = document.createElement("button");

        deleteButton.textContent = "Delete";
        deleteButton.type = "button";
        deleteButton.addEventListener("click", function () {
            deleteExpense(expense.id);
        });

        actionCell.appendChild(deleteButton);

        row.append(
            titleCell,
            categoryCell,
            amountCell,
            dateCell,
            actionCell
        );

        expenseList.appendChild(row);
    });
}
document.getElementById("searchExpense")
    .addEventListener("input", displayExpenses);

document.getElementById("filterCategory")
    .addEventListener("change", displayExpenses);
    function updateMonthlyComparison() {
    const now = new Date();

    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    const previousDate = new Date(
        currentYear,
        currentMonth - 1,
        1
    );

    const previousYear = previousDate.getFullYear();
    const previousMonth = previousDate.getMonth();

    let currentTotal = 0;
    let previousTotal = 0;

    expenses.forEach(function (expense) {
        const expenseDate = new Date(
            expense.expense_date + "T00:00:00"
        );

        const amount = Number(expense.amount);

        if (
            expenseDate.getFullYear() === currentYear &&
            expenseDate.getMonth() === currentMonth
        ) {
            currentTotal += amount;
        }

        if (
            expenseDate.getFullYear() === previousYear &&
            expenseDate.getMonth() === previousMonth
        ) {
            previousTotal += amount;
        }
    });

    document.getElementById("currentMonthTotal").textContent =
        formatMoney(currentTotal);

    document.getElementById("previousMonthTotal").textContent =
        formatMoney(previousTotal);

    const message = document.getElementById(
        "monthlyComparisonMessage"
    );

    if (previousTotal === 0 && currentTotal === 0) {
        message.textContent =
            "No expenses recorded for this month or last month.";
    } else if (previousTotal === 0) {
        message.textContent =
            "No expenses were recorded last month. Keep tracking to compare spending.";
    } else {
        const difference = currentTotal - previousTotal;
        const percentage = Math.abs(difference / previousTotal) * 100;

        if (difference < 0) {
            message.textContent =
                "Spending decreased by " +
                formatMoney(Math.abs(difference)) +
                " (" + percentage.toFixed(1) +
                "%) compared with last month.";
        } else if (difference > 0) {
            message.textContent =
                "Spending increased by " +
                formatMoney(difference) +
                " (" + percentage.toFixed(1) +
                "%) compared with last month.";
        } else {
            message.textContent =
                "Your spending is the same as last month.";
        }
    }
}
function updateWeeklyReport() {
    const today = new Date();

    // Current week: Monday to Sunday
    const currentWeekStart = new Date(today);
    const day = currentWeekStart.getDay();

    const daysFromMonday = (day + 6) % 7;
    currentWeekStart.setDate(
        currentWeekStart.getDate() - daysFromMonday
    );
    currentWeekStart.setHours(0, 0, 0, 0);

    const nextWeekStart = new Date(currentWeekStart);
    nextWeekStart.setDate(nextWeekStart.getDate() + 7);

    // Previous week
    const previousWeekStart = new Date(currentWeekStart);
    previousWeekStart.setDate(previousWeekStart.getDate() - 7);

    let currentTotal = 0;
    let previousTotal = 0;

    expenses.forEach(function (expense) {
        const expenseDate = new Date(
            expense.expense_date + "T00:00:00"
        );

        const amount = Number(expense.amount);

        if (
            expenseDate >= currentWeekStart &&
            expenseDate < nextWeekStart
        ) {
            currentTotal += amount;
        }

        if (
            expenseDate >= previousWeekStart &&
            expenseDate < currentWeekStart
        ) {
            previousTotal += amount;
        }
    });

    document.getElementById("currentWeekTotal").textContent =
        formatMoney(currentTotal);

    document.getElementById("previousWeekTotal").textContent =
        formatMoney(previousTotal);

    const message = document.getElementById(
        "weeklyComparisonMessage"
        
    );
    if (window.weeklyChart) {
        window.weeklyChart.destroy();
    }

    const chartCanvas = document.getElementById(
        "weeklySpendingChart"
    );

    if (chartCanvas) {
       window.weeklyChart = new Chart(chartCanvas, {
    type: "bar",

    data: {
        labels: ["Previous Week", "Current Week"],
        datasets: [{
            label: "Spending",
            data: [previousTotal, currentTotal],
            backgroundColor: ["#a78bfa", "#3b82f6"],
            borderColor: ["#8b5cf6", "#2563eb"],
            borderWidth: 1,
            borderRadius: 10,
            borderSkipped: false,
            maxBarThickness: 85
        }]
    },

    options: {
        responsive: true,
        maintainAspectRatio: true,
        aspectRatio: 1.8,

        layout: {
            padding: {
                top: 10,
                bottom: 5
            }
        },

        plugins: {
            title: {
                display: true,
                text: "Weekly Spending Comparison",
                color: "#1e293b",
                font: {
                    size: 16,
                    weight: "bold"
                },
                padding: {
                    bottom: 20
                }
            },

            legend: {
                display: false
            },

            tooltip: {
                callbacks: {
                    label: function (context) {
                        return " Spent: ₹" +
                            Number(context.raw).toLocaleString("en-IN");
                    }
                }
            }
        },

        scales: {
            x: {
                grid: {
                    display: false
                },
                ticks: {
                    color: "#475569",
                    font: {
                        size: 12,
                        weight: "bold"
                    }
                },
                border: {
                    display: false
                }
            },

            y: {
                beginAtZero: true,
                ticks: {
                    color: "#64748b",
                    precision: 0,
                    callback: function (value) {
                        return "₹" +
                            Number(value).toLocaleString("en-IN");
                    }
                },
                grid: {
                    color: "#e2e8f0"
                },
                border: {
                    display: false
                }
            }
        }
    }
});
    }

    if (previousTotal === 0 && currentTotal === 0) {
        message.textContent =
            "No expenses recorded this week or last week.";
    } else if (previousTotal === 0) {
        message.textContent =
            "No expenses recorded last week. Keep tracking to compare.";
    } else {
        const difference = currentTotal - previousTotal;
        const percentage =
            Math.abs(difference / previousTotal) * 100;

        if (difference < 0) {
            message.textContent =
                "Great! Spending decreased by " +
                formatMoney(Math.abs(difference)) +
                " (" + percentage.toFixed(1) +
                "%) compared with last week.";
        } else if (difference > 0) {
            message.textContent =
                "Spending increased by " +
                formatMoney(difference) +
                " (" + percentage.toFixed(1) +
                "%) compared with last week.";
        } else {
            message.textContent =
                "Your spending is the same as last week.";
        }
    }
}
function updateBudgetAlert() {
    const alertBox = document.getElementById("budgetAlert");
    if (!alertBox) return;

    const totalSpent = getMonthlyExpenses().reduce(function (sum, expense) {
        return sum + Number(expense.amount || 0);
    }, 0);

    alertBox.hidden = false;
    alertBox.className = "budget-alert";

    if (monthlyBudget <= 0) {
        alertBox.textContent =
            "👋 Welcome! Set your monthly budget to get personalized spending tips.";
    } else {
        const percentage = (totalSpent / monthlyBudget) * 100;

        if (percentage >= 100) {
            alertBox.textContent =
                "⚠️ Your budget is fully used! Review your expenses and plan carefully before spending more.";
            alertBox.classList.add("danger");
        } else if (percentage >= 80) {
            alertBox.textContent =
                "😊 You're getting close to your budget limit. Try reducing unnecessary expenses this month.";
            alertBox.classList.add("warning");
        } else {
            alertBox.textContent =
                "🌟 Great job! Keep tracking your expenses and stay on your savings plan.";
            alertBox.classList.add("success");
        }
    }
}
function updateDailySummary() {
    const now = new Date();
    const todayString = [
        now.getFullYear(),
        String(now.getMonth() + 1).padStart(2, "0"),
        String(now.getDate()).padStart(2, "0")
    ].join("-");

    let todayTotal = 0;
    const totals = {};

    expenses.forEach(function (expense) {
        const date = expense.expense_date;
        const amount = Number(expense.amount) || 0;

        totals[date] = (totals[date] || 0) + amount;

        if (date === todayString) {
            todayTotal += amount;
        }
    });

    document.getElementById("todaySpending").textContent =
        formatMoney(todayTotal);

    const dates = Object.keys(totals);

    const highestDate = dates.reduce(function (best, date) {
        return totals[date] > totals[best] ? date : best;
    }, dates[0]);

    document.getElementById("highestSpendingDay").textContent =
        highestDate
            ? highestDate + " (" + formatMoney(totals[highestDate]) + ")"
            : "No expenses yet";
}
const savingsGoalInput = document.getElementById("savingsGoal");
const amountSavedInput = document.getElementById("amountSaved");

savingsGoalInput.value = localStorage.getItem("savingsGoal") || "";
amountSavedInput.value = localStorage.getItem("amountSaved") || "0";

function updateSavingsGoal() {
    const goal = Number(savingsGoalInput.value);
    const saved = Number(amountSavedInput.value);

    if (!Number.isFinite(goal) || goal <= 0 ||
        !Number.isFinite(saved) || saved < 0) {
        document.getElementById("goalMessage").textContent =
            "Enter a valid goal and saved amount.";
        return;
    }

    localStorage.setItem("savingsGoal", goal);
    localStorage.setItem("amountSaved", saved);

    const percentage = Math.min(100, (saved / goal) * 100);

    document.getElementById("goalProgress").value = percentage;
    document.getElementById("goalPercentage").textContent =
        percentage.toFixed(1) + "% completed";

    document.getElementById("goalMessage").textContent =
        saved >= goal
            ? "Congratulations! Savings goal achieved! 🎉"
            : formatMoney(goal - saved) + " more to reach your goal.";
}

document.getElementById("saveGoal").addEventListener(
    "click", updateSavingsGoal
);

updateSavingsGoal();
function updateMonthlyReportCard() {
    const monthlyExpenses = getMonthlyExpenses();
    let total = 0;
    const categories = {};

    monthlyExpenses.forEach(function (expense) {
        const amount = Number(expense.amount) || 0;
        total += amount;
        categories[expense.category] =
            (categories[expense.category] || 0) + amount;
    });

    const categoryNames = Object.keys(categories);
    const highestCategory = categoryNames.reduce(function (best, name) {
        return categories[name] > categories[best] ? name : best;
    }, categoryNames[0]);

    document.getElementById("reportTotal").textContent =
        formatMoney(total);

    document.getElementById("reportCategory").textContent =
        highestCategory || "No expenses yet";

    document.getElementById("reportBalance").textContent =
        formatMoney(monthlyBudget - total);
}
function showPersonalPopup(message) {
    const popup = document.getElementById("personalPopup");
    const messageElement = document.getElementById("personalMessage");

    if (!popup || !messageElement) return;

    messageElement.textContent = message;
    popup.hidden = false;
}

function closePersonalPopup() {
    document.getElementById("personalPopup").hidden = true;
}

document.getElementById("closePopup")?.addEventListener(
    "click", closePersonalPopup
);

document.getElementById("popupOk")?.addEventListener(
    "click", closePersonalPopup
);
window.addEventListener("load", function () {
    showPersonalPopup(
        "Hey! 😊 Your Budget Buddy is working!"
    );
});