package com.st10436040.budgettracker.data

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query

/**
 * DAO for the single "monthly goals" row per user.
 * Upsert semantics: REPLACE on conflict (unique index on userId).
 *
 * Author: Khumela Sendelani (ST10436040)
 */
@Dao
interface GoalDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsert(goal: Goal): Long

    @Query("SELECT * FROM goals WHERE userId = :userId LIMIT 1")
    suspend fun getForUser(userId: Long): Goal?
}
