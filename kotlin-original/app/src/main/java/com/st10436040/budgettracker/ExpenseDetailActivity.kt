package com.st10436040.budgettracker

import android.content.Intent
import android.os.Bundle
import android.view.View
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.bumptech.glide.Glide
import com.st10436040.budgettracker.databinding.ActivityExpenseDetailBinding
import com.st10436040.budgettracker.utils.DateUtils
import kotlinx.coroutines.launch
import java.io.File
import java.text.NumberFormat
import java.util.Locale

/**
 * Read-only detail screen for a single expense — also offers "View photo" for attachments.
 * Author: Khumela Sendelani (ST10436040)
 */
class ExpenseDetailActivity : AppCompatActivity() {

    private lateinit var binding: ActivityExpenseDetailBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityExpenseDetailBinding.inflate(layoutInflater)
        setContentView(binding.root)
        supportActionBar?.setDisplayHomeAsUpEnabled(true)
        title = getString(R.string.title_expense_detail)

        val id = intent.getLongExtra(EXTRA_EXPENSE_ID, -1L)
        if (id <= 0) { finish(); return }
        load(id)
    }

    private fun load(id: Long) {
        val app = applicationContext as BudgetApp
        lifecycleScope.launch {
            val expense = app.database.expenseDao().getById(id) ?: run { finish(); return@launch }
            val category = app.database.categoryDao().getById(expense.categoryId)
            val fmt = NumberFormat.getCurrencyInstance(Locale.getDefault())

            binding.textAmount.text = fmt.format(expense.amount)
            binding.textCategory.text = category?.name ?: "—"
            binding.textDate.text = DateUtils.formatDate(expense.dateEpochMillis)
            binding.textTimes.text = getString(
                R.string.time_range_value,
                DateUtils.formatMinutes(expense.startTimeMinutes),
                DateUtils.formatMinutes(expense.endTimeMinutes)
            )
            binding.textDescription.text = expense.description

            val path = expense.photoPath
            if (path.isNullOrEmpty() || !File(path).exists()) {
                binding.imagePreview.visibility = View.GONE
                binding.btnViewPhoto.visibility = View.GONE
            } else {
                binding.imagePreview.visibility = View.VISIBLE
                binding.btnViewPhoto.visibility = View.VISIBLE
                Glide.with(this@ExpenseDetailActivity).load(File(path)).into(binding.imagePreview)
                binding.btnViewPhoto.setOnClickListener {
                    startActivity(Intent(this@ExpenseDetailActivity, PhotoViewActivity::class.java)
                        .putExtra(PhotoViewActivity.EXTRA_PATH, path))
                }
            }
        }
    }

    override fun onSupportNavigateUp(): Boolean { finish(); return true }

    companion object {
        const val EXTRA_EXPENSE_ID = "extra_expense_id"
    }
}
