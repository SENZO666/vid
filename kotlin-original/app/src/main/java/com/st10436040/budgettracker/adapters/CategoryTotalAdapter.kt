package com.st10436040.budgettracker.adapters

import android.graphics.Color
import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.RecyclerView
import com.st10436040.budgettracker.data.CategoryTotal
import com.st10436040.budgettracker.databinding.ItemCategoryTotalBinding
import java.text.NumberFormat
import java.util.Locale

/**
 * RecyclerView adapter for the "total per category" screen.
 * Author: Khumela Sendelani (ST10436040)
 */
class CategoryTotalAdapter : RecyclerView.Adapter<CategoryTotalAdapter.VH>() {

    private var items: List<CategoryTotal> = emptyList()
    private val money = NumberFormat.getCurrencyInstance(Locale.getDefault())

    fun submit(newItems: List<CategoryTotal>) {
        items = newItems
        notifyDataSetChanged()
    }

    class VH(val binding: ItemCategoryTotalBinding) : RecyclerView.ViewHolder(binding.root)

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): VH =
        VH(ItemCategoryTotalBinding.inflate(LayoutInflater.from(parent.context), parent, false))

    override fun onBindViewHolder(holder: VH, position: Int) {
        val t = items[position]
        with(holder.binding) {
            textName.text = t.categoryName
            textTotal.text = money.format(t.total)
            colorDot.setBackgroundColor(
                runCatching { Color.parseColor(t.colorHex) }.getOrElse { Color.GRAY }
            )
        }
    }

    override fun getItemCount(): Int = items.size
}
