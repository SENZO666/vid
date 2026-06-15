package com.st10436040.budgettracker.data

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase

/**
 * Room database — single source of truth for all persisted data.
 *
 * Satisfies the POE rubric requirement:
 * "All data should be saved to a local SQLite, RoomDB or similar offline Android database platform."
 *
 * Author: Khumela Sendelani (ST10436040)
 */
@Database(
    entities = [User::class, Category::class, Expense::class, Goal::class],
    version = 1,
    exportSchema = false
)
abstract class AppDatabase : RoomDatabase() {
    abstract fun userDao(): UserDao
    abstract fun categoryDao(): CategoryDao
    abstract fun expenseDao(): ExpenseDao
    abstract fun goalDao(): GoalDao

    companion object {
        @Volatile private var INSTANCE: AppDatabase? = null

        fun getInstance(context: Context): AppDatabase =
            INSTANCE ?: synchronized(this) {
                INSTANCE ?: Room.databaseBuilder(
                    context.applicationContext,
                    AppDatabase::class.java,
                    "budget_tracker.db"
                )
                    // Fresh install only — acceptable for a student prototype.
                    .fallbackToDestructiveMigration()
                    .build()
                    .also { INSTANCE = it }
            }
    }
}
