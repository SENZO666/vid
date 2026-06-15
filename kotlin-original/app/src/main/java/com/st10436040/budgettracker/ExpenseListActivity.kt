package com.st10436040.budgettracker

import android.app.DatePickerDialog
import android.content.Intent
import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import com.st10436040.budgettracker.adapters.ExpenseAdapter
import com.st10436040.budgettracker.databinding.ActivityExpenseListBinding
import com.st10436040.budgettracker.utils.DateUtils
import com.st10436040.budgettracker.utils.SessionManager
import kotlinx.coroutines.launch
import java.util.Calendar

/**
 * Shows all expense entries in a user-selectable date range.
 *
 * Satisfies:
 *   "The user must be able to view the list of all the expense entries created during a
 *   user-selectable period. If a photo was stored for an entry, the user must be able to access
 *   it from this list."
 *
 * Tapping an entry opens [ExpenseDetailActivity] which shows the attached photo if any.
 *
 * Author: Khumela Sendelani (ST10436040)
 */
class ExpenseListActivity : AppCompatActivity() {

    private lateinit var binding: ActivityExpenseListBinding
    private lateinit var adapter: ExpenseAdapter
    private val session by lazy { SessionManager(this) }

    private var fromMillis: Long = DateUtils.firstOfThisMonth()
    private var toMillis: Long = DateUtils.endOfToday()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityExpenseListBinding.inflate(layoutInflater)
        setContentView(binding.root)
        supportActionBar?.setDisplayHomeAsUpEnabled(true)
        title = getString(R.string.title_expenses)

        adapter = ExpenseAdapter { item ->
            startActivity(Intent(this, ExpenseDetailActivity::class.java)
                .putExtra(ExpenseDetailActivity.EXTRA_EXPENSE_ID, item.id))
        }
        binding.recyclerExpenses.layoutManager = LinearLayoutManager(this)
        binding.recyclerExpenses.adapter = adapter

        binding.btnFrom.setOnClickListener { pickDate(isFrom = true) }
        binding.btnTo.setOnClickListener { pickDate(isFrom = false) }
        bindPeriod()
    }

    override fun onResume() { super.onResume(); refresh() }

    private fun pickDate(isFrom: Boolean) {
        val cal = Calendar.getInstance().apply {
            timeInMillis = if (isFrom) fromMillis else toMillis
        }
        DatePickerDialog(this, { _, y, m, d ->
            cal.set(y, m, d)
            if (isFrom) fromMillis = DateUtils.startOfDay(cal.timeInMillis)
            else toMillis = DateUtils.endOfDay(cal.timeInMillis)
            bindPeriod(); refresh()
        }, cal.get(Calendar.YEAR), cal.get(Calendar.MONTH), cal.get(Calendar.DAY_OF_MONTH)).show()
    }

    private fun bindPeriod() {
        binding.textFrom.text = getString(R.string.label_from, DateUtils.formatDate(fromMillis))
        binding.textTo.text = getString(R.string.label_to, DateUtils.formatDate(toMillis))
    }

    private fun refresh() {
        val app = applicationContext as BudgetApp
        lifecycleScope.launch {
            val items = app.database.expenseDao().listInPeriod(session.getUserId(), fromMillis, toMillis)
            adapter.submit(items)
            binding.textEmpty.visibility = if (items.isEmpty()) android.view.View.VISIBLE else android.view.View.GONE
        }
    }

    override fun onSupportNavigateUp(): Boolean { finish(); return true }
}
