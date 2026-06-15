package com.st10436040.budgettracker.adapters

import android.graphics.Color
import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.RecyclerView
import com.st10436040.budgettracker.data.Category
import com.st10436040.budgettracker.databinding.ItemCategoryBinding

/**
 * RecyclerView adapter for the categories list.
 * Author: Khumela Sendelani (ST10436040)
 */
class CategoryAdapter(
    private var items: List<Category>
) : RecyclerView.Adapter<CategoryAdapter.VH>() {

    fun submit(newItems: List<Category>) {
        items = newItems
        notifyDataSetChanged()
    }

    class VH(val binding: ItemCategoryBinding) : RecyclerView.ViewHolder(binding.root)

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): VH {
        val b = ItemCategoryBinding.inflate(LayoutInflater.from(parent.context), parent, false)
        return VH(b)
    }

    override fun onBindViewHolder(holder: VH, position: Int) {
        val c = items[position]
        holder.binding.textName.text = c.name
        holder.binding.colorDot.setBackgroundColor(runCatching { Color.parseColor(c.colorHex) }.getOrElse { Color.GRAY })
    }

    override fun getItemCount(): Int = items.size
}
