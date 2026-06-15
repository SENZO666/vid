package com.st10436040.budgettracker

import android.app.DatePickerDialog
import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import com.st10436040.budgettracker.adapters.CategoryTotalAdapter
import com.st10436040.budgettracker.databinding.ActivityCategoryTotalsBinding
import com.st10436040.budgettracker.utils.DateUtils
import com.st10436040.budgettracker.utils.SessionManager
import kotlinx.coroutines.launch
import java.text.NumberFormat
import java.util.Calendar
import java.util.Locale

/**
 * Category totals screen.
 *
 * Satisfies:
 *   "The user must be able to view the total amount of money spent on each category during a
 *   user-selectable period."
 *
 * Author: Khumela Sendelani (ST10436040)
 */
class CategoryTotalsActivity : AppCompatActivity() {

    private lateinit var binding: ActivityCategoryTotalsBinding
    private lateinit var adapter: CategoryTotalAdapter
    private val session by lazy { SessionManager(this) }

    private var fromMillis: Long = DateUtils.firstOfThisMonth()
    private var toMillis: Long = DateUtils.endOfToday()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityCategoryTotalsBinding.inflate(layoutInflater)
        setContentView(binding.root)
        supportActionBar?.setDisplayHomeAsUpEnabled(true)
        title = getString(R.string.title_category_totals)

        adapter = CategoryTotalAdapter()
        binding.recyclerTotals.layoutManager = LinearLayoutManager(this)
        binding.recyclerTotals.adapter = adapter

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
            val items = app.database.expenseDao().totalsByCategory(session.getUserId(), fromMillis, toMillis)
            adapter.submit(items)
            val grand = items.sumOf { it.total }
            val fmt = NumberFormat.getCurrencyInstance(Locale.getDefault())
            binding.textGrandTotal.text = getString(R.string.grand_total_value, fmt.format(grand))
            binding.textEmpty.visibility =
                if (items.all { it.total == 0.0 }) android.view.View.VISIBLE else android.view.View.GONE
        }
    }

    override fun onSupportNavigateUp(): Boolean { finish(); return true }
}
