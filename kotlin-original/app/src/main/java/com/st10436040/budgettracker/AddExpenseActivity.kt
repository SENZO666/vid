package com.st10436040.budgettracker

import android.app.DatePickerDialog
import android.app.TimePickerDialog
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.provider.MediaStore
import android.util.Log
import android.widget.ArrayAdapter
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.FileProvider
import androidx.lifecycle.lifecycleScope
import com.st10436040.budgettracker.data.Category
import com.st10436040.budgettracker.data.Expense
import com.st10436040.budgettracker.databinding.ActivityAddExpenseBinding
import com.st10436040.budgettracker.utils.DateUtils
import com.st10436040.budgettracker.utils.SessionManager
import kotlinx.coroutines.launch
import java.io.File
import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Date
import java.util.Locale

/**
 * New-expense form.
 *
 * Satisfies:
 *   • "create an expense entry, specifying at least the date, start and end times,
 *      description, and category."
 *   • "optionally add a photograph to each expense entry."
 *
 * The photo can come from the camera (via a FileProvider-backed Uri) or the Android 13 photo
 * picker (which requires no runtime permission).  We copy the picker result into the app's
 * internal files dir so the URI remains valid across reboots.
 *
 * Author: Khumela Sendelani (ST10436040)
 */
class AddExpenseActivity : AppCompatActivity() {

    private lateinit var binding: ActivityAddExpenseBinding
    private val session by lazy { SessionManager(this) }
    private var categories: List<Category> = emptyList()

    private var chosenDateMillis: Long = DateUtils.startOfDay(System.currentTimeMillis())
    private var chosenStartMinutes: Int = 9 * 60
    private var chosenEndMinutes: Int = 10 * 60
    private var currentPhotoPath: String? = null
    private var pendingCameraUri: Uri? = null

    private val takePhotoLauncher = registerForActivityResult(ActivityResultContracts.TakePicture()) { saved ->
        if (saved && pendingCameraFile != null) {
            currentPhotoPath = pendingCameraFile?.absolutePath
            Log.d(TAG, "Photo captured -> $currentPhotoPath")
            bindPhotoState()
        } else {
            Log.w(TAG, "Camera cancelled or capture failed")
        }
    }

    private val pickPhotoLauncher = registerForActivityResult(
        ActivityResultContracts.PickVisualMedia()
    ) { uri: Uri? ->
        if (uri != null) {
            val copied = copyToInternalStorage(uri)
            if (copied != null) {
                currentPhotoPath = copied.absolutePath
                Log.d(TAG, "Photo selected from picker -> $currentPhotoPath")
                bindPhotoState()
            }
        }
    }

    private var pendingCameraFile: File? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityAddExpenseBinding.inflate(layoutInflater)
        setContentView(binding.root)
        supportActionBar?.setDisplayHomeAsUpEnabled(true)
        title = getString(R.string.title_new_expense)

        loadCategories()
        bindDateTimeFields()

        binding.btnPickDate.setOnClickListener { pickDate() }
        binding.btnPickStart.setOnClickListener { pickTime(isStart = true) }
        binding.btnPickEnd.setOnClickListener { pickTime(isStart = false) }
        binding.btnTakePhoto.setOnClickListener { launchCamera() }
        binding.btnPickPhoto.setOnClickListener {
            pickPhotoLauncher.launch(
                androidx.activity.result.PickVisualMediaRequest(
                    ActivityResultContracts.PickVisualMedia.ImageOnly
                )
            )
        }
        binding.btnRemovePhoto.setOnClickListener {
            currentPhotoPath = null
            bindPhotoState()
        }
        binding.btnSave.setOnClickListener { save() }
    }

    private fun loadCategories() {
        val app = applicationContext as BudgetApp
        lifecycleScope.launch {
            categories = app.database.categoryDao().getAllForUser(session.getUserId())
            val names = categories.map { it.name }
            binding.spinnerCategory.adapter = ArrayAdapter(
                this@AddExpenseActivity,
                android.R.layout.simple_spinner_dropdown_item,
                if (names.isEmpty()) listOf(getString(R.string.hint_no_categories)) else names
            )
            binding.btnSave.isEnabled = categories.isNotEmpty()
        }
    }

    private fun bindDateTimeFields() {
        binding.textDate.text = DateUtils.formatDate(chosenDateMillis)
        binding.textStart.text = DateUtils.formatMinutes(chosenStartMinutes)
        binding.textEnd.text = DateUtils.formatMinutes(chosenEndMinutes)
    }

    private fun bindPhotoState() {
        val hasPhoto = currentPhotoPath != null
        binding.textPhotoStatus.text =
            if (hasPhoto) getString(R.string.photo_attached) else getString(R.string.no_photo)
        binding.btnRemovePhoto.isEnabled = hasPhoto
    }

    private fun pickDate() {
        val cal = Calendar.getInstance().apply { timeInMillis = chosenDateMillis }
        DatePickerDialog(this, { _, y, m, d ->
            cal.set(y, m, d)
            chosenDateMillis = DateUtils.startOfDay(cal.timeInMillis)
            bindDateTimeFields()
        }, cal.get(Calendar.YEAR), cal.get(Calendar.MONTH), cal.get(Calendar.DAY_OF_MONTH)).show()
    }

    private fun pickTime(isStart: Boolean) {
        val current = if (isStart) chosenStartMinutes else chosenEndMinutes
        TimePickerDialog(this, { _, h, m ->
            val minutes = h * 60 + m
            if (isStart) chosenStartMinutes = minutes else chosenEndMinutes = minutes
            bindDateTimeFields()
        }, current / 60, current % 60, true).show()
    }

    private fun launchCamera() {
        try {
            val stamp = SimpleDateFormat("yyyyMMdd_HHmmss", Locale.getDefault()).format(Date())
            val dir = File(filesDir, "photos").apply { mkdirs() }
            val file = File(dir, "IMG_$stamp.jpg")
            pendingCameraFile = file
            val uri = FileProvider.getUriForFile(this, "${packageName}.fileprovider", file)
            pendingCameraUri = uri
            takePhotoLauncher.launch(uri)
        } catch (e: Exception) {
            Log.e(TAG, "Could not launch camera", e)
            Toast.makeText(this, R.string.error_camera_unavailable, Toast.LENGTH_LONG).show()
        }
    }

    private fun copyToInternalStorage(uri: Uri): File? {
        return try {
            val dir = File(filesDir, "photos").apply { mkdirs() }
            val stamp = SimpleDateFormat("yyyyMMdd_HHmmss", Locale.getDefault()).format(Date())
            val dest = File(dir, "PICK_$stamp.jpg")
            contentResolver.openInputStream(uri)?.use { input ->
                dest.outputStream().use { output -> input.copyTo(output) }
            }
            dest
        } catch (e: Exception) {
            Log.e(TAG, "Could not copy picked photo", e)
            null
        }
    }

    private fun save() {
        val description = binding.inputDescription.text?.toString()?.trim().orEmpty()
        val amountStr = binding.inputAmount.text?.toString()?.trim().orEmpty()
        if (description.isEmpty()) {
            Toast.makeText(this, R.string.error_description_required, Toast.LENGTH_SHORT).show(); return
        }
        val amount = amountStr.toDoubleOrNull()
        if (amount == null || amount <= 0) {
            Toast.makeText(this, R.string.error_amount_required, Toast.LENGTH_SHORT).show(); return
        }
        if (chosenEndMinutes < chosenStartMinutes) {
            Toast.makeText(this, R.string.error_end_before_start, Toast.LENGTH_SHORT).show(); return
        }
        val position = binding.spinnerCategory.selectedItemPosition
        if (categories.isEmpty() || position !in categories.indices) {
            Toast.makeText(this, R.string.error_category_required, Toast.LENGTH_SHORT).show(); return
        }

        val category = categories[position]
        binding.btnSave.isEnabled = false
        val app = applicationContext as BudgetApp

        lifecycleScope.launch {
            val id = app.database.expenseDao().insert(
                Expense(
                    userId = session.getUserId(),
                    categoryId = category.id,
                    amount = amount,
                    description = description,
                    dateEpochMillis = chosenDateMillis,
                    startTimeMinutes = chosenStartMinutes,
                    endTimeMinutes = chosenEndMinutes,
                    photoPath = currentPhotoPath
                )
            )
            Log.i(TAG, "Inserted expense id=$id amount=$amount cat=${category.name}")
            Toast.makeText(this@AddExpenseActivity, R.string.expense_saved, Toast.LENGTH_SHORT).show()

            // Launch the detail screen via explicit intent — demonstrates Intent usage (POE req).
            startActivity(Intent(this@AddExpenseActivity, ExpenseDetailActivity::class.java)
                .putExtra(ExpenseDetailActivity.EXTRA_EXPENSE_ID, id))
            finish()
        }
    }

    override fun onSupportNavigateUp(): Boolean { finish(); return true }

    companion object { private const val TAG = "AddExpenseActivity" }
}
