package com.st10436040.budgettracker.utils

import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Locale

/**
 * Date / time formatting helpers shared across screens.
 * Author: Khumela Sendelani (ST10436040)
 */
object DateUtils {

    private val displayDate = SimpleDateFormat("dd MMM yyyy", Locale.getDefault())
    private val displayTime = SimpleDateFormat("HH:mm", Locale.getDefault())

    /** Returns midnight of the given epoch ms — normalises dates for period queries. */
    fun startOfDay(millis: Long): Long {
        val cal = Calendar.getInstance()
        cal.timeInMillis = millis
        cal.set(Calendar.HOUR_OF_DAY, 0)
        cal.set(Calendar.MINUTE, 0)
        cal.set(Calendar.SECOND, 0)
        cal.set(Calendar.MILLISECOND, 0)
        return cal.timeInMillis
    }

    /** Returns 23:59:59.999 of the given epoch ms. */
    fun endOfDay(millis: Long): Long {
        val cal = Calendar.getInstance()
        cal.timeInMillis = millis
        cal.set(Calendar.HOUR_OF_DAY, 23)
        cal.set(Calendar.MINUTE, 59)
        cal.set(Calendar.SECOND, 59)
        cal.set(Calendar.MILLISECOND, 999)
        return cal.timeInMillis
    }

    fun formatDate(millis: Long): String = displayDate.format(millis)

    /** Converts minutes-since-midnight to an "HH:mm" string. */
    fun formatMinutes(minutes: Int): String {
        val cal = Calendar.getInstance().apply {
            set(Calendar.HOUR_OF_DAY, (minutes / 60).coerceIn(0, 23))
            set(Calendar.MINUTE, (minutes % 60).coerceIn(0, 59))
        }
        return displayTime.format(cal.time)
    }

    /** Convenience: first day of current month at 00:00. */
    fun firstOfThisMonth(): Long {
        val cal = Calendar.getInstance()
        cal.set(Calendar.DAY_OF_MONTH, 1)
        return startOfDay(cal.timeInMillis)
    }

    /** Convenience: "now" at end-of-day. */
    fun endOfToday(): Long = endOfDay(System.currentTimeMillis())
}
