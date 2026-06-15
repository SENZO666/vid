package com.st10436040.budgettracker.data

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query

/**
 * DAO for User records.  The auth flow is: look up the user by username, then verify the
 * supplied password against [User.passwordHash] + [User.salt] in the login activity.
 *
 * Author: Khumela Sendelani (ST10436040)
 */
@Dao
interface UserDao {
    @Insert(onConflict = OnConflictStrategy.ABORT)
    suspend fun insert(user: User): Long

    @Query("SELECT * FROM users WHERE username = :username LIMIT 1")
    suspend fun findByUsername(username: String): User?

    @Query("SELECT COUNT(*) FROM users")
    suspend fun count(): Int
}
