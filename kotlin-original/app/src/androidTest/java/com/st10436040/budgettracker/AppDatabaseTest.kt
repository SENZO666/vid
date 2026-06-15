package com.st10436040.budgettracker

import androidx.room.Room
import androidx.test.core.app.ApplicationProvider
import androidx.test.ext.junit.runners.AndroidJUnit4
import com.st10436040.budgettracker.data.AppDatabase
import com.st10436040.budgettracker.data.Category
import com.st10436040.budgettracker.data.Expense
import kotlinx.coroutines.runBlocking
import org.junit.After
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith

/**
 * Instrumentation test exercising the full Room data path — category creation, expense insert,
 * and the `totalsByCategory` aggregate used on the totals screen.
 *
 * Author: Khumela Sendelani (ST10436040)
 */
@RunWith(AndroidJUnit4::class)
class AppDatabaseTest {

    private lateinit var db: AppDatabase

    @Before fun setup() {
        val context = ApplicationProvider.getApplicationContext<android.content.Context>()
        db = Room.inMemoryDatabaseBuilder(context, AppDatabase::class.java)
            .allowMainThreadQueries()
            .build()
    }

    @After fun teardown() = db.close()

    @Test fun expenseTotalsAggregateByCategory() = runBlocking {
        val userId = 1L
        val foodId = db.categoryDao().insert(Category(userId = userId, name = "Food"))
        val transportId = db.categoryDao().insert(Category(userId = userId, name = "Transport"))

        val today = System.currentTimeMillis()
        db.expenseDao().insert(
            Expense(userId = userId, categoryId = foodId, amount = 100.0,
                description = "Groceries", dateEpochMillis = today,
                startTimeMinutes = 540, endTimeMinutes = 600)
        )
        db.expenseDao().insert(
            Expense(userId = userId, categoryId = foodId, amount = 50.0,
                description = "Coffee", dateEpochMillis = today,
                startTimeMinutes = 600, endTimeMinutes = 630)
        )
        db.expenseDao().insert(
            Expense(userId = userId, categoryId = transportId, amount = 25.0,
                description = "Taxi", dateEpochMillis = today,
                startTimeMinutes = 800, endTimeMinutes = 830)
        )

        val totals = db.expenseDao().totalsByCategory(userId, today - 1, today + 1)
        val foodTotal = totals.first { it.categoryId == foodId }.total
        val transportTotal = totals.first { it.categoryId == transportId }.total

        assertEquals(150.0, foodTotal, 0.001)
        assertEquals(25.0, transportTotal, 0.001)

        val grand = db.expenseDao().grandTotal(userId, today - 1, today + 1)
        assertTrue(grand == 175.0)
    }
}
