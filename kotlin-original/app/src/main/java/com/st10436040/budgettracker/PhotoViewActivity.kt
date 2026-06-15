package com.st10436040.budgettracker

import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import com.bumptech.glide.Glide
import com.st10436040.budgettracker.databinding.ActivityPhotoViewBinding
import java.io.File

/**
 * Full-screen photo viewer for expense attachments.
 * Author: Khumela Sendelani (ST10436040)
 */
class PhotoViewActivity : AppCompatActivity() {

    private lateinit var binding: ActivityPhotoViewBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityPhotoViewBinding.inflate(layoutInflater)
        setContentView(binding.root)
        supportActionBar?.setDisplayHomeAsUpEnabled(true)
        title = getString(R.string.title_photo)

        val path = intent.getStringExtra(EXTRA_PATH)
        if (path.isNullOrEmpty()) { finish(); return }
        Glide.with(this).load(File(path)).into(binding.imageFull)
    }

    override fun onSupportNavigateUp(): Boolean { finish(); return true }

    companion object { const val EXTRA_PATH = "extra_path" }
}
