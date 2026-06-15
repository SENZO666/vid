package com.st10436040.budgettracker

import android.os.Bundle
import android.util.Log
import android.widget.SeekBar
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.st10436040.budgettracker.data.Goal
import com.st10436040.budgettracker.databinding.ActivityGoalsBinding
import com.st10436040.budgettracker.utils.SessionManager
import kotlinx.coroutines.launch
import java.text.NumberFormat
import java.util.Locale

/**
 * Goals screen: set the min / max monthly spending goal for the signed-in user.
 *
 * Satisfies:
 *   "The user must be able to set a minimum monthly goal for money spent, as well as a maximum
 *   goal."
 *
 * Uses [SeekBar] (a POE-mandated widget) for fast tuning of the values, backed by a
 * [android.widget.EditText] for precise entry — NumberFormat formats the live summary.
 *
 * Author: Khumela Sendelani (ST10436040)
 */
class GoalsActivity : AppCompatActivity() {

    private lateinit var binding: ActivityGoalsBinding
    private val session by lazy { SessionManager(this) }
    private val currency = NumberFormat.getCurrencyInstance(Locale.getDefault())

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityGoalsBinding.inflate(layoutInflater)
        setContentView(binding.root)
        supportActionBar?.setDisplayHomeAsUpEnabled(true)
        title = getString(R.string.title_goals)

        binding.seekMin.max = SEEK_MAX
        binding.seekMax.max = SEEK_MAX

        binding.seekMin.setOnSeekBarChangeListener(object : SeekBar.OnSeekBarChangeListener {
            override fun onProgressChanged(sb: SeekBar?, progress: Int, fromUser: Boolean) {
                if (fromUser) binding.inputMin.setText(progress.toString())
                bindPreview()
            }
            override fun onStartTrackingTouch(sb: SeekBar?) {}
            override fun onStopTrackingTouch(sb: SeekBar?) {}
        })
        binding.seekMax.setOnSeekBarChangeListener(object : SeekBar.OnSeekBarChangeListener {
            override fun onProgressChanged(sb: SeekBar?, progress: Int, fromUser: Boolean) {
                if (fromUser) binding.inputMax.setText(progress.toString())
                bindPreview()
            }
            override fun onStartTrackingTouch(sb: SeekBar?) {}
            override fun onStopTrackingTouch(sb: SeekBar?) {}
        })

        binding.btnSave.setOnClickListener { save() }
        load()
    }

    private fun bindPreview() {
        val minVal = binding.seekMin.progress.toDouble()
        val maxVal = binding.seekMax.progress.toDouble()
        binding.textPreview.text = getString(
            R.string.goal_preview,
            currency.format(minVal),
            currency.format(maxVal)
        )
    }

    private fun load() {
        val app = applicationContext as BudgetApp
        lifecycleScope.launch {
            val goal = app.database.goalDao().getForUser(session.getUserId())
            val min = goal?.minAmount?.toInt() ?: 0
            val max = goal?.maxAmount?.toInt() ?: 1000
            binding.seekMin.progress = min.coerceIn(0, SEEK_MAX)
            binding.seekMax.progress = max.coerceIn(0, SEEK_MAX)
            binding.inputMin.setText(min.toString())
            binding.inputMax.setText(max.toString())
            bindPreview()
        }
    }

    private fun save() {
        val min = binding.inputMin.text?.toString()?.toDoubleOrNull()
        val max = binding.inputMax.text?.toString()?.toDoubleOrNull()
        if (min == null || max == null || min < 0 || max <= 0) {
            Toast.makeText(this, R.string.error_goal_invalid, Toast.LENGTH_SHORT).show(); return
        }
        if (min > max) {
            Toast.makeText(this, R.string.error_goal_order, Toast.LENGTH_SHORT).show(); return
        }
        val app = applicationContext as BudgetApp
        binding.btnSave.isEnabled = false
        lifecycleScope.launch {
            app.database.goalDao().upsert(
                Goal(userId = session.getUserId(), minAmount = min, maxAmount = max)
            )
            Log.i(TAG, "Saved goals for userId=${session.getUserId()} min=$min max=$max")
            Toast.makeText(this@GoalsActivity, R.string.goals_saved, Toast.LENGTH_SHORT).show()
            binding.btnSave.isEnabled = true
            finish()
        }
    }

    override fun onSupportNavigateUp(): Boolean { finish(); return true }

    companion object {
        private const val TAG = "GoalsActivity"
        private const val SEEK_MAX = 100_000
    }
}
