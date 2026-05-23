const multer = require('multer');
const path   = require('path');
const fs     = require('fs');

/**
 * Software Class: FileUploader
 * Configures and exposes Multer upload middleware for avatar and video-thumbnail files.
 */
class FileUploader {
    constructor(uploadDir = 'public/uploads') {
        this.uploadDir = path.join(__dirname, '..', uploadDir);
        this._ensureDir(this.uploadDir);

        this.avatarUpload    = this._buildUploader('avatars',    ['image/jpeg', 'image/png', 'image/webp'], 5);
        this.thumbnailUpload = this._buildUploader('thumbnails', ['image/jpeg', 'image/png', 'image/webp'], 10);
    }

    // ── Private helpers ───────────────────────────────────────

    _ensureDir(dir) {
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    }

    _buildUploader(subfolder, allowedMimes, maxMB) {
        const dest = path.join(this.uploadDir, subfolder);
        this._ensureDir(dest);

        const storage = multer.diskStorage({
            destination: (_req, _file, cb) => cb(null, dest),
            filename:    (_req, file, cb) => {
                const ext      = path.extname(file.originalname).toLowerCase();
                const safeName = `${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`;
                cb(null, safeName);
            }
        });

        const filter = (_req, file, cb) => {
            if (allowedMimes.includes(file.mimetype)) {
                cb(null, true);
            } else {
                cb(new Error(`Only ${allowedMimes.join(', ')} files are allowed.`), false);
            }
        };

        return multer({
            storage,
            fileFilter: filter,
            limits: { fileSize: maxMB * 1024 * 1024 }
        });
    }

    // ── Public middleware factories ───────────────────────────

    /** Returns multer middleware for single avatar upload (field name: 'avatar'). */
    avatar() {
        return this.avatarUpload.single('avatar');
    }

    /** Returns multer middleware for single thumbnail upload (field name: 'thumbnail'). */
    thumbnail() {
        return this.thumbnailUpload.single('thumbnail');
    }
}

module.exports = new FileUploader();
