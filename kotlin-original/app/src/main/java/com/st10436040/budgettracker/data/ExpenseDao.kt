package com.st10436040.budgettracker.data

import androidx.room.Dao
import androidx.room.Delete
import androidx.room.Insert
import androidx.room.Query
import androidx.room.Update

/**
 * Expense DAO plus derived view-model rows for joins (list view and totals).
 * Author: Khumela Sendelani (ST10436040)
 */

/** Row used by the expense list screen — joins category name/colour for quick display. */
data class ExpenseWithCategory(
    val id: Long,
    val userId: Long,
    val categoryId: Long,
    val amount: Double,
    val description: String,
    val dateEpochMillis: Long,
    val startTimeMinutes: Int,
    val endTimeMinutes: Int,
    val photoPath: String?,
    val categoryName: String,
    val colorHex: String
)

/** Row used by the category-totals screen. */
data class CategoryTotal(
    val categoryId: Long,
    val categoryName: String,
    val colorHex: String,
    val total: Double
)

@Dao
interface ExpenseDao {
    @Insert
    suspend fun insert(expense: Expense): Long

    @Update
    suspend fun update(expense: Expense)

    @Delete
    suspend fun delete(expense: Expense)

    @Query("SELECT * FROM expenses WHERE id = :id LIMIT 1")
    suspend fun getById(id: Long): Expense?

    @Query(
        """
        SELECT e.id, e.userId, e.categoryId, e.amount, e.description,
               e.dateEpochMillis, e.startTimeMinutes, e.endTimeMinutes, e.photoPath,
               c.name AS categoryName, c.colorHex AS colorHex
          FROM expenses e
          INNER JOIN categories c ON c.id = e.categoryId
         WHERE e.userId = :userId
           AND e.dateEpochMillis BETWEEN :startMillis AND :endMillis
         ORDER BY e.dateEpochMillis DESC, e.id DESC
        """
    )
    suspend fun listInPeriod(userId: Long, startMillis: Long, endMillis: Long): List<ExpenseWithCategory>

    @Query(
        """
        SELECT c.id AS categoryId, c.name AS categoryName, c.colorHex AS colorHex,
               COALESCE(SUM(e.amount), 0.0) AS total
          FROM categories c
          LEFT JOIN expenses e ON e.categoryId = c.id
                              AND e.dateEpochMillis BETWEEN :startMillis AND :endMillis
         WHERE c.userId = :userId
         GROUP BY c.id
         ORDER BY total DESC, c.name ASC
        """
    )
    suspend fun totalsByCategory(userId: Long, startMillis: Long, endMillis: Long): List<CategoryTotal>

    @Query(
        """
        SELECT COALESCE(SUM(amount), 0.0) FROM expenses
         WHERE userId = :userId
           AND dateEpochMillis BETWEEN :startMillis AND :endMillis
        """
    )
    suspend fun grandTotal(userId: Long, startMillis: Long, endMillis: Long): Double
}
