import mongoose from 'mongoose';

function connectDB() {
    const mongoUrl = process.env.MONGODB_URL || 'mongodb://localhost:27017/moody-player';
    
    mongoose.connect(mongoUrl)
    .then(() => console.log('✅ MongoDB connected successfully'))
    .catch(err => {
        console.error('❌ MongoDB connection error:', err);
        process.exit(1);
    });
}

export default connectDB;