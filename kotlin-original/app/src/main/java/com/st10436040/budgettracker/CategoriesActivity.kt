package com.st10436040.budgettracker

import android.content.Intent
import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import com.st10436040.budgettracker.adapters.CategoryAdapter
import com.st10436040.budgettracker.databinding.ActivityCategoriesBinding
import com.st10436040.budgettracker.utils.SessionManager
import kotlinx.coroutines.launch

/**
 * Lists all categories for the current user.  Tapping an item does nothing for now — the
 * lifecycle of editing/deleting a category lives in [AddCategoryActivity].
 *
 * Satisfies: "The user must be able to create categories that the expense and budget entries
 * will belong to."
 *
 * Author: Khumela Sendelani (ST10436040)
 */
class CategoriesActivity : AppCompatActivity() {

    private lateinit var binding: ActivityCategoriesBinding
    private lateinit var adapter: CategoryAdapter
    private lateinit var session: SessionManager

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityCategoriesBinding.inflate(layoutInflater)
        setContentView(binding.root)
        supportActionBar?.setDisplayHomeAsUpEnabled(true)
        title = getString(R.string.title_categories)
        session = SessionManager(this)

        adapter = CategoryAdapter(emptyList())
        binding.recyclerCategories.layoutManager = LinearLayoutManager(this)
        binding.recyclerCategories.adapter = adapter

        binding.fabAddCategory.setOnClickListener {
            startActivity(Intent(this, AddCategoryActivity::class.java))
        }
    }

    override fun onResume() { super.onResume(); refresh() }

    private fun refresh() {
        val app = applicationContext as BudgetApp
        lifecycleScope.launch {
            val items = app.database.categoryDao().getAllForUser(session.getUserId())
            adapter.submit(items)
            binding.textEmpty.visibility = if (items.isEmpty()) android.view.View.VISIBLE else android.view.View.GONE
        }
    }

    override fun onSupportNavigateUp(): Boolean { finish(); return true }
}
