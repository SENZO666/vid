package com.st10436040.budgettracker

import android.app.Application
import android.util.Log
import com.st10436040.budgettracker.data.AppDatabase

/**
 * Custom Application class.
 * - Initialises the Room database eagerly so the first screen is snappy.
 * - Provides a single source of truth for database access across activities.
 *
 * Author: Khumela Sendelani (ST10436040)
 */
class BudgetApp : Application() {

    val database: AppDatabase by lazy { AppDatabase.getInstance(this) }

    override fun onCreate() {
        super.onCreate()
        Log.d(TAG, "BudgetApp onCreate — initialising Room database")
        // Touch the lazy property so Room initialises on app start.
        database.openHelper.writableDatabase
        Log.d(TAG, "Room database ready at ${database.openHelper.databaseName ?: "budget_tracker.db"}")
    }

    companion object {
        private const val TAG = "BudgetApp"
    }
}
