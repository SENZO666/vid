package com.st10436040.budgettracker.data

import androidx.room.Entity
import androidx.room.Index
import androidx.room.PrimaryKey

/**
 * User account stored locally in Room.
 * Password is stored as a SHA-256 hash with a per-user random salt — plaintext passwords are never
 * written to the database (see [com.st10436040.budgettracker.utils.PasswordHasher]).
 *
 * Author: Khumela Sendelani (ST10436040)
 */
@Entity(
    tableName = "users",
    indices = [Index(value = ["username"], unique = true)]
)
data class User(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val username: String,
    val passwordHash: String,
    val salt: String
)

/**
 * Category that expense entries belong to (e.g. "Food", "Transport").
 * Each user owns their own categories — the [userId] foreign key scopes the data.
 */
@Entity(
    tableName = "categories",
    indices = [Index(value = ["userId", "name"], unique = true)]
)
data class Category(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val userId: Long,
    val name: String,
    val colorHex: String = "#6750A4"
)

/**
 * An expense entry. [dateEpochMillis] captures only the date portion (midnight of the chosen day)
 * to make period filtering straightforward.  [startTimeMinutes] and [endTimeMinutes] hold the
 * minutes since midnight (0..1439) — this keeps the schema simple and time-zone safe.
 */
@Entity(tableName = "expenses")
data class Expense(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val userId: Long,
    val categoryId: Long,
    val amount: Double,
    val description: String,
    val dateEpochMillis: Long,
    val startTimeMinutes: Int,
    val endTimeMinutes: Int,
    val photoPath: String? = null
)

/**
 * Monthly spending goal (one row per user).  Stored as a single row per user and overwritten on
 * save, keeping the rubric's "set a minimum monthly goal …, as well as a maximum goal" simple.
 */
@Entity(
    tableName = "goals",
    indices = [Index(value = ["userId"], unique = true)]
)
data class Goal(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val userId: Long,
    val minAmount: Double,
    val maxAmount: Double
)
