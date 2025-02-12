import mongoose from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcryptjs';

const { Schema } = mongoose;

const userSchema = new Schema({
    nama: {
        type: String,
        required: [true, 'Nama harus diisi'],
        minlength: [3, 'Nama minimal 3 karakter']
    },
    email: {
        type: String,
        required: [true, 'Email harus diisi'],
        validate: {
            validator: validator.isEmail,
            message: 'Email tidak valid'
        },
        unique: true
    },
    password: {
        type: String,
        required: [true, 'Password harus diisi'],
        minlength: [6, 'Password minimal 8 karakter']
    },
    role: {
        type: String,
        enum: ['admin', 'user'],
        default: 'user'
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    emailVerifiedAt: {
        type: Date
    }
});

userSchema.pre('save', async function() {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (reqBody) {
    return await bcrypt.compare(reqBody, this.password);
}

const User = mongoose.model('User', userSchema);

export default User;