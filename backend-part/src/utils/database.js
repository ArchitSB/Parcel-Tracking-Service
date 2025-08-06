const mongoose = require('mongoose');

// Add pagination plugin to mongoose
const mongoosePaginate = require('mongoose-paginate-v2');

// Apply pagination to all schemas
mongoose.plugin(mongoosePaginate);

// Database connection helper
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

// Close database connection
const closeDB = async () => {
  try {
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  } catch (error) {
    console.error('Error closing database connection:', error);
  }
};

// Database health check
const dbHealthCheck = () => {
  return mongoose.connection.readyState === 1;
};

module.exports = {
  connectDB,
  closeDB,
  dbHealthCheck
};
