package com.st10436040.budgettracker

import android.os.Bundle
import android.util.Log
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.st10436040.budgettracker.data.Category
import com.st10436040.budgettracker.databinding.ActivityAddCategoryBinding
import com.st10436040.budgettracker.utils.SessionManager
import kotlinx.coroutines.launch

/**
 * Form used to create a new [Category] for the current user.
 * The colour chips use a small palette that maps to [Category.colorHex].
 *
 * Author: Khumela Sendelani (ST10436040)
 */
class AddCategoryActivity : AppCompatActivity() {

    private lateinit var binding: ActivityAddCategoryBinding
    private var chosenColor = "#6750A4"

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityAddCategoryBinding.inflate(layoutInflater)
        setContentView(binding.root)
        supportActionBar?.setDisplayHomeAsUpEnabled(true)
        title = getString(R.string.title_new_category)

        binding.chipGroupColors.setOnCheckedStateChangeListener { _, ids ->
            chosenColor = when (ids.firstOrNull()) {
                R.id.chipColor1 -> "#6750A4"
                R.id.chipColor2 -> "#00897B"
                R.id.chipColor3 -> "#E53935"
                R.id.chipColor4 -> "#FB8C00"
                R.id.chipColor5 -> "#1E88E5"
                else -> chosenColor
            }
        }

        binding.btnSave.setOnClickListener { save() }
    }

    private fun save() {
        val name = binding.inputName.text?.toString()?.trim().orEmpty()
        if (name.isEmpty()) {
            Toast.makeText(this, R.string.error_name_required, Toast.LENGTH_SHORT).show(); return
        }
        val userId = SessionManager(this).getUserId()
        val app = applicationContext as BudgetApp
        binding.btnSave.isEnabled = false

        lifecycleScope.launch {
            try {
                val id = app.database.categoryDao().insert(
                    Category(userId = userId, name = name, colorHex = chosenColor)
                )
                Log.i(TAG, "Created category id=$id name=$name")
                Toast.makeText(this@AddCategoryActivity, R.string.category_saved, Toast.LENGTH_SHORT).show()
                finish()
            } catch (e: Exception) {
                Log.e(TAG, "Could not insert category", e)
                Toast.makeText(this@AddCategoryActivity, R.string.error_category_duplicate, Toast.LENGTH_LONG).show()
            } finally {
                binding.btnSave.isEnabled = true
            }
        }
    }

    override fun onSupportNavigateUp(): Boolean { finish(); return true }

    companion object { private const val TAG = "AddCategoryActivity" }
}
