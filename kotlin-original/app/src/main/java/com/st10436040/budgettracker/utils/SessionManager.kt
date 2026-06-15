package com.st10436040.budgettracker.utils

import android.content.Context
import android.content.SharedPreferences

/**
 * Lightweight session manager backed by SharedPreferences.
 * Stores the currently logged-in user's primary key so activities can scope queries.
 *
 * Author: Khumela Sendelani (ST10436040)
 */
class SessionManager(context: Context) {

    private val prefs: SharedPreferences =
        context.applicationContext.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)

    fun setLoggedInUser(userId: Long, username: String) {
        prefs.edit()
            .putLong(KEY_USER_ID, userId)
            .putString(KEY_USERNAME, username)
            .apply()
    }

    fun getUserId(): Long = prefs.getLong(KEY_USER_ID, -1L)
    fun getUsername(): String? = prefs.getString(KEY_USERNAME, null)
    fun isLoggedIn(): Boolean = getUserId() > 0
    fun logout() = prefs.edit().clear().apply()

    companion object {
        private const val PREFS_NAME = "budget_tracker_session"
        private const val KEY_USER_ID = "userId"
        private const val KEY_USERNAME = "username"
    }
}
