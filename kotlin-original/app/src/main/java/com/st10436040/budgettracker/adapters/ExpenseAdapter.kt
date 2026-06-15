package com.st10436040.budgettracker.adapters

import android.graphics.Color
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.recyclerview.widget.RecyclerView
import com.st10436040.budgettracker.data.ExpenseWithCategory
import com.st10436040.budgettracker.databinding.ItemExpenseBinding
import com.st10436040.budgettracker.utils.DateUtils
import java.text.NumberFormat
import java.util.Locale

/**
 * RecyclerView adapter for the main expenses list.
 * Shows amount, category dot, date/time range and a camera badge if a photo is attached.
 *
 * Author: Khumela Sendelani (ST10436040)
 */
class ExpenseAdapter(
    private val onClick: (ExpenseWithCategory) -> Unit
) : RecyclerView.Adapter<ExpenseAdapter.VH>() {

    private var items: List<ExpenseWithCategory> = emptyList()
    private val money = NumberFormat.getCurrencyInstance(Locale.getDefault())

    fun submit(newItems: List<ExpenseWithCategory>) {
        items = newItems
        notifyDataSetChanged()
    }

    class VH(val binding: ItemExpenseBinding) : RecyclerView.ViewHolder(binding.root)

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): VH =
        VH(ItemExpenseBinding.inflate(LayoutInflater.from(parent.context), parent, false))

    override fun onBindViewHolder(holder: VH, position: Int) {
        val e = items[position]
        with(holder.binding) {
            textDescription.text = e.description
            textCategory.text = e.categoryName
            textAmount.text = money.format(e.amount)
            textDateTime.text = root.context.getString(
                com.st10436040.budgettracker.R.string.list_datetime,
                DateUtils.formatDate(e.dateEpochMillis),
                DateUtils.formatMinutes(e.startTimeMinutes),
                DateUtils.formatMinutes(e.endTimeMinutes)
            )
            colorDot.setBackgroundColor(
                runCatching { Color.parseColor(e.colorHex) }.getOrElse { Color.GRAY }
            )
            iconPhoto.visibility = if (!e.photoPath.isNullOrEmpty()) View.VISIBLE else View.GONE
            root.setOnClickListener { onClick(e) }
        }
    }

    override fun getItemCount(): Int = items.size
}
